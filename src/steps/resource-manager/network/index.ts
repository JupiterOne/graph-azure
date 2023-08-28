import {
  LoadBalancer,
  NetworkInterfaceIPConfiguration,
  NetworkSecurityGroup,
  PrivateEndpoint,
  PublicIPAddress,
  Subnet,
} from '@azure/arm-network/esm/models';
import {
  Entity,
  getRawData,
  Relationship,
  createDirectRelationship,
  RelationshipClass,
  IntegrationError,
  createMappedRelationship,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { INTERNET } from '@jupiterone/data-model';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, AzureIntegrationStep } from '../../../types';
import { getAccountEntity } from '../../active-directory';
import { STEP_AD_ACCOUNT } from '../../active-directory/constants';
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
  STEP_RM_NETWORK_FIREWALLS,
  STEP_RM_NETWORK_WATCHERS,
  STEP_RM_NETWORK_FLOW_LOGS,
  STEP_RM_NETWORK_LOCATION_WATCHERS,
  STEP_RM_NETWORK_PRIVATE_ENDPOINTS,
  STEP_RM_NETWORK_PRIVATE_ENDPOINT_SUBNET_RELATIONSHIPS,
  STEP_RM_NETWORK_PRIVATE_ENDPOINTS_NIC_RELATIONSHIPS,
  STEP_RM_NETWORK_PRIVATE_ENDPOINTS_RESOURCE_RELATIONSHIPS,
  NetworkMappedRelationships,
  STEP_RM_NETWORK_FIREWALL_POLICIES,
  STEP_RM_NETWORK_FIREWALL_POLICY_RELATIONSHIPS,
  FIREWALL_POLICY_PARENT_CHILDREN_MAP,
  STEP_RM_NETWORK_FIREWALL_RULE_RELATIONSHIPS,
  POLICY_INCLUDED_IN_FIREWALLS_MAP,
  FIREWALL_RULE_RELATIONSHIP_TYPE,
} from './constants';
import {
  createAzureFirewallEntity,
  createFirewallPolicyEntity,
  createFirewallPolicyKey,
  createLoadBalancerBackendNicRelationship,
  createLoadBalancerEntity,
  createNetworkInterfaceEntity,
  createNetworkSecurityGroupEntity,
  createNetworkSecurityGroupNicRelationship,
  createNetworkSecurityGroupSubnetRelationship,
  createNetworkWatcherEntity,
  createNsgFlowLogEntity,
  createPrivateEndpointEntity,
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
} from '../resources/constants';
import {
  createDiagnosticSettingsEntitiesAndRelationshipsForResource,
  diagnosticSettingsEntitiesForResource,
  getDiagnosticSettingsRelationshipsForResource,
} from '../utils/createDiagnosticSettingsEntitiesAndRelationshipsForResource';
import { steps as storageSteps } from '../storage/constants';
import {
  setDataKeys as subscriptionsSetDataKeys,
  SetDataTypes as SubscriptionSetDataTypes,
  steps as subscriptionSteps,
} from '../subscriptions/constants';
import { ResourceGroup } from '@azure/arm-resources/esm/models';
import { getResourceManagerSteps } from '../../../getStepStartStates';
import {
  FirewallPolicyRuleCollectionGroup,
  NetworkRule,
} from '@azure/arm-network-latest';
import parseRulePortRange from './converters/parseRulePortRange';
import { hasInternetAddress } from '../../../azure/utils';
import { RulePortRange } from './converters/types';

interface SubnetSecurityGroupMap {
  [subnetId: string]: NetworkSecurityGroup;
}

interface RuleProperties {
  _type: string;
  _class: RelationshipClass;
  displayName: string;
  protocols?: string;
  egress: boolean;
  outbound: boolean;
  ingress: boolean;
  inbound: boolean;
  fromPort?: number;
  toPort?: number;
  portRange: string;
  ruleGroupId?: string;
  ruleName?: string;
}

interface BuildRulePropertiesParams {
  rule: NetworkRule & { actionType: string };
  direction: 'Inbound' | 'Outbound';
  portRange: RulePortRange;
  ruleGroupId?: string;
}

