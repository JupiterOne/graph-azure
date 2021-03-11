import { IntegrationStepContext } from '../../../types';
import { Entity } from '@jupiterone/integration-sdk-core';
import {
  KEY_VAULT_SERVICE_ENTITY_TYPE,
  STEP_RM_KEYVAULT_VAULTS,
} from '../key-vault';
import {
  STEP_RM_NETWORK_INTERFACES,
  STEP_RM_NETWORK_SECURITY_GROUPS,
  STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES,
  STEP_RM_NETWORK_VIRTUAL_NETWORKS,
  NetworkEntities,
} from '../network/constants';
import {
  RM_COSMOSDB_ACCOUNT_ENTITY_TYPE,
  STEP_RM_COSMOSDB_SQL_DATABASES,
} from '../cosmosdb';
import { RESOURCE_GROUP_MATCHER, EOL_MATCHER } from './matchers';
import { entities as storageEntities, steps as storageSteps } from '../storage';
import {
  ApiManagementEntities,
  STEP_RM_API_MANAGEMENT_SERVICES,
} from '../api-management';
import { DnsEntities, STEP_RM_DNS_ZONES } from '../dns';
import { PrivateDnsEntities, STEP_RM_PRIVATE_DNS_ZONES } from '../private-dns';
import {
  ContainerRegistryEntities,
  STEP_RM_CONTAINER_REGISTRIES,
} from '../container-registry';

export interface ResourceIdMap {
  resourceIdMatcher: RegExp;
  azureType?: string;
  _type: string;
  dependsOn: string[];
}

export const RESOURCE_ID_TYPES_MAP: ResourceIdMap[] = [
  {
    resourceIdMatcher: new RegExp(
      RESOURCE_GROUP_MATCHER +
        '/providers/Microsoft.KeyVault/vaults/[^/]+' +
        EOL_MATCHER,
    ),
    azureType: 'Microsoft.KeyVault/vault',
    _type: KEY_VAULT_SERVICE_ENTITY_TYPE,
    dependsOn: [STEP_RM_KEYVAULT_VAULTS],
  },
  {
    resourceIdMatcher: new RegExp(
      RESOURCE_GROUP_MATCHER +
        '/providers/Microsoft.Network/networkInterfaces/[^/]+' +
        EOL_MATCHER,
    ),
    _type: NetworkEntities.NETWORK_INTERFACE._type,
    dependsOn: [STEP_RM_NETWORK_INTERFACES],
  },
  {
    resourceIdMatcher: new RegExp(
      RESOURCE_GROUP_MATCHER +
        '/providers/Microsoft.Network/networkSecurityGroups/[^/]+' +
        EOL_MATCHER,
    ),
    _type: NetworkEntities.SECURITY_GROUP._type,
    dependsOn: [STEP_RM_NETWORK_SECURITY_GROUPS],
  },
  {
    resourceIdMatcher: new RegExp(
      RESOURCE_GROUP_MATCHER +
        '/providers/Microsoft.Network/publicIPAddresses/[^/]+' +
        EOL_MATCHER,
    ),
    _type: NetworkEntities.PUBLIC_IP_ADDRESS._type,
    dependsOn: [STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES],
  },
  {
    resourceIdMatcher: new RegExp(
      RESOURCE_GROUP_MATCHER +
        '/providers/Microsoft.Network/virtualNetworks/[^/]+' +
        EOL_MATCHER,
    ),
    _type: NetworkEntities.VIRTUAL_NETWORK._type,
    dependsOn: [STEP_RM_NETWORK_VIRTUAL_NETWORKS],
  },
  {
    resourceIdMatcher: new RegExp(
      RESOURCE_GROUP_MATCHER +
        '/providers/Microsoft.DocumentDB/databaseAccounts/[^/]+' +
        EOL_MATCHER,
    ),
    _type: RM_COSMOSDB_ACCOUNT_ENTITY_TYPE,
    dependsOn: [STEP_RM_COSMOSDB_SQL_DATABASES],
  },
  {
    resourceIdMatcher: new RegExp(
      RESOURCE_GROUP_MATCHER +
        '/providers/Microsoft.Storage/storageAccounts/[^/]+' +
        EOL_MATCHER,
    ),
    _type: storageEntities.STORAGE_ACCOUNT._type,
    dependsOn: [storageSteps.STORAGE_ACCOUNTS],
  },
  {
    resourceIdMatcher: new RegExp(
      RESOURCE_GROUP_MATCHER +
        '/providers/Microsoft.ApiManagement/service/[^/]+' +
        EOL_MATCHER,
    ),
    _type: ApiManagementEntities.SERVICE._type,
    dependsOn: [STEP_RM_API_MANAGEMENT_SERVICES],
  },
  {
    resourceIdMatcher: new RegExp(
      RESOURCE_GROUP_MATCHER +
        '/providers/Microsoft.Network/dnszones/[^/]+' +
        EOL_MATCHER,
    ),
    _type: DnsEntities.ZONE._type,
    dependsOn: [STEP_RM_DNS_ZONES],
  },
  {
    resourceIdMatcher: new RegExp(
      RESOURCE_GROUP_MATCHER +
        '/providers/Microsoft.Network/privateDnsZones/[^/]+' +
        EOL_MATCHER,
    ),
    _type: PrivateDnsEntities.ZONE._type,
    dependsOn: [STEP_RM_PRIVATE_DNS_ZONES],
  },
  {
    resourceIdMatcher: new RegExp(
      RESOURCE_GROUP_MATCHER +
        '/providers/Microsoft.ContainerRegistry/registries/[^/]+' +
        EOL_MATCHER,
    ),
    _type: ContainerRegistryEntities.REGISTRY._type,
    dependsOn: [STEP_RM_CONTAINER_REGISTRIES],
  },
];

