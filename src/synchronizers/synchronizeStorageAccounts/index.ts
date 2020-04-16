import {
  IntegrationError,
  IntegrationExecutionResult,
  PersisterOperationsResult,
  summarizePersisterOperationsResults,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { createAzureWebLinker } from "../../azure";
import { AccountEntity } from "../../jupiterone";
import { AzureExecutionContext } from "../../types";
import deprecatedBlobSync from "./deprecatedBlobSync";
import { synchronizeStorageAccount } from "./sync";
import { StorageClient } from "./client";

export default async function synchronizeStorageAccounts(
  executionContext: AzureExecutionContext,
): Promise<IntegrationExecutionResult> {
  const { instance, logger } = executionContext;

  const cache = executionContext.clients.getCache();

  const accountEntity = (await cache.getEntry("account")).data as AccountEntity;
  if (!accountEntity) {
    throw new IntegrationError(
      "Account fetch did not complete, cannot synchronize storage resources",
    );
  }

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain);

  const results: PersisterOperationsResult[] = [];

  const storageClient = new StorageClient(instance.config, logger);

  await storageClient.iterateStorageAccounts(async (storageAccount) => {
    results.push(
      await synchronizeStorageAccount(
        executionContext,
        accountEntity,
        webLinker,
        storageAccount,
      ),
    );
  });

  results.push(
    await deprecatedBlobSync(executionContext, webLinker, accountEntity),
  );

  return {
    operations: summarizePersisterOperationsResults(...results),
  };
}