export async function fetchAzureFirewalls(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new NetworkClient(instance.config, logger);

  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const policyIncludedInFirewallsMap = new Map<string, string[]>();

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

          if (azureFirewall.firewallPolicy?.id) {
            const firewallPolicyKey = createFirewallPolicyKey(
              azureFirewall.firewallPolicy.id,
            );
            if (!jobState.hasKey(firewallPolicyKey)) {
              return;
            }
            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.HAS,
                fromKey: azureFirewallEntity._key,
                fromType: NetworkEntities.AZURE_FIREWALL._type,
                toKey: firewallPolicyKey,
                toType: NetworkEntities.FIREWALL_POLICY._type,
              }),
            );
            if (!policyIncludedInFirewallsMap.has(firewallPolicyKey)) {
              policyIncludedInFirewallsMap.set(firewallPolicyKey, []);
            }
            policyIncludedInFirewallsMap.set(firewallPolicyKey, [
              ...(policyIncludedInFirewallsMap.get(firewallPolicyKey) || []),
              azureFirewallEntity._key,
            ]);
          }
        },
      );
    },
  );

  await jobState.setData(
    POLICY_INCLUDED_IN_FIREWALLS_MAP,
    policyIncludedInFirewallsMap,
  );
}

export async function fetchFirewallPolicies(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new NetworkClient(instance.config, logger);

  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  const policyParentChildrenMap = new Map<string, string[]>();

  await jobState.iterateEntities(
    { _type: RESOURCE_GROUP_ENTITY._type },
    async (resourceGroupEntity) => {
      const { name } = resourceGroupEntity;

      await client.iterateFirewallPolicies(
        name as string,
        async (firewallPolicy) => {
          const firewallPolicyEntity = createFirewallPolicyEntity(
            webLinker,
            firewallPolicy,
          );

          if (!firewallPolicyEntity) {
            return;
          }

          if (firewallPolicy.childPolicies?.length) {
            policyParentChildrenMap.set(
              firewallPolicyEntity._key,
              firewallPolicy.childPolicies
                .filter(({ id }) => id)
                .map(({ id }) => createFirewallPolicyKey(id as string)),
            );
          }

          await jobState.addEntity(firewallPolicyEntity);
        },
      );
    },
  );

  await jobState.setData(
    FIREWALL_POLICY_PARENT_CHILDREN_MAP,
    policyParentChildrenMap,
  );
}

