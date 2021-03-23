import {
  createDirectRelationship,
  RelationshipClass,
  Step,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { getAccountEntity, STEP_AD_ACCOUNT } from '../../active-directory';
import { CosmosDBClient } from './client';
import {
  RM_COSMOSDB_ACCOUNT_ENTITY_TYPE,
  RM_COSMOSDB_ACCOUNT_SQL_DATABASE_RELATIONSHIP_TYPE,
  RM_COSMOSDB_SQL_DATABASE_ENTITY_TYPE,
  STEP_RM_COSMOSDB_SQL_DATABASES,
  RM_COSMOSDB_ACCOUNT_ENTITY_CLASS,
  RM_COSMOSDB_SQL_DATABASE_ENTITY_CLASS,
  RM_COSMOSDB_ACCOUNT_SQL_DATABASE_RELATIONSHIP_CLASS,
} from './constants';
import { createAccountEntity, createSQLDatabaseEntity } from './converters';
import createResourceGroupResourceRelationship, {
  createResourceGroupResourceRelationshipMetadata,
} from '../utils/createResourceGroupResourceRelationship';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources';

export * from './constants';

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

export const cosmosdbSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: STEP_RM_COSMOSDB_SQL_DATABASES,
    name: 'CosmosDB SQL Databases',
    entities: [
      {
        resourceName: '[RM] Cosmos DB Account',
        _type: RM_COSMOSDB_ACCOUNT_ENTITY_TYPE,
        _class: RM_COSMOSDB_ACCOUNT_ENTITY_CLASS,
      },
      {
        resourceName: '[RM] Cosmos DB Database',
        _type: RM_COSMOSDB_SQL_DATABASE_ENTITY_TYPE,
        _class: RM_COSMOSDB_SQL_DATABASE_ENTITY_CLASS,
      },
    ],
    relationships: [
      {
        _type: RM_COSMOSDB_ACCOUNT_SQL_DATABASE_RELATIONSHIP_TYPE,
        sourceType: RM_COSMOSDB_ACCOUNT_ENTITY_TYPE,
        _class: RM_COSMOSDB_ACCOUNT_SQL_DATABASE_RELATIONSHIP_CLASS,
        targetType: RM_COSMOSDB_SQL_DATABASE_ENTITY_TYPE,
      },
      createResourceGroupResourceRelationshipMetadata(
        RM_COSMOSDB_ACCOUNT_ENTITY_TYPE,
      ),
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchCosmosDBSqlDatabases,
  },
];