export function makeMatcherDependsOn(resourceIdMap: ResourceIdMap[]): string[] {
  return ([] as string[]).concat(...resourceIdMap.map((t) => t.dependsOn));
}
export const RESOURCE_ID_MATCHER_DEPENDS_ON = makeMatcherDependsOn(
  RESOURCE_ID_TYPES_MAP,
);

export function makeMatcherEntityTypes(
  resourceIdMap: ResourceIdMap[],
): string[] {
  return ([] as string[]).concat(...resourceIdMap.map((t) => t._type));
}
export const RESOURCE_ID_MATCHER_ENTITY_TYPES = makeMatcherEntityTypes(
  RESOURCE_ID_TYPES_MAP,
);

export function getJupiterTypeForResourceId(
  resourceId: string,
  resourceIdMap?: ResourceIdMap[],
): string | undefined {
  return (resourceIdMap || RESOURCE_ID_TYPES_MAP).find((t) =>
    t.resourceIdMatcher.test(resourceId),
  )?._type;
}

export type PlaceholderEntity = {
  _type: string;
  _key: string;
  [key: string]: string;
};

export function isPlaceholderEntity(
  targetEntity: Entity | PlaceholderEntity,
): targetEntity is PlaceholderEntity {
  return (targetEntity as any)._class === undefined;
}

/**
 * Tries to fetch the scope entity from the job state.
 * If the entity is not in the job state, returns {_key, _type} for mapper.
 */
export async function findOrBuildResourceEntityFromResourceId(
  executionContext: IntegrationStepContext,
  options: {
    resourceId: string;
    resourceIdMap?: ResourceIdMap[];
  },
): Promise<Entity | PlaceholderEntity | undefined> {
  const { jobState } = executionContext;
  const { resourceId, resourceIdMap } = options;
  const targetEntity = await jobState.findEntity(resourceId);

  if (targetEntity !== null) {
    return targetEntity;
  }

  const targetType = getJupiterTypeForResourceId(resourceId, resourceIdMap);
  if (targetType !== undefined) {
    return {
      _type: targetType,
      _key: resourceId,
    };
  }
}

export default findOrBuildResourceEntityFromResourceId;
