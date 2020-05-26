import {
  createIntegrationRelationship,
  Entity,
} from "@jupiterone/integration-sdk";

import { createAzureWebLinker } from "../../../azure";
import { ACCOUNT_ENTITY_TYPE } from "../../../jupiterone";
import { IntegrationStepContext } from "../../../types";
import { CosmosDBClient } from "./client";
import { createAccountEntity, createSQLDatabaseEntity } from "./converters";

export async function fetchStorageResources(
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
          _class: "HAS",
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