export async function buildFirewallRuleRelationships(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new NetworkClient(instance.config, logger);

  const policyIncludedInFirewallsMap = (await jobState.getData(
    POLICY_INCLUDED_IN_FIREWALLS_MAP,
  )) as Map<string, string[]>;

  const policyRulesMap = new Map<string, RuleProperties[]>();
  const policyBasePolicyMap = new Map<string, string | null>();

  await jobState.iterateEntities(
    { _type: NetworkEntities.FIREWALL_POLICY._type },
    async (firewallPolicyEntity) => {
      const {
        id: policyId,
        name: policyName,
        basePolicy,
      } = firewallPolicyEntity;
      policyBasePolicyMap.set(
        firewallPolicyEntity._key,
        basePolicy ? createFirewallPolicyKey(basePolicy as string) : null,
      );
      const resourceGroupName = (policyId as string).split('/')[4];
      if (!resourceGroupName) {
        return;
      }
      await client.iterateFirewallPolicyRuleGroups(
        instance.config.subscriptionId as string,
        resourceGroupName,
        policyName as string,
        (ruleGroup) => {
          const rules = processFirewallCollectionGroupRules(ruleGroup);
          for (const rule of rules) {
            const targetPortRanges = (rule.destinationPorts || []).map(
              parseRulePortRange,
            );
            for (const portRange of targetPortRanges) {
              let direction: 'Inbound' | 'Outbound';
              const isInboundRule =
                rule.sourceAddresses?.length &&
                hasInternetAddress(rule.sourceAddresses);
              const isOutboundRule =
                rule.destinationAddresses?.length &&
                hasInternetAddress(rule.destinationAddresses);
              if (isInboundRule) {
                direction = 'Inbound';
              } else if (isOutboundRule) {
                direction = 'Outbound';
              } else {
                // East-west traffic
                continue;
              }

              const ruleProperties = buildRuleProperties({
                rule,
                direction,
                portRange,
                ruleGroupId: ruleGroup.id,
              });
              if (!policyRulesMap.has(firewallPolicyEntity._key)) {
                policyRulesMap.set(firewallPolicyEntity._key, []);
              }
              policyRulesMap.set(firewallPolicyEntity._key, [
                ...(policyRulesMap.get(firewallPolicyEntity._key) || []),
                ruleProperties,
              ]);
            }
          }
        },
      );
    },
  );

  for (const policyKey of policyBasePolicyMap.keys()) {
    const firewallKeys = policyIncludedInFirewallsMap.get(policyKey) || [];
    const getRecurRuleProperties = (policyKey: string): RuleProperties[] => {
      const basePolicy = policyBasePolicyMap.get(policyKey);
      return [
        ...(policyRulesMap.get(policyKey) || []),
        ...(basePolicy ? getRecurRuleProperties(basePolicy) : []),
      ];
    };

    const rulePropertiesArr = getRecurRuleProperties(policyKey);
    for (const ruleProperties of rulePropertiesArr) {
      const mappedRelationships = firewallKeys.map((firewallKey) =>
        createMappedRelationship({
          _class: ruleProperties._class,
          _mapping: {
            relationshipDirection: ruleProperties.ingress
              ? RelationshipDirection.REVERSE
              : RelationshipDirection.FORWARD,
            sourceEntityKey: firewallKey,
            targetFilterKeys: [['_key']],
            targetEntity: INTERNET,
            skipTargetCreation: false,
          },
          properties: {
            ...ruleProperties,
            _key: `${FIREWALL_RULE_RELATIONSHIP_TYPE}:${firewallKey}:${
              ruleProperties.ruleGroupId ?? ''
            }:${(ruleProperties.ruleName ?? '')
              .toLowerCase()
              .replace(/ /g, '_')}:${ruleProperties.portRange}:internet`,
          },
        }),
      );
      await jobState.addRelationships(mappedRelationships);
    }
  }
}

function processFirewallCollectionGroupRules(
  ruleGroup: FirewallPolicyRuleCollectionGroup,
): (NetworkRule & { actionType: string })[] {
  const rules: (NetworkRule & { actionType: string })[] = [];
  for (const ruleCollection of ruleGroup.ruleCollections || []) {
    if (!('action' in ruleCollection)) {
      continue;
    }
    const actionType = ruleCollection.action?.type;
    if (!actionType || !['Allow', 'Deny'].includes(actionType)) {
      continue;
    }
    const networkRules = (ruleCollection.rules || []).filter(
      (rule) => rule.ruleType === 'NetworkRule',
    ) as NetworkRule[];
    rules.push(
      ...networkRules.map((rule) => ({
        ...rule,
        actionType,
      })),
    );
  }
  return rules;
}

function buildRuleProperties({
  rule,
  direction,
  portRange,
  ruleGroupId,
}: BuildRulePropertiesParams): RuleProperties {
  const relationshipClass =
    rule.actionType === 'Allow'
      ? RelationshipClass.ALLOWS
      : RelationshipClass.DENIES;
  return {
    _type: FIREWALL_RULE_RELATIONSHIP_TYPE,
    _class: relationshipClass,
    displayName: relationshipClass,
    protocols: rule.ipProtocols?.join(','),
    egress: direction !== 'Inbound',
    outbound: direction !== 'Inbound',
    ingress: direction === 'Inbound',
    inbound: direction === 'Inbound',
    fromPort: portRange.fromPort,
    toPort: portRange.toPort,
    portRange: portRange.portRange,
    ruleGroupId,
    ruleName: rule.name,
  };
}

