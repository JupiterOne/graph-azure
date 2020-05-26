import { StorageAccount } from "@azure/arm-storage/esm/models";
import {
  createIntegrationRelationship,
  Entity,
} from "@jupiterone/integration-sdk";

import { AzureWebLinker, createAzureWebLinker } from "../../../azure";
import { ACCOUNT_ENTITY_TYPE } from "../../../jupiterone";
import { IntegrationStepContext } from "../../../types";
import { StorageClient } from "./client";
import {
  createStorageContainerEntity,
  createStorageFileShareEntity,
  createStorageServiceEntity,
} from "./converters";

export async function fetchStorageResources(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new StorageClient(instance.config, logger);

  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  await client.iterateStorageAccounts(async (storageAccount) => {
    await synchronizeStorageAccount(
      executionContext,
      accountEntity,
      webLinker,
      storageAccount,
      client,
    );
  });
}

async function synchronizeStorageAccount(
  context: IntegrationStepContext,
  accountEntity: Entity,
  webLinker: AzureWebLinker,
  storageAccount: StorageAccount,
  client: StorageClient,
): Promise<void> {
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

      const synchronizer = storageServiceSynchronizers[s];
      if (synchronizer) {
        logger.info(logInfo, "Processing storage account service...");
        await synchronizer(
          context,
          accountEntity,
          webLinker,
          storageAccount,
          client,
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
}

const storageServiceSynchronizers: {
  [service: string]: (
    context: IntegrationStepContext,
    accountEntity: Entity,
    webLinker: AzureWebLinker,
    storageAccount: StorageAccount,
    client: StorageClient,
  ) => Promise<void>;
} = {
  blob: synchronizeBlobStorage,
  file: synchronizeFileStorage,
};

/**
 * Synchronize File Shares in the File storage service. The service entity is
 * created whether or not there are any File Shares.
 */
async function synchronizeBlobStorage(
  context: IntegrationStepContext,
  accountEntity: Entity,
  webLinker: AzureWebLinker,
  storageAccount: StorageAccount,
  client: StorageClient,
): Promise<void> {
  const { jobState } = context;

  const serviceEntity = createStorageServiceEntity(
    webLinker,
    storageAccount,
    "blob",
  );

  await jobState.addEntity(serviceEntity);

  await jobState.addRelationship(
    createIntegrationRelationship({
      _class: "HAS",
      from: accountEntity,
      to: serviceEntity,
    }),
  );

  await client.iterateStorageBlobContainers(
    storageAccount,
    async (container) => {
      const containerEntity = createStorageContainerEntity(
        webLinker,
        storageAccount,
        container,
      );

      await jobState.addEntity(containerEntity);

      await jobState.addRelationship(
        createIntegrationRelationship({
          _class: "HAS",
          from: serviceEntity,
          to: containerEntity,
        }),
      );
    },
  );
}

/**
 * Synchronize File Shares in the File storage service. The service entity is
 * created whether or not there are any File Shares.
 */
async function synchronizeFileStorage(
  context: IntegrationStepContext,
  accountEntity: Entity,
  webLinker: AzureWebLinker,
  storageAccount: StorageAccount,
  client: StorageClient,
): Promise<void> {
  const { jobState } = context;

  const serviceEntity = createStorageServiceEntity(
    webLinker,
    storageAccount,
    "file",
  );

  await jobState.addEntity(serviceEntity);

  await jobState.addRelationship(
    createIntegrationRelationship({
      _class: "HAS",
      from: accountEntity,
      to: serviceEntity,
    }),
  );

  await client.iterateFileShares(storageAccount, async (e) => {
    const fileShareEntity = createStorageFileShareEntity(
      webLinker,
      storageAccount,
      e,
    );

    await jobState.addEntity(fileShareEntity);

    await jobState.addRelationship(
      createIntegrationRelationship({
        _class: "HAS",
        from: serviceEntity,
        to: fileShareEntity,
        properties: {
          storageAccountId: storageAccount.id,
        },
      }),
    );
  });
}
