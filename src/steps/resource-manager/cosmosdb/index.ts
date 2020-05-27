import {
  createIntegrationRelationship,
  Entity,
} from '@jupiterone/integration-sdk';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext } from '../../../types';
import { ACCOUNT_ENTITY_TYPE, STEP_AD_ACCOUNT } from '../../active-directory';
import { CosmosDBClient } from './client';
import {
  RM_COSMOSDB_ACCOUNT_ENTITY_TYPE,
  RM_COSMOSDB_SQL_DATABASE_ENTITY_TYPE,
  STEP_RM_COSMOSDB_SQL_DATABASES,
} from './constants';
import { createAccountEntity, createSQLDatabaseEntity } from './converters';

export * from './constants';

export async function fetchCosmosDBSqlDatabases(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new CosmosDBClient(instance.config, logger);

  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  await client.iterateAccounts(async (account) => {
    const dbAccountEntity = createAccountEntity(webLinker, account);

    await client.iterateSQLDatabases(account, async (database) => {
      const dbEntity = createSQLDatabaseEntity(webLinker, account, database);
      await jobState.addEntity(dbEntity);
      await jobState.addRelationship(
        createIntegrationRelationship({
          _class: 'HAS',
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

export const cosmosdbSteps = [
  {
    id: STEP_RM_COSMOSDB_SQL_DATABASES,
    name: 'CosmosDB SQL Databases',
    types: [
      RM_COSMOSDB_ACCOUNT_ENTITY_TYPE,
      RM_COSMOSDB_SQL_DATABASE_ENTITY_TYPE,
    ],
    dependsOn: [STEP_AD_ACCOUNT],
    executionHandler: fetchCosmosDBSqlDatabases,
  },
];
