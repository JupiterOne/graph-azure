import { StorageAccount } from "@azure/arm-storage/esm/models";
import {
  createIntegrationRelationship,
  DataModel,
  EntityFromIntegration,
  generateRelationshipType,
  IntegrationRelationship,
  PersisterOperationsResult,
  summarizePersisterOperationsResults,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { AzureWebLinker } from "../../azure";
import {
  AccountEntity,
  STORAGE_FILE_SERVICE_ENTITY_TYPE,
  STORAGE_FILE_SHARE_ENTITY_TYPE,
} from "../../jupiterone";
import { AzureExecutionContext } from "../../types";
import { StorageClient } from "./client";
import {
  createStorageFileShareEntity,
  createStorageServiceEntity,
} from "./converters";

export async function synchronizeStorageAccount(
  context: AzureExecutionContext,
  accountEntity: AccountEntity,
  webLinker: AzureWebLinker,
  storageAccount: StorageAccount,
): Promise<PersisterOperationsResult> {
  const { logger } = context;

  const storageAccountLogInfo = {
    storageAccount: {
      id: storageAccount.id,
      kind: storageAccount.kind,
    },
  };

  const results: PersisterOperationsResult[] = [];

  if (storageAccount.primaryEndpoints) {
    for (const s of Object.keys(storageAccount.primaryEndpoints)) {
      const logInfo = { ...storageAccountLogInfo, service: s };

      const synchronizer = storageServiceSynchronizers[s];
      if (synchronizer) {
        logger.info(logInfo, "Processing storage account service...");
        results.push(
          await synchronizer(context, accountEntity, webLinker, storageAccount),
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

  return summarizePersisterOperationsResults(...results);
}

const storageServiceSynchronizers: {
  [service: string]: (
    context: AzureExecutionContext,
    accountEntity: AccountEntity,
    webLinker: AzureWebLinker,
    storageAccount: StorageAccount,
  ) => Promise<PersisterOperationsResult>;
} = {
  blob: synchronizeBlobStorage,
  file: synchronizeFileStorage,
};

// no-op, currently handled by deprecatedBlobSync
function synchronizeBlobStorage(
  _context: AzureExecutionContext,
  _accountEntity: AccountEntity,
  _webLinker: AzureWebLinker,
  _storageAccount: StorageAccount,
): Promise<PersisterOperationsResult> {
  return Promise.resolve({
    created: 0,
    updated: 0,
    deleted: 0,
  });
}

/**
 * Synchronize File Shares in the File storage service. The service entity is
 * created whether or not there are any File Shares.
 */
async function synchronizeFileStorage(
  context: AzureExecutionContext,
  accountEntity: AccountEntity,
  webLinker: AzureWebLinker,
  storageAccount: StorageAccount,
): Promise<PersisterOperationsResult> {
  const { graph, persister, instance, logger } = context;

  const newServiceEntity = createStorageServiceEntity(
    webLinker,
    storageAccount,
    "file",
  );

  const newAccountServiceRelationship = createIntegrationRelationship({
    _class: "HAS",
    from: accountEntity,
    to: newServiceEntity,
  });

  const newFileShareEntities: EntityFromIntegration[] = [];
  const newServiceFileShareRelationships: IntegrationRelationship[] = [];

  const storageClient = new StorageClient(instance.config, logger);

  await storageClient.iterateFileShares(storageAccount, (e) => {
    const fileShareEntity = createStorageFileShareEntity(
      webLinker,
      storageAccount,
      e,
    );

    newFileShareEntities.push(fileShareEntity);

    const serviceContainerRelationship = createIntegrationRelationship({
      _class: "HAS",
      from: newServiceEntity,
      to: fileShareEntity,
      properties: {
        storageAccountId: storageAccount.id,
      },
    });

    newServiceFileShareRelationships.push(serviceContainerRelationship);
  });

  const oldServiceEntities = await graph.findEntitiesByType(
    newServiceEntity._type,
    { _key: newServiceEntity._key },
  );

  const oldAccountServiceRelationships = await graph.findRelationshipsByType(
    newAccountServiceRelationship._type,
    {
      _key: newAccountServiceRelationship._key,
    },
  );

  const oldFileShareEntities = await graph.findEntitiesByType(
    STORAGE_FILE_SHARE_ENTITY_TYPE,
    {
      storageAccountId: accountEntity.id,
    },
  );

  const oldServiceFileShareRelationships = await graph.findRelationshipsByType(
    generateRelationshipType(
      DataModel.RelationshipClass.HAS,
      STORAGE_FILE_SERVICE_ENTITY_TYPE,
      STORAGE_FILE_SHARE_ENTITY_TYPE,
    ),
    {
      storageAccountId: storageAccount.id,
    },
  );

  const operationsSummary = await persister.publishPersisterOperations([
    [
      ...persister.processEntities(oldServiceEntities, [newServiceEntity]),
      ...persister.processEntities(oldFileShareEntities, newFileShareEntities),
    ],
    [
      ...persister.processRelationships(oldAccountServiceRelationships, [
        newAccountServiceRelationship,
      ]),
      ...persister.processRelationships(
        oldServiceFileShareRelationships,
        newServiceFileShareRelationships,
      ),
    ],
  ]);

  logger.info(
    {
      storageAccount,
      operationsSummary,
    },
    "Finished iterating file shares for storage account",
  );

  return operationsSummary;
}