export async function buildFirewallPoliciesRelationships(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState } = executionContext;
  const policyParentChildrenMap = (await jobState.getData(
    FIREWALL_POLICY_PARENT_CHILDREN_MAP,
  )) as Map<string, string[]>;

  for (const [parentPolicyKey, childrenPolicyKeys] of policyParentChildrenMap) {
    await jobState.addRelationships(
      childrenPolicyKeys
        .filter((childPolicyKey) => jobState.hasKey(childPolicyKey))
        .map((childPolicyKey) =>
          createDirectRelationship({
            _class: RelationshipClass.EXTENDS,
            fromKey: childPolicyKey,
            fromType: NetworkEntities.FIREWALL_POLICY._type,
            toKey: parentPolicyKey,
            toType: NetworkEntities.FIREWALL_POLICY._type,
          }),
        ),
    );
  }
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
              const loadBalancerNicRelationship =
                createLoadBalancerBackendNicRelationship(lb, nicId);
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

export async function fetchPrivateEndpoints(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new NetworkClient(instance.config, logger);

  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  await jobState.iterateEntities(
    { _type: RESOURCE_GROUP_ENTITY._type },
    async (resourceGroupEntity) => {
      const resourceGroup = getRawData<ResourceGroup>(resourceGroupEntity)!;
      await client.iteratePrivateEndpoints(
        resourceGroup.name!,
        async (privateEndpoint) => {
          const privateEndpointEntity = await jobState.addEntity(
            createPrivateEndpointEntity(webLinker, privateEndpoint),
          );
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RESOURCE_GROUP_RESOURCE_RELATIONSHIP_CLASS,
              from: resourceGroupEntity,
              to: privateEndpointEntity,
            }),
          );
        },
      );
    },
  );
}

export async function buildPrivateEndpointSubnetRelationships(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: NetworkEntities.PRIVATE_ENDPOINT._type },
    async (privateEndpointEntity) => {
      const privateEndpoint = getRawData<PrivateEndpoint>(
        privateEndpointEntity,
      )!;

      const subnetId = privateEndpoint.subnet?.id;
      const subnetEntity = await jobState.findEntity(subnetId!);

      if (!subnetEntity) {
        logger.info(
          {
            privateEndpointId: privateEndpoint.id,
            subnetId: privateEndpoint.subnet?.id,
          },
          'Could not find subnet defined by private endpoint. Skipping relationship.',
        );
        return;
      }

      await jobState.addRelationship(
        createDirectRelationship({
          from: subnetEntity,
          _class: RelationshipClass.HAS,
          to: privateEndpointEntity,
        }),
      );
    },
  );
}

export async function buildPrivateEndpointNetworkInterfaceRelationships(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: NetworkEntities.PRIVATE_ENDPOINT._type },
    async (privateEndpointEntity) => {
      const privateEndpoint = getRawData<PrivateEndpoint>(
        privateEndpointEntity,
      )!;

      for (const networkInterface of privateEndpoint.networkInterfaces || []) {
        const networkInterfaceEntity = await jobState.findEntity(
          networkInterface.id!,
        );

        if (!networkInterfaceEntity) {
          logger.info(
            {
              privateEndpointId: privateEndpoint.id,
              networkInterfaceId: networkInterface.id,
            },
            'Could not find network interface defined by private endpoint. Skipping relationship.',
          );
          return;
        }

        await jobState.addRelationship(
          createDirectRelationship({
            from: privateEndpointEntity,
            _class: RelationshipClass.USES,
            to: networkInterfaceEntity,
          }),
        );
      }
    },
  );
}

