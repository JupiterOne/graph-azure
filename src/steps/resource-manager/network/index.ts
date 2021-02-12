import {
  LoadBalancer,
  NetworkInterfaceIPConfiguration,
  NetworkSecurityGroup,
  PublicIPAddress,
  Subnet,
} from '@azure/arm-network/esm/models';
import {
  Entity,
  getRawData,
  Relationship,
  Step,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { ACCOUNT_ENTITY_TYPE, STEP_AD_ACCOUNT } from '../../active-directory';
import { NetworkClient } from './client';
import {
  STEP_RM_NETWORK_INTERFACES,
  STEP_RM_NETWORK_LOAD_BALANCERS,
  STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES,
  STEP_RM_NETWORK_SECURITY_GROUP_RULE_RELATIONSHIPS,
  STEP_RM_NETWORK_SECURITY_GROUPS,
  STEP_RM_NETWORK_VIRTUAL_NETWORKS,
  NetworkEntities,
  NetworkRelationships,
  STEP_RM_NETWORK_AZURE_FIREWALLS,
} from './constants';
import {
  createAzureFirewallEntity,
  createLoadBalancerBackendNicRelationship,
  createLoadBalancerEntity,
  createNetworkInterfaceEntity,
  createNetworkSecurityGroupEntity,
  createNetworkSecurityGroupNicRelationship,
  createNetworkSecurityGroupSubnetRelationship,
  createPublicIPAddressEntity,
  createSecurityGroupRuleMappedRelationship,
  createSecurityGroupRuleSubnetRelationship,
  createSubnetEntity,
  createVirtualNetworkEntity,
  createVirtualNetworkSubnetRelationship,
  processSecurityGroupRules,
} from './converters';
import createResourceGroupResourceRelationship from '../utils/createResourceGroupResourceRelationship';
import {
  RESOURCE_GROUP_ENTITY,
  STEP_RM_RESOURCES_RESOURCE_GROUPS,
} from '../resources';
import {
  createDiagnosticSettingsEntitiesAndRelationshipsForResource,
  diagnosticSettingsEntitiesForResource,
  diagnosticSettingsRelationshipsForResource,
} from '../utils/createDiagnosticSettingsEntitiesAndRelationshipsForResource';

export * from './constants';

type SubnetSecurityGroupMap = {
  [subnetId: string]: NetworkSecurityGroup;
};

export async function fetchAzureFirewalls(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new NetworkClient(instance.config, logger);

  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  await jobState.iterateEntities(
    { _type: RESOURCE_GROUP_ENTITY._type },
    async (resourceGroupEntity) => {
      const { name } = resourceGroupEntity;

      await client.iterateAzureFirewalls(
        name as string,
        async (azureFirewall) => {
          const azureFirewallEntity = createAzureFirewallEntity(
            webLinker,
            azureFirewall,
          );

          await jobState.addEntity(azureFirewallEntity);
          await createResourceGroupResourceRelationship(
            executionContext,
            azureFirewallEntity,
          );
        },
      );
    },
  );
}

export async function fetchNetworkInterfaces(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new NetworkClient(instance.config, logger);

  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  const publicIpAddresses = await jobState.getData<PublicIPAddress[]>(
    'publicIPAddresses',
  );

  const findPublicIPAddresses = (
    ipConfigs: NetworkInterfaceIPConfiguration[] | undefined,
  ): string[] | undefined => {
    if (ipConfigs) {
      const addressesForNIC: string[] = [];
      for (const ipConfig of ipConfigs) {
        const ipAddress = publicIpAddresses.find(
          (i) =>
            i.id === (ipConfig.publicIPAddress && ipConfig.publicIPAddress.id),
        );
        if (ipAddress && ipAddress.ipAddress) {
          addressesForNIC.push(ipAddress.ipAddress);
        }
      }
      return addressesForNIC;
    }
  };

  await client.iterateNetworkInterfaces(async (e) => {
    const networkInterfaceEntity = createNetworkInterfaceEntity(
      webLinker,
      e,
      findPublicIPAddresses(e.ipConfigurations),
    );
    await jobState.addEntity(networkInterfaceEntity);
    await createResourceGroupResourceRelationship(
      executionContext,
      networkInterfaceEntity,
    );
  });
}

export async function fetchPublicIPAddresses(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new NetworkClient(instance.config, logger);

  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  const publicIpAddresses: PublicIPAddress[] = [];
  await client.iteratePublicIPAddresses(async (e) => {
    publicIpAddresses.push(e);
    const publicIpAddressEntity = createPublicIPAddressEntity(webLinker, e);
    await jobState.addEntity(publicIpAddressEntity);
    await createResourceGroupResourceRelationship(
      executionContext,
      publicIpAddressEntity,
    );
    await createDiagnosticSettingsEntitiesAndRelationshipsForResource(
      executionContext,
      publicIpAddressEntity,
    );
  });

  // A simple way to make the set available to dependent steps. Assumes dataset
  // is relatively small. Ideally, we could easily find the stored entity by any
  // property.
  await jobState.setData('publicIPAddresses', publicIpAddresses);
}

export async function fetchLoadBalancers(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new NetworkClient(instance.config, logger);

  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  // A load balancer with multiple ip addresses through a single nic should not
  // produce more than one lb -> nic relationship.
  const loadBalancerNicRelationshipKeys = new Set<string>();

  const createLoadBalancerBackendNicRelationships = (
    lb: LoadBalancer,
  ): Relationship[] | undefined => {
    if (lb.backendAddressPools) {
      const relationships: Relationship[] = [];
      lb.backendAddressPools.forEach((backend) => {
        if (backend.backendIPConfigurations) {
          backend.backendIPConfigurations.forEach((ip) => {
            if (ip.id) {
              /**
               * Need to remove the extra `/ipConfigurations/*` path from the nicId,
               * so that they can be mapped to the `_key` on the `azure_nic` entity.
               * For example:
               * "id": "/subscriptions/<uuid>/resourceGroups/xtest/providers/Microsoft.Network/networkInterfaces/j1234/ipConfigurations/ipconfig1",
               */
              const nicId = ip.id.split('/ipConfigurations')[0];
              const loadBalancerNicRelationship = createLoadBalancerBackendNicRelationship(
                lb,
                nicId,
              );
              if (
                !loadBalancerNicRelationshipKeys.has(
                  loadBalancerNicRelationship._key,
                )
              ) {
                relationships.push(loadBalancerNicRelationship);
                loadBalancerNicRelationshipKeys.add(
                  loadBalancerNicRelationship._key,
                );
              }
            }
          });
        }
      });
      return relationships;
    }
  };

  await client.iterateLoadBalancers(async (e) => {
    const loadBalancerEntity = createLoadBalancerEntity(webLinker, e);
    await jobState.addEntity(loadBalancerEntity);
    await createResourceGroupResourceRelationship(
      executionContext,
      loadBalancerEntity,
    );
    await createDiagnosticSettingsEntitiesAndRelationshipsForResource(
      executionContext,
      loadBalancerEntity,
    );
    const nicRelationships = createLoadBalancerBackendNicRelationships(e);
    if (nicRelationships) {
      await jobState.addRelationships(nicRelationships);
    }
  });
}

export async function fetchNetworkSecurityGroups(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new NetworkClient(instance.config, logger);

  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  const subnetSecurityGroupMap: SubnetSecurityGroupMap = {};

  await client.iterateNetworkSecurityGroups(async (sg) => {
    const sgEntity = createNetworkSecurityGroupEntity(webLinker, sg);
    await jobState.addEntity(sgEntity);

    await createResourceGroupResourceRelationship(executionContext, sgEntity);

    if (sg.networkInterfaces) {
      await jobState.addRelationships(
        sg.networkInterfaces.map((i) =>
          createNetworkSecurityGroupNicRelationship(sg, i),
        ),
      );
    }

    if (sg.subnets) {
      for (const s of sg.subnets) {
        subnetSecurityGroupMap[s.id as string] = sg;
      }
    }

    await createDiagnosticSettingsEntitiesAndRelationshipsForResource(
      executionContext,
      sgEntity,
    );
  });

  await jobState.setData('subnetSecurityGroupMap', subnetSecurityGroupMap);
}

export async function fetchVirtualNetworks(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new NetworkClient(instance.config, logger);

  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  const subnetSecurityGroupMap = await jobState.getData<SubnetSecurityGroupMap>(
    'subnetSecurityGroupMap',
  );

  await client.iterateVirtualNetworks(async (vnet) => {
    if (vnet.subnets) {
      const subnetEntities: Entity[] = [];
      const subnetRelationships: Relationship[] = [];
      for (const subnet of vnet.subnets) {
        const subnetEntity = createSubnetEntity(webLinker, vnet, subnet);
        subnetEntities.push(subnetEntity);
        subnetRelationships.push(
          createVirtualNetworkSubnetRelationship(vnet, subnet),
        );
        const sg = subnetSecurityGroupMap[subnet.id as string];
        if (sg) {
          subnetRelationships.push(
            createNetworkSecurityGroupSubnetRelationship(sg, subnet),
          );
        }
      }
      await jobState.addEntities(subnetEntities);
      await jobState.addRelationships(subnetRelationships);
    }
    const virtualNetworkEntity = createVirtualNetworkEntity(webLinker, vnet);
    await jobState.addEntity(virtualNetworkEntity);
    await createResourceGroupResourceRelationship(
      executionContext,
      virtualNetworkEntity,
    );
    await createDiagnosticSettingsEntitiesAndRelationshipsForResource(
      executionContext,
      virtualNetworkEntity,
    );
  });
}

export async function buildSecurityGroupRuleRelationships(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = executionContext;

  const findSubnetEntitiesForCIDR = async (cidr?: string) => {
    if (!cidr) return null;

    const subnetEntities: Entity[] = [];

    await jobState.iterateEntities(
      { _type: NetworkEntities.SUBNET._type },
      (subnetEntity) => {
        const subnet = getRawData(subnetEntity) as Subnet;
        if (subnet.addressPrefix === cidr) {
          subnetEntities.push(subnetEntity);
        }
      },
    );

    return subnetEntities;
  };

  await jobState.iterateEntities(
    { _type: NetworkEntities.SECURITY_GROUP._type },
    async (sgEntity) => {
      const sg = getRawData(sgEntity) as NetworkSecurityGroup;

      const rules = processSecurityGroupRules(sg);
      for (const rule of rules) {
        for (const target of rule.targets) {
          if (
            target._class === NetworkEntities.SUBNET._class &&
            target._type === NetworkEntities.SUBNET._type
          ) {
            const subnetEntities = await findSubnetEntitiesForCIDR(
              target.CIDR as string,
            );
            if (subnetEntities?.length) {
              for (const subnetEntity of subnetEntities) {
                await jobState.addRelationship(
                  createSecurityGroupRuleSubnetRelationship(
                    sgEntity,
                    rule,
                    subnetEntity,
                  ),
                );
              }
            } else {
              logger.warn(
                { securityGroup: sg.id, rule: rule.id, cidr: target.CIDR },
                'Rule target thought to be a private subnet, none found matching CIDR!',
              );
            }
          } else {
            await jobState.addRelationship(
              createSecurityGroupRuleMappedRelationship(sgEntity, rule, target),
            );
          }
        }
      }
    },
  );
}

export const networkSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES,
    name: 'Public IP Addresses',
    entities: [
      NetworkEntities.PUBLIC_IP_ADDRESS,
      ...diagnosticSettingsEntitiesForResource,
    ],
    relationships: [
      NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_PUBLIC_IP_ADDRESS,
      ...diagnosticSettingsRelationshipsForResource,
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchPublicIPAddresses,
  },
  {
    id: STEP_RM_NETWORK_INTERFACES,
    name: 'Network Interfaces',
    entities: [NetworkEntities.NETWORK_INTERFACE],
    relationships: [
      NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_NETWORK_INTERFACE,
    ],
    dependsOn: [
      STEP_AD_ACCOUNT,
      STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES,
      STEP_RM_RESOURCES_RESOURCE_GROUPS,
    ],
    executionHandler: fetchNetworkInterfaces,
  },
  {
    id: STEP_RM_NETWORK_VIRTUAL_NETWORKS,
    name: 'Virtual Networks',
    entities: [
      NetworkEntities.VIRTUAL_NETWORK,
      NetworkEntities.SUBNET,
      ...diagnosticSettingsEntitiesForResource,
    ],
    relationships: [
      NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_VIRTUAL_NETWORK,
      NetworkRelationships.NETWORK_VIRTUAL_NETWORK_CONTAINS_NETWORK_SUBNET,
      NetworkRelationships.NETWORK_SECURITY_GROUP_PROTECTS_NETWORK_SUBNET,
      ...diagnosticSettingsRelationshipsForResource,
    ],
    dependsOn: [
      STEP_AD_ACCOUNT,
      STEP_RM_NETWORK_SECURITY_GROUPS,
      STEP_RM_RESOURCES_RESOURCE_GROUPS,
    ],
    executionHandler: fetchVirtualNetworks,
  },
  {
    id: STEP_RM_NETWORK_SECURITY_GROUPS,
    name: 'Network Security Groups',
    entities: [
      NetworkEntities.SECURITY_GROUP,
      ...diagnosticSettingsEntitiesForResource,
    ],
    relationships: [
      NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_SECURITY_GROUP,
      NetworkRelationships.NETWORK_SECURITY_GROUP_PROTECTS_NETWORK_INTERFACE,
      ...diagnosticSettingsRelationshipsForResource,
    ],
    // SECURITY_GROUP_RULE_RELATIONSHIP_TYPE doesn't seem to exist here.
    dependsOn: [
      STEP_AD_ACCOUNT,
      STEP_RM_NETWORK_INTERFACES,
      STEP_RM_RESOURCES_RESOURCE_GROUPS,
    ],
    executionHandler: fetchNetworkSecurityGroups,
  },
  {
    id: STEP_RM_NETWORK_LOAD_BALANCERS,
    name: 'Load Balancers',
    entities: [
      NetworkEntities.LOAD_BALANCER,
      ...diagnosticSettingsEntitiesForResource,
    ],
    relationships: [
      NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_LOAD_BALANCER,
      NetworkRelationships.NETWORK_LOAD_BALANCER_CONNECTS_NETWORK_INTERFACE,
      ...diagnosticSettingsRelationshipsForResource,
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchLoadBalancers,
  },
  {
    id: STEP_RM_NETWORK_AZURE_FIREWALLS,
    name: 'Network Azure Firewalls',
    entities: [
      NetworkEntities.AZURE_FIREWALL,
      ...diagnosticSettingsEntitiesForResource,
    ],
    relationships: [
      NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_AZURE_FIREWALL,
      ...diagnosticSettingsRelationshipsForResource,
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchAzureFirewalls,
  },
  {
    id: STEP_RM_NETWORK_SECURITY_GROUP_RULE_RELATIONSHIPS,
    name: 'Network Security Group Rules',
    entities: [],
    relationships: [
      NetworkRelationships.NETWORK_SECURITY_GROUP_ALLOWS_NETWORK_SUBNET,
      NetworkRelationships.NETWORK_SUBNET_ALLOWS_NETWORK_SECURITY_GROUP,
      NetworkRelationships.NETWORK_SECURITY_GROUP_DENIES_NETWORK_SUBNET,
      NetworkRelationships.NETWORK_SUBNET_DENIES_NETWORK_SECURITY_GROUP,
    ],
    dependsOn: [
      STEP_AD_ACCOUNT,
      STEP_RM_NETWORK_SECURITY_GROUPS,
      STEP_RM_NETWORK_VIRTUAL_NETWORKS,
    ],
    executionHandler: buildSecurityGroupRuleRelationships,
  },
];
