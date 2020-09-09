import { IntegrationStepContext } from '../../../types';
import { Entity } from '@jupiterone/integration-sdk-core';
import {
  KEY_VAULT_SERVICE_ENTITY_TYPE,
  STEP_RM_KEYVAULT_VAULTS,
} from '../key-vault';
import {
  NETWORK_INTERFACE_ENTITY_TYPE,
  STEP_RM_NETWORK_INTERFACES,
  SECURITY_GROUP_ENTITY_TYPE,
  STEP_RM_NETWORK_SECURITY_GROUPS,
  PUBLIC_IP_ADDRESS_ENTITY_TYPE,
  STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES,
  VIRTUAL_NETWORK_ENTITY_TYPE,
  STEP_RM_NETWORK_VIRTUAL_NETWORKS,
} from '../network';
import {
  RM_COSMOSDB_ACCOUNT_ENTITY_TYPE,
  STEP_RM_COSMOSDB_SQL_DATABASES,
} from '../cosmosdb';
import { RESOURCE_GROUP_MATCHER, EOL_MATCHER } from './matchers';
import {
  STORAGE_ACCOUNT_ENTITY_METADATA,
  STEP_RM_STORAGE_RESOURCES,
} from '../storage';
import {
  ApiManagementEntities,
  STEP_RM_API_MANAGEMENT_SERVICES,
} from '../api-management';

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
    _type: NETWORK_INTERFACE_ENTITY_TYPE,
    dependsOn: [STEP_RM_NETWORK_INTERFACES],
  },
  {
    resourceIdMatcher: new RegExp(
      RESOURCE_GROUP_MATCHER +
        '/providers/Microsoft.Network/networkSecurityGroups/[^/]+' +
        EOL_MATCHER,
    ),
    _type: SECURITY_GROUP_ENTITY_TYPE,
    dependsOn: [STEP_RM_NETWORK_SECURITY_GROUPS],
  },
  {
    resourceIdMatcher: new RegExp(
      RESOURCE_GROUP_MATCHER +
        '/providers/Microsoft.Network/publicIPAddresses/[^/]+' +
        EOL_MATCHER,
    ),
    _type: PUBLIC_IP_ADDRESS_ENTITY_TYPE,
    dependsOn: [STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES],
  },
  {
    resourceIdMatcher: new RegExp(
      RESOURCE_GROUP_MATCHER +
        '/providers/Microsoft.Network/virtualNetworks/[^/]+' +
        EOL_MATCHER,
    ),
    _type: VIRTUAL_NETWORK_ENTITY_TYPE,
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
    _type: STORAGE_ACCOUNT_ENTITY_METADATA._type,
    dependsOn: [STEP_RM_STORAGE_RESOURCES],
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

export type PlaceholderEntity = { _type: string; _key: string };

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
