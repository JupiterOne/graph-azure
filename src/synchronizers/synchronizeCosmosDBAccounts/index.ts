import { AzureExecutionContext } from "../../types";
import {
  IntegrationExecutionResult,
  IntegrationError,
  PersisterOperationsResult,
  EntityFromIntegration,
  summarizePersisterOperationsResults,
  IntegrationRelationship,
  createIntegrationRelationship,
  DataModel,
  generateRelationshipType,
} from "@jupiterone/jupiter-managed-integration-sdk";
import { AccountEntity } from "../../jupiterone";
import { createAzureWebLinker } from "../../azure";
import { CosmosDBClient } from "./client";
import { createSQLDatabaseEntity, createAccountEntity } from "./converters";

export default async function synchronizeCosmosDBAccounts(
  executionContext: AzureExecutionContext,
): Promise<IntegrationExecutionResult> {
  const { graph, persister, logger, instance } = executionContext;
  const cache = executionContext.clients.getCache();

  const accountEntity = (await cache.getEntry("account")).data as AccountEntity;
  if (!accountEntity) {
    throw new IntegrationError(
      "Account fetch did not complete, cannot synchronize storage resources",
    );
  }

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain);
  const cosmosDBClient = new CosmosDBClient(instance.config, logger);

  const operationsResults: PersisterOperationsResult[] = [];

  await cosmosDBClient.iterateAccounts(async (account) => {
    const newDBAccountEntity = createAccountEntity(webLinker, account);

    const newDBEntities: EntityFromIntegration[] = [];
    const newAccountDatabaseRelationships: IntegrationRelationship[] = [];
    await cosmosDBClient.iterateSQLDatabases(account, (database) => {
      const newDBEntity = createSQLDatabaseEntity(webLinker, account, database);
      newDBEntities.push(newDBEntity);
      newAccountDatabaseRelationships.push(
        createIntegrationRelationship({
          _class: DataModel.RelationshipClass.HAS,
          from: newDBAccountEntity,
          to: newDBEntity,
          properties: {
            dbAccountId: account.id,
          },
        }),
      );
    });

    const oldDBEntities = await graph.findEntitiesByType(
      "azure_cosmosdb_sql_database",
      {
        dbAccountId: account.id, // allows subset synchronization
      },
    );

    const oldAccountDBRelationships = await graph.findRelationshipsByType(
      generateRelationshipType(
        DataModel.RelationshipClass.HAS,
        "azure_cosmosdb_account",
        "azure_cosmosdb_sql_database",
      ),
      {
        dbAccountId: account.id,
      },
    );

    const oldDBAccountEntities = await graph.findEntitiesByType(
      "azure_cosmosdb_account",
      { id: account.id },
    );

    operationsResults.push(
      await persister.publishPersisterOperations([
        [
          ...persister.processEntities(oldDBAccountEntities, [
            newDBAccountEntity,
          ]),
          ...persister.processEntities(oldDBEntities, newDBEntities),
        ],
        persister.processRelationships(
          oldAccountDBRelationships,
          newAccountDatabaseRelationships,
        ),
      ]),
    );
  });

  return {
    operations: summarizePersisterOperationsResults(...operationsResults),
  };
}
