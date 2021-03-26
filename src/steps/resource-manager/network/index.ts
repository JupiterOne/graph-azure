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
  createDirectRelationship,
  RelationshipClass,
  IntegrationError,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { getAccountEntity, STEP_AD_ACCOUNT } from '../../active-directory';
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
  STEP_RM_NETWORK_WATCHERS,
  STEP_RM_NETWORK_FLOW_LOGS,
  STEP_RM_NETWORK_LOCATION_WATCHERS,
} from './constants';
import {
  createAzureFirewallEntity,
  createLoadBalancerBackendNicRelationship,
  createLoadBalancerEntity,
  createNetworkInterfaceEntity,
  createNetworkSecurityGroupEntity,
  createNetworkSecurityGroupNicRelationship,
  createNetworkSecurityGroupSubnetRelationship,
  createNetworkWatcherEntity,
  createNsgFlowLogEntity,
  createPublicIPAddressEntity,
  createSecurityGroupRuleMappedRelationship,
  createSecurityGroupRuleSubnetRelationship,
  createSubnetEntity,
  createVirtualNetworkEntity,
  createVirtualNetworkSubnetRelationship,
  processSecurityGroupRules,
} from './converters';
import createResourceGroupResourceRelationship, {
  RESOURCE_GROUP_RESOURCE_RELATIONSHIP_CLASS,
} from '../utils/createResourceGroupResourceRelationship';
import {
  RESOURCE_GROUP_ENTITY,
  STEP_RM_RESOURCES_RESOURCE_GROUPS,
} from '../resources';
import {
  createDiagnosticSettingsEntitiesAndRelationshipsForResource,
  diagnosticSettingsEntitiesForResource,
  getDiagnosticSettingsRelationshipsForResource,
} from '../utils/createDiagnosticSettingsEntitiesAndRelationshipsForResource';
import { steps as storageSteps } from '../storage';
import {
  setDataKeys as subscriptionsSetDataKeys,
  SetDataTypes as SubscriptionSetDataTypes,
  steps as subscriptionSteps,
} from '../subscriptions/constants';

export * from './constants';

type SubnetSecurityGroupMap = {
  [subnetId: string]: NetworkSecurityGroup;
};

export async function fetchAzureFirewalls(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new NetworkClient(instance.config, logger);

  const accountEntity = await getAccountEntity(jobState);
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
          await createDiagnosticSettingsEntitiesAndRelationshipsForResource(
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

  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  const publicIpAddresses = (await jobState.getData<PublicIPAddress[]>(
    'publicIPAddresses',
  ))!;

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

  const accountEntity = await getAccountEntity(jobState);
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

  const accountEntity = await getAccountEntity(jobState);
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

  const accountEntity = await getAccountEntity(jobState);
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

  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  const subnetSecurityGroupMap =
    (await jobState.getData<SubnetSecurityGroupMap>(
      'subnetSecurityGroupMap',
    )) || {};

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

export async function fetchNetworkWatchers(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new NetworkClient(instance.config, logger);

  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  await jobState.iterateEntities(
    { _type: RESOURCE_GROUP_ENTITY._type },
    async (resourceGroupEntity) => {
      await client.iterateNetworkWatchers(
        resourceGroupEntity.name as string,
        async (networkWatcher) => {
          const networkWatcherEntity = await jobState.addEntity(
            createNetworkWatcherEntity(webLinker, networkWatcher),
          );
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RESOURCE_GROUP_RESOURCE_RELATIONSHIP_CLASS,
              from: resourceGroupEntity,
              to: networkWatcherEntity,
            }),
          );
        },
      );
    },
  );
}

export async function buildLocationNetworkWatcherRelationships(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, jobState } = executionContext;

  const locationNameMap = await jobState.getData<
    SubscriptionSetDataTypes['locationNameMap']
  >(subscriptionsSetDataKeys.locationNameMap);
  if (!locationNameMap) {
    throw new IntegrationError({
      message:
        'Could not find locationNameMap data in job state; cannot build location => network watcher relationships.',
      code: 'LOCATION_NAME_MAP_NOT_FOUND',
    });
  }

  const locations = Object.keys(locationNameMap);
  await jobState.iterateEntities(
    { _type: NetworkEntities.NETWORK_WATCHER._type },
    async (networkWatcherEntity) => {
      const locationEntity =
        locationNameMap[networkWatcherEntity.location as string];

      if (locationEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: locationEntity,
            to: networkWatcherEntity,
          }),
        );
      } else {
        logger.warn(
          {
            networkWatcherLocation: networkWatcherEntity.location,
            locations,
          },
          'WARNING: Could not find matching location for network watcher. The locationNameMap may be constructed incorrectly',
        );
      }
    },
  );
}