export async function buildPrivateEndpointResourceRelationships(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: NetworkEntities.PRIVATE_ENDPOINT._type },
    async (privateEndpointEntity) => {
      const privateEndpoint = getRawData<PrivateEndpoint>(
        privateEndpointEntity,
      )!;

      for (const privateLinkServiceConnection of privateEndpoint.privateLinkServiceConnections ||
        []) {
        const resourceEntity = await jobState.findEntity(
          privateLinkServiceConnection.privateLinkServiceId!,
        );

        if (!resourceEntity) {
          logger.info(
            {
              privateEndpointId: privateEndpoint.id,
              privateLinkServiceConnectionId: privateLinkServiceConnection.id,
            },
            'Could not find linked resource defined by private endpoint. Skipping relationship.',
          );
          return;
        }

        await jobState.addRelationship(
          createDirectRelationship({
            from: privateEndpointEntity,
            _class: RelationshipClass.CONNECTS,
            to: resourceEntity,
            properties: {
              etag: privateLinkServiceConnection.etag,
              name: privateLinkServiceConnection.name,
              'privateLinkServiceConnectionState.actionsRequired':
                privateLinkServiceConnection.privateLinkServiceConnectionState
                  ?.actionsRequired,
              'privateLinkServiceConnectionState.description':
                privateLinkServiceConnection.privateLinkServiceConnectionState
                  ?.description,
              'privateLinkServiceConnectionState.status':
                privateLinkServiceConnection.privateLinkServiceConnectionState
                  ?.status,
              privateLinkServiceId:
                privateLinkServiceConnection.privateLinkServiceId,
              provisioningState: privateLinkServiceConnection.provisioningState,
              type: privateLinkServiceConnection.type,
            },
          }),
        );
      }
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
      const locationProps =
        locationNameMap[networkWatcherEntity.location as string];

      if (locationProps) {
        await jobState.addRelationship(
          createMappedRelationship({
            _class: RelationshipClass.HAS,
            _type:
              NetworkMappedRelationships.LOCATION_HAS_NETWORK_WATCHER._type,
            source: networkWatcherEntity,
            target: locationProps,
            targetFilterKeys: [['_key']],
            relationshipDirection: RelationshipDirection.REVERSE,
            skipTargetCreation: false,
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

export const networkSteps: AzureIntegrationStep[] = [
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
        NetworkEntities.PUBLIC_IP_ADDRESS,
      ),
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchPublicIPAddresses,
    rolePermissions: [
      'Microsoft.Network/publicIPAddresses/read',
      'Microsoft.Insights/DiagnosticSettings/Read',
    ],
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
    rolePermissions: ['Microsoft.Network/networkInterfaces/read'],
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
        NetworkEntities.VIRTUAL_NETWORK,
      ),
    ],
    dependsOn: [
      STEP_AD_ACCOUNT,
      STEP_RM_NETWORK_SECURITY_GROUPS,
      STEP_RM_RESOURCES_RESOURCE_GROUPS,
    ],
    executionHandler: fetchVirtualNetworks,
    rolePermissions: [
      'Microsoft.Network/virtualNetworks/read',
      'Microsoft.Insights/DiagnosticSettings/Read',
    ],
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
        NetworkEntities.SECURITY_GROUP,
      ),
    ],
    // SECURITY_GROUP_RULE_RELATIONSHIP_TYPE doesn't seem to exist here.
    dependsOn: [
      STEP_AD_ACCOUNT,
      STEP_RM_NETWORK_INTERFACES,
      STEP_RM_RESOURCES_RESOURCE_GROUPS,
    ],
    executionHandler: fetchNetworkSecurityGroups,
    rolePermissions: [
      'Microsoft.Network/networkSecurityGroups/read',
      'Microsoft.Insights/DiagnosticSettings/Read',
    ],
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
        NetworkEntities.LOAD_BALANCER,
      ),
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchLoadBalancers,
    rolePermissions: [
      'Microsoft.Network/loadBalancers/read',
      'Microsoft.Insights/DiagnosticSettings/Read',
    ],
  },
  {
    id: STEP_RM_NETWORK_FIREWALLS,
    name: 'Network Azure Firewalls',
    entities: [
      NetworkEntities.AZURE_FIREWALL,
      ...diagnosticSettingsEntitiesForResource,
    ],
    relationships: [
      NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_AZURE_FIREWALL,
      NetworkRelationships.NETWORK_AZURE_FIREWALL_HAS_FIREWALL_POLICY,
      ...getDiagnosticSettingsRelationshipsForResource(
        NetworkEntities.AZURE_FIREWALL,
      ),
    ],
    dependsOn: [
      STEP_AD_ACCOUNT,
      STEP_RM_RESOURCES_RESOURCE_GROUPS,
      STEP_RM_NETWORK_FIREWALL_POLICIES,
    ],
    executionHandler: fetchAzureFirewalls,
    rolePermissions: [
      'Microsoft.Network/azurefirewalls/read',
      'Microsoft.Insights/DiagnosticSettings/Read',
    ],
  },
  {
    id: STEP_RM_NETWORK_FIREWALL_POLICIES,
    name: 'Network Firewall Policies',
    entities: [NetworkEntities.FIREWALL_POLICY],
    relationships: [],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchFirewallPolicies,
    rolePermissions: ['Microsoft.Network/firewallPolicies/Read'],
  },
  {
    id: STEP_RM_NETWORK_FIREWALL_RULE_RELATIONSHIPS,
    name: 'Network Firewall Rules Relationships',
    entities: [],
    relationships: [],
    mappedRelationships: [
      NetworkMappedRelationships.FIREWALL_ALLOWS_INTERNET_FORWARD,
      NetworkMappedRelationships.FIREWALL_ALLOWS_INTERNET_REVERSE,
      NetworkMappedRelationships.FIREWALL_DENIES_INTERNET_FORWARD,
      NetworkMappedRelationships.FIREWALL_DENIES_INTERNET_REVERSE,
    ],
    dependsOn: [STEP_RM_NETWORK_FIREWALLS, STEP_RM_NETWORK_FIREWALL_POLICIES],
    executionHandler: buildFirewallRuleRelationships,
    rolePermissions: [
      'Microsoft.Network/firewallPolicies/ruleCollectionGroups/Read',
    ],
  },
  {
    id: STEP_RM_NETWORK_FIREWALL_POLICY_RELATIONSHIPS,
    name: 'Network Firewall Policy Relationships',
    entities: [],
    relationships: [
      NetworkRelationships.NETWORK_FIREWALL_POLICY_EXTENDS_FIREWALL_POLICY,
    ],
    dependsOn: [STEP_RM_NETWORK_FIREWALL_POLICIES],
    executionHandler: buildFirewallPoliciesRelationships,
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
    rolePermissions: ['Microsoft.Network/networkWatchers/read'],
  },
  {
    id: STEP_RM_NETWORK_PRIVATE_ENDPOINTS,
    name: 'Private Endpoints',
    entities: [NetworkEntities.PRIVATE_ENDPOINT],
    relationships: [NetworkRelationships.RESOURCE_GROUP_HAS_PRIVATE_ENDPOINT],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchPrivateEndpoints,
    rolePermissions: ['Microsoft.Network/privateEndpoints/read'],
  },
  {
    id: STEP_RM_NETWORK_PRIVATE_ENDPOINT_SUBNET_RELATIONSHIPS,
    name: 'Private Endpoint to Subnet Relationships',
    entities: [],
    relationships: [NetworkRelationships.NETWORK_SUBNET_HAS_PRIVATE_ENDPOINT],
    dependsOn: [
      STEP_RM_NETWORK_PRIVATE_ENDPOINTS,
      STEP_RM_NETWORK_VIRTUAL_NETWORKS,
    ],
    executionHandler: buildPrivateEndpointSubnetRelationships,
  },
  {
    id: STEP_RM_NETWORK_PRIVATE_ENDPOINTS_NIC_RELATIONSHIPS,
    name: 'Private Endpoint to Network Interface Relationships',
    entities: [],
    relationships: [NetworkRelationships.PRIVATE_ENDPOINT_USES_NIC],
    dependsOn: [STEP_RM_NETWORK_PRIVATE_ENDPOINTS, STEP_RM_NETWORK_INTERFACES],
    executionHandler: buildPrivateEndpointNetworkInterfaceRelationships,
  },
  {
    id: STEP_RM_NETWORK_PRIVATE_ENDPOINTS_RESOURCE_RELATIONSHIPS,
    name: 'Private Endpoint to Resource Relationships',
    entities: [],
    relationships: [NetworkRelationships.PRIVATE_ENDPOINT_CONNECTS_RESOURCE],
    dependsOn: [
      STEP_RM_NETWORK_PRIVATE_ENDPOINTS,
      ...getResourceManagerSteps().executeFirstSteps,
    ],
    executionHandler: buildPrivateEndpointResourceRelationships,
  },
  {
    id: STEP_RM_NETWORK_LOCATION_WATCHERS,
    name: 'Location-Network Watcher Relationships',
    entities: [],
    relationships: [],
    mappedRelationships: [
      NetworkMappedRelationships.LOCATION_HAS_NETWORK_WATCHER,
    ],
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
    rolePermissions: ['Microsoft.Network/networkWatchers/flowLogs/read'],
  },
];
