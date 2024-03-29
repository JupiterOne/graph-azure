import {
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, AzureIntegrationStep } from '../../../types';
import { getAccountEntity } from '../../active-directory';
import { STEP_AD_ACCOUNT } from '../../active-directory/constants';
import { CosmosDBClient } from './client';
import {
  RM_COSMOSDB_ACCOUNT_ENTITY_TYPE,
  STEP_RM_COSMOSDB_SQL_DATABASES,
  cosmosDBEntities,
  cosmosDBRelationships,
} from './constants';
import { createAccountEntity, createSQLDatabaseEntity } from './converters';
import createResourceGroupResourceRelationship, {
  createResourceGroupResourceRelationshipMetadata,
} from '../utils/createResourceGroupResourceRelationship';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources/constants';
import { INGESTION_SOURCE_IDS } from '../../../constants';

export async function fetchCosmosDBSqlDatabases(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new CosmosDBClient(instance.config, logger);

  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  await client.iterateAccounts(async (account) => {
    const dbAccountEntity = createAccountEntity(webLinker, account);
    await jobState.addEntity(dbAccountEntity);

    await createResourceGroupResourceRelationship(
      executionContext,
      dbAccountEntity,
    );

    await client.iterateSQLDatabases(account, async (database) => {
      const dbEntity = createSQLDatabaseEntity(webLinker, account, database);
      await jobState.addEntity(dbEntity);
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: dbAccountEntity,
          to: dbEntity,
          properties: {
            dbAccountId: account.id,
          },
        }),
      );
    });
  });
}

export const cosmosdbSteps: AzureIntegrationStep[] = [
  {
    id: STEP_RM_COSMOSDB_SQL_DATABASES,
    name: 'CosmosDB SQL Databases',
    entities: [
      cosmosDBEntities.COSMOSDB_ACCOUNT,
      cosmosDBEntities.COSMOSDB_SQL_DATABASE,
    ],
    relationships: [
      cosmosDBRelationships.COSMOSDB_HAS_SQL_DATABASE,
      createResourceGroupResourceRelationshipMetadata(
        RM_COSMOSDB_ACCOUNT_ENTITY_TYPE,
      ),
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchCosmosDBSqlDatabases,
    rolePermissions: [
      'Microsoft.DocumentDB/databaseAccounts/read',
      'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/read',
    ],
    ingestionSourceId: INGESTION_SOURCE_IDS.COSMOSDB,
  },
];
