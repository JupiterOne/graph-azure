import { StorageAccount } from "@azure/arm-storage/esm/models";
import {
  createIntegrationRelationship,
  EntityFromIntegration,
  generateRelationshipType,
  IntegrationError,
  IntegrationExecutionResult,
  IntegrationRelationship,
  PersisterOperationsResult,
  summarizePersisterOperationsResults,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { AzureWebLinker, createAzureWebLinker } from "../azure";
import {
  createStorageContainerEntity,
  createStorageServiceEntity,
} from "../converters/resources/storage";
import {
  AccountEntity,
  STORAGE_BLOB_SERVICE_ENTITY_TYPE,
  STORAGE_CONTAINER_ENTITY_TYPE,
} from "../jupiterone";
import { AzureExecutionContext } from "../types";

export default async function synchronizeStorageAccounts(
  executionContext: AzureExecutionContext,
): Promise<IntegrationExecutionResult> {
  const { azrm, logger } = executionContext;
  const cache = executionContext.clients.getCache();

  const accountEntity = (await cache.getEntry("account")).data as AccountEntity;
  if (!accountEntity) {
    throw new IntegrationError(
      "Account fetch did not complete, cannot synchronize groups",
    );
  }

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain);

  const operationsResults: PersisterOperationsResult[] = [];

  await azrm.iterateStorageAccounts(async e => {
    logger.info({ storageAccount: e }, "Processing storage account...");

    operationsResults.push(
      await synchronizeStorageAccount(
        executionContext,
        accountEntity,
        webLinker,
        e,
      ),
    );
  });

  return {
    operations: summarizePersisterOperationsResults(...operationsResults),
  };
}

/**
 * Synchronize containers in the Blob storage service. The service entity is
 * created whether or not there are any blobs.
 */
async function synchronizeBlobStorage(
  executionContext: AzureExecutionContext,
  accountEntity: AccountEntity,
  webLinker: AzureWebLinker,
  storageAccount: StorageAccount,
): Promise<PersisterOperationsResult> {
  const { azrm, graph, persister } = executionContext;

  const newServiceEntity = createStorageServiceEntity(
    webLinker,
    storageAccount,
    "blob",
  );

  const newAccountServiceRelationship = createIntegrationRelationship({
    _class: "HAS",
    from: accountEntity,
    to: newServiceEntity,
  });

  const newContainerEntities: EntityFromIntegration[] = [];
  const newServiceContainerRelationships: IntegrationRelationship[] = [];

  await azrm.iterateStorageBlobContainers(storageAccount, e => {
    const containerEntity = createStorageContainerEntity(
      webLinker,
      storageAccount,
      e,
    );
    newContainerEntities.push(containerEntity);
    newServiceContainerRelationships.push(
      createIntegrationRelationship({
        _class: "HAS",
        from: newServiceEntity,
        to: containerEntity,
      }),
    );
  });

  const [
    oldServiceEntities,
    oldAccountServiceRelationships,
    oldContainerEntities,
    oldServiceContainerRelationships,
  ] = await Promise.all([
    graph.findEntitiesByType(STORAGE_BLOB_SERVICE_ENTITY_TYPE),
    graph.findRelationshipsByType(
      generateRelationshipType("HAS", accountEntity, newServiceEntity),
    ),
    graph.findEntitiesByType(STORAGE_CONTAINER_ENTITY_TYPE),
    graph.findRelationshipsByType(
      generateRelationshipType(
        "HAS",
        newServiceEntity,
        STORAGE_CONTAINER_ENTITY_TYPE,
      ),
    ),
  ]);

  return persister.publishPersisterOperations([
    [
      ...persister.processEntities(oldServiceEntities, [newServiceEntity]),
      ...persister.processEntities(oldContainerEntities, newContainerEntities),
    ],
    [
      ...persister.processRelationships(oldAccountServiceRelationships, [
        newAccountServiceRelationship,
      ]),
      ...persister.processRelationships(
        oldServiceContainerRelationships,
        newServiceContainerRelationships,
      ),
    ],
  ]);
}

const storageServiceSynchronizers: { [service: string]: Function } = {
  blob: synchronizeBlobStorage,
};

async function synchronizeStorageAccount(
  executionContext: AzureExecutionContext,
  accountEntity: AccountEntity,
  webLinker: AzureWebLinker,
  storageAccount: StorageAccount,
): Promise<PersisterOperationsResult> {
  const { logger } = executionContext;
  const operationsResults: PersisterOperationsResult[] = [];

  const storageAccountLogInfo = {
    storageAccount: {
      id: storageAccount.id,
      kind: storageAccount.kind,
    },
  };

  if (storageAccount.primaryEndpoints) {
    for (const s of Object.keys(storageAccount.primaryEndpoints)) {
      const logInfo = { ...storageAccountLogInfo, service: s };

      const synchronizer = storageServiceSynchronizers[s];
      if (synchronizer) {
        logger.info(logInfo, "Processing storage account service...");
        operationsResults.push(
          await synchronizer(
            executionContext,
            accountEntity,
            webLinker,
            storageAccount,
          ),
        );
      } else {
        logger.warn(logInfo, "Unhandled storage account service!");
      }
    }
  } else {
    logger.info(
      storageAccountLogInfo,
      "Storage account has no registered service endpoints, nothing to synchronize",
    );
  }

  return summarizePersisterOperationsResults(...operationsResults);
}
