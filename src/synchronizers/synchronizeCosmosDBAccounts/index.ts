import { AzureExecutionContext } from "../../types";
import {
  IntegrationExecutionResult,
  IntegrationError,
  PersisterOperationsResult,
  createIntegrationEntity,
  EntityFromIntegration,
  summarizePersisterOperationsResults,
} from "@jupiterone/jupiter-managed-integration-sdk";
import { AccountEntity, AZURE_DATABASE_ENTITY_CLASS } from "../../jupiterone";
import { createAzureWebLinker } from "../../azure";
import { CosmosDBClient } from "./client";
import { resourceGroupName } from "../../azure/utils";

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

  await cosmosDBClient.iterateCosmosDBAccounts(async (account) => {
    const databaseEntityType = "azure_cosmosdb_???";
    const newDatabaseEntities: EntityFromIntegration[] = [];

    await cosmosDBClient.iterateCosmosDBs(account, (database) => {
      const entity = createIntegrationEntity({
        entityData: {
          source: database,
          assign: {
            _key: database.id,
            _type: databaseEntityType,
            _class: AZURE_DATABASE_ENTITY_CLASS,
            dbAccountId: account.id,
            webLink: webLinker.portalResourceUrl(database.id),
            encrypted: true, // Cosmos DB's are always encrypted, it cannot be turned off
            classification: null,
            resourceGroup: resourceGroupName(database.id),
          },
        },
      });
      newDatabaseEntities.push(entity);
    });

    const oldDatabaseEntities = await graph.findEntitiesByType(
      databaseEntityType,
      {
        dbAccountId: account.id,
      },
    );

    operationsResults.push(
      await persister.publishEntityOperations(
        persister.processEntities(oldDatabaseEntities, newDatabaseEntities),
      ),
    );
  });

  return {
    operations: summarizePersisterOperationsResults(...operationsResults),
  };
}
