import { StorageAccount } from "@azure/arm-storage/esm/models";
import {
  createIntegrationRelationship,
  EntityFromIntegration,
  IntegrationRelationship,
  PersisterOperationsResult,
  summarizePersisterOperationsResults,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { AzureWebLinker } from "../../azure";
import { AccountEntity } from "../../jupiterone";
import { AzureExecutionContext } from "../../types";
import { StorageClient } from "./client";
import {
  createStorageContainerEntity,
  createStorageServiceEntity,
} from "./converters";
import {
  fetchOldData,
  OldDataExecutionContext,
  popOldAccountServiceRelationship,
  popOldContainerEntity,
  popOldServiceContainerRelationship,
  popOldStorageServiceEntity,
} from "./oldData";

/**
 * Synchronize the storage accounts, only the Blob service, using an approach
 * that loads all old data into memory. This will go away once we have the new
 * integration-sdk in place and the persister working.
 */
export default async function deprecatedBlobSync(
  executionContext: AzureExecutionContext,
  webLinker: AzureWebLinker,
  accountEntity: AccountEntity,
): Promise<PersisterOperationsResult> {
  const { graph, persister, instance, logger } = executionContext;

  const operationsResults: PersisterOperationsResult[] = [];
  let oldData = await fetchOldData(graph, accountEntity);

  logger.info(
    oldData.metadata.lengths,
    "Finished fetching old entities and relationships for synchronizing storage blob containers",
  );

  const storageClient = new StorageClient(instance.config, logger);

  await storageClient.iterateStorageAccounts(async (storageAccount) => {
    logger.info(
      { storageAccount: storageAccount },
      "Processing storage account for blob service...",
    );

    const storageAccountContext = await synchronizeStorageAccount(
      { ...executionContext, oldData, operationsResults: [] },
      storageClient,
      accountEntity,
      webLinker,
      storageAccount,
    );

    operationsResults.push(
      summarizePersisterOperationsResults(
        ...storageAccountContext.operationsResults,
      ),
    );

    oldData = storageAccountContext.oldData;
  });

  const deleteOperationsResult = await persister.publishPersisterOperations([
    [
      ...persister.processEntities(Object.values(oldData.serviceEntityMap), []),
      ...persister.processEntities(
        Object.values(oldData.containerEntityMap),
        [],
      ),
    ],
    [
      ...persister.processRelationships(
        Object.values(oldData.accountServiceRelationshipMap),
        [],
      ),
      ...persister.processRelationships(
        Object.values(oldData.serviceContainerRelationshipMap),
        [],
      ),
    ],
  ]);

  return summarizePersisterOperationsResults(
    ...operationsResults,
    deleteOperationsResult,
  );
}

async function synchronizeStorageAccount(
  context: OldDataExecutionContext,
  storageClient: StorageClient,
  accountEntity: AccountEntity,
  webLinker: AzureWebLinker,
  storageAccount: StorageAccount,
): Promise<OldDataExecutionContext> {
  const { logger } = context;

  const storageAccountLogInfo = {
    storageAccount: {
      id: storageAccount.id,
      kind: storageAccount.kind,
    },
  };

  if (storageAccount.primaryEndpoints) {
    for (const s of Object.keys(storageAccount.primaryEndpoints)) {
      const logInfo = { ...storageAccountLogInfo, service: s };
      if (s === "blob") {
        // only handling deprecated approach here, which was done for blob containers only
        logger.info(logInfo, "Processing storage account blob service...");
        context = await synchronizeBlobStorage(
          context,
          storageClient,
          accountEntity,
          webLinker,
          storageAccount,
        );
      }
    }
  }

  return context;
}

/**
 * Synchronize containers in the Blob storage service. The service entity is
 * created whether or not there are any blobs.
 */
async function synchronizeBlobStorage(
  context: OldDataExecutionContext,
  storageClient: StorageClient,
  accountEntity: AccountEntity,
  webLinker: AzureWebLinker,
  storageAccount: StorageAccount,
): Promise<OldDataExecutionContext> {
  const { persister, logger, oldData } = context;

  const newServiceEntity = createStorageServiceEntity(
    webLinker,
    storageAccount,
    "blob",
  );
  const oldServiceEntity = popOldStorageServiceEntity(
    oldData,
    newServiceEntity,
  );

  const newAccountServiceRelationship = createIntegrationRelationship({
    _class: "HAS",
    from: accountEntity,
    to: newServiceEntity,
  });
  const oldAccountServiceRelationship = popOldAccountServiceRelationship(
    oldData,
    newAccountServiceRelationship,
  );

  const oldContainerEntities: EntityFromIntegration[] = [];
  const newContainerEntities: EntityFromIntegration[] = [];
  const oldServiceContainerRelationships: IntegrationRelationship[] = [];
  const newServiceContainerRelationships: IntegrationRelationship[] = [];

  await storageClient.iterateStorageBlobContainers(storageAccount, (e) => {
    const containerEntity = createStorageContainerEntity(
      webLinker,
      storageAccount,
      e,
    );
    const oldContainerEntity = popOldContainerEntity(oldData, containerEntity);

    newContainerEntities.push(containerEntity);
    oldContainerEntity && oldContainerEntities.push(oldContainerEntity);

    const serviceContainerRelationship = createIntegrationRelationship({
      _class: "HAS",
      from: newServiceEntity,
      to: containerEntity,
    });
    const oldServiceContainerRelationship = popOldServiceContainerRelationship(
      oldData,
      serviceContainerRelationship,
    );

    newServiceContainerRelationships.push(serviceContainerRelationship);
    oldServiceContainerRelationship &&
      oldServiceContainerRelationships.push(oldServiceContainerRelationship);
  });

  const operationsSummary = await persister.publishPersisterOperations([
    [
      ...persister.processEntities(oldServiceEntity ? [oldServiceEntity] : [], [
        newServiceEntity,
      ]),
      ...persister.processEntities(oldContainerEntities, newContainerEntities),
    ],
    [
      ...persister.processRelationships(
        oldAccountServiceRelationship ? [oldAccountServiceRelationship] : [],
        [newAccountServiceRelationship],
      ),
      ...persister.processRelationships(
        oldServiceContainerRelationships,
        newServiceContainerRelationships,
      ),
    ],
  ]);

  logger.info(
    {
      storageAccount,
      operationsSummary,
      oldDataLengths: oldData.metadata.lengths,
    },
    "Finished iterating containers for storage account",
  );

  return {
    ...context,
    operationsResults: [...context.operationsResults, operationsSummary],
    oldData,
  };
}