export async function fetchNetworkSecurityGroupFlowLogs(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new NetworkClient(instance.config, logger);

  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  await jobState.iterateEntities(
    { _type: NetworkEntities.NETWORK_WATCHER._type },
    async (networkWatcherEntity) => {
      await client.iterateNetworkSecurityGroupFlowLogs(
        {
          name: networkWatcherEntity.name as string,
          id: networkWatcherEntity.id as string,
        },
        async (nsgFlowLog) => {
          const nsgFlowLogEntity = await jobState.addEntity(
            createNsgFlowLogEntity(webLinker, nsgFlowLog),
          );
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: networkWatcherEntity,
              to: nsgFlowLogEntity,
            }),
          );

          const networkSecurityGroupEntity = await jobState.findEntity(
            nsgFlowLog.targetResourceId,
          );
          if (networkSecurityGroupEntity) {
            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.HAS,
                from: networkSecurityGroupEntity,
                to: nsgFlowLogEntity,
              }),
            );
          } else {
            logger.warn(
              {
                nsgFlowLogId: nsgFlowLog.id,
                securityGroupId: nsgFlowLog.targetResourceId,
              },
              'Could not find network security group by ID; no relationship can be built between flow log -> security group',
            );
          }

          const storageAccountEntity = await jobState.findEntity(
            nsgFlowLog.storageId,
          );
          if (storageAccountEntity) {
            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.USES,
                from: nsgFlowLogEntity,
                to: storageAccountEntity,
              }),
            );
          } else {
            logger.warn(
              {
                nsgFlowLogId: nsgFlowLog.id,
                storageId: nsgFlowLog.storageId,
              },
              'Could not find storage account by ID; no relationship can be built between flow log -> storage account',
            );
          }
        },
      );
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
      ...getDiagnosticSettingsRelationshipsForResource(
        NetworkEntities.PUBLIC_IP_ADDRESS._type,
      ),
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
      ...getDiagnosticSettingsRelationshipsForResource(
        NetworkEntities.VIRTUAL_NETWORK._type,
      ),
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
      ...getDiagnosticSettingsRelationshipsForResource(
        NetworkEntities.SECURITY_GROUP._type,
      ),
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
      ...getDiagnosticSettingsRelationshipsForResource(
        NetworkEntities.LOAD_BALANCER._type,
      ),
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
      ...getDiagnosticSettingsRelationshipsForResource(
        NetworkEntities.AZURE_FIREWALL._type,
      ),
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
  {
    id: STEP_RM_NETWORK_WATCHERS,
    name: 'Network Watchers',
    entities: [NetworkEntities.NETWORK_WATCHER],
    relationships: [NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_WATCHER],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchNetworkWatchers,
  },
  {
    id: STEP_RM_NETWORK_LOCATION_WATCHERS,
    name: 'Location-Network Watcher Relationships',
    entities: [],
    relationships: [NetworkRelationships.LOCATION_HAS_NETWORK_WATCHER],
    dependsOn: [STEP_RM_NETWORK_WATCHERS, subscriptionSteps.LOCATIONS],
    executionHandler: buildLocationNetworkWatcherRelationships,
  },
  {
    id: STEP_RM_NETWORK_FLOW_LOGS,
    name: 'Network Securtiy Group Flow Logs',
    entities: [NetworkEntities.SECURITY_GROUP_FLOW_LOGS],
    relationships: [
      NetworkRelationships.NETWORK_WATCHER_HAS_FLOW_LOGS,
      NetworkRelationships.NETWORK_SECURITY_GROUP_HAS_FLOW_LOGS,
      NetworkRelationships.NETWORK_SECURITY_GROUP_FLOW_LOGS_USES_STORAGE_ACCOUNT,
    ],
    dependsOn: [
      STEP_RM_NETWORK_WATCHERS,
      STEP_RM_NETWORK_SECURITY_GROUPS,
      storageSteps.STORAGE_ACCOUNTS,
    ],
    executionHandler: fetchNetworkSecurityGroupFlowLogs,
  },
];
