import {
  DatabaseAccountGetResults,
  SqlDatabaseGetResults,
} from '@azure/arm-cosmosdb/esm/models';
import {
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import { normalizeLocation, resourceGroupName } from '../../../azure/utils';
import {
  RM_COSMOSDB_ACCOUNT_ENTITY_CLASS,
  RM_COSMOSDB_ACCOUNT_ENTITY_TYPE,
  RM_COSMOSDB_SQL_DATABASE_ENTITY_CLASS,
  RM_COSMOSDB_SQL_DATABASE_ENTITY_TYPE,
} from './constants';

export function createAccountEntity(
  webLinker: AzureWebLinker,
  data: DatabaseAccountGetResults,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id!,
        _type: RM_COSMOSDB_ACCOUNT_ENTITY_TYPE,
        _class: RM_COSMOSDB_ACCOUNT_ENTITY_CLASS,
        webLink: webLinker.portalResourceUrl(data.id),
        region: normalizeLocation(data.location),
        resourceGroup: resourceGroupName(data.id),
        enableAutomaticFailover: data.enableAutomaticFailover,
        enableMultipleWriteLocations: data.enableMultipleWriteLocations,
        isVirtualNetworkFilterEnabled: data.isVirtualNetworkFilterEnabled,
        ipRangeFilter: data.ipRangeFilter,
        category: ['infrastructure'],
        endpoints: data.readLocations
          ?.map((e) => e.documentEndpoint)
          .filter((e) => !!e) as string[],
      },
      tagProperties: ['environment'],
    },
  });
}

export function createSQLDatabaseEntity(
  webLinker: AzureWebLinker,
  dbAccount: DatabaseAccountGetResults,
  data: SqlDatabaseGetResults,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: { ...data, tags: dbAccount.tags },
      assign: {
        _key: data.id!,
        _type: RM_COSMOSDB_SQL_DATABASE_ENTITY_TYPE,
        _class: RM_COSMOSDB_SQL_DATABASE_ENTITY_CLASS,
        dbAccountId: dbAccount.id, // Maintained for synchronization subset
        webLink: webLinker.portalResourceUrl(data.id),
        encrypted: true, // Cosmos DB's are always encrypted, it cannot be turned off
        resourceGroup: resourceGroupName(data.id),
        region: normalizeLocation(dbAccount.location),
        classification: null, // If it isn't in tags, we don't know what the value should be
      },
      tagProperties: ['environment'],
    },
  });
}
