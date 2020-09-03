import { StorageAccount } from '@azure/arm-storage/esm/models';
import {
  createDirectRelationship,
  Entity,
  Step,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker, createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { ACCOUNT_ENTITY_TYPE, STEP_AD_ACCOUNT } from '../../active-directory';
import { StorageClient } from './client';
import {
  STEP_RM_STORAGE_RESOURCES,
  STORAGE_ACCOUNT_RELATIONSHIP_CLASS,
  STORAGE_ACCOUNT_ENTITY_METADATA,
  STORAGE_CONTAINER_ENTITY_METADATA,
  STORAGE_ACCOUNT_CONTAINER_RELATIONSHIP_METADATA,
  STORAGE_FILE_SHARE_ENTITY_METADATA,
  STORAGE_ACCOUNT_FILE_SHARE_RELATIONSHIP_METADATA,
  STORAGE_QUEUE_ENTITY_METADATA,
  STEP_RM_STORAGE_QUEUES,
  STORAGE_ACCOUNT_QUEUE_RELATIONSHIP_METADATA,
} from './constants';
import {
  createStorageContainerEntity,
  createStorageFileShareEntity,
  createStorageAccountEntity,
  createStorageQueueEntity,
} from './converters';
import createResourceGroupResourceRelationship, {
  createResourceGroupResourceRelationshipMetadata,
} from '../utils/createResourceGroupResourceRelationship';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources';

export * from './constants';

export async function fetchStorageResources(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new StorageClient(instance.config, logger);

  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  await client.iterateStorageAccounts(async (storageAccount) => {
    const storageAccountEntity = await jobState.addEntity(
      createStorageAccountEntity(webLinker, storageAccount),
    );
    await jobState.addRelationship(
      await createResourceGroupResourceRelationship(
        executionContext,
        storageAccountEntity,
      ),
    );

    await synchronizeStorageAccount(
      executionContext,
      accountEntity,
      webLinker,
      storageAccount,
      storageAccountEntity,
      client,
    );
  });
}

async function synchronizeStorageAccount(
  context: IntegrationStepContext,
  accountEntity: Entity,
  webLinker: AzureWebLinker,
  storageAccount: StorageAccount,
  storageAccountEntity: Entity,
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
        logger.info(logInfo, 'Processing storage account service...');
        await synchronizer(
          context,
          accountEntity,
          webLinker,
          storageAccount,
          storageAccountEntity,
          client,
        );
      } else {
        logger.warn(logInfo, 'Unhandled storage account service!');
      }
    }
  } else {
    logger.info(
      storageAccountLogInfo,
      'Storage account has no registered service endpoints, nothing to synchronize',
    );
  }
}

const storageServiceSynchronizers: {
  [service: string]: (
    context: IntegrationStepContext,
    accountEntity: Entity,
    webLinker: AzureWebLinker,
    storageAccount: StorageAccount,
    storageAccountEntity: Entity,
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
  storageAccountEntity: Entity,
  client: StorageClient,
): Promise<void> {
  const { jobState } = context;

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
        createDirectRelationship({
          _class: STORAGE_ACCOUNT_RELATIONSHIP_CLASS,
          from: storageAccountEntity,
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
  storageAccountEntity: Entity,
  client: StorageClient,
): Promise<void> {
  const { jobState } = context;

  await client.iterateFileShares(storageAccount, async (e) => {
    const fileShareEntity = createStorageFileShareEntity(
      webLinker,
      storageAccount,
      e,
    );

    await jobState.addEntity(fileShareEntity);

    await jobState.addRelationship(
      createDirectRelationship({
        _class: STORAGE_ACCOUNT_RELATIONSHIP_CLASS,
        from: storageAccountEntity,
        to: fileShareEntity,
      }),
    );
  });
}

export async function fetchStorageQueues(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new StorageClient(instance.config, logger);

  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  await jobState.iterateEntities(
    { _type: STORAGE_ACCOUNT_ENTITY_METADATA._type },
    async (storageAccountEntity) => {
      await client.iterateQueues(
        (storageAccountEntity as unknown) as { name: string; id: string },
        async (e) => {
          const queueEntity = createStorageQueueEntity(
            webLinker,
            storageAccountEntity,
            e,
          );

          await jobState.addEntity(queueEntity);

          await jobState.addRelationship(
            createDirectRelationship({
              _class: STORAGE_ACCOUNT_RELATIONSHIP_CLASS,
              from: storageAccountEntity,
              to: queueEntity,
            }),
          );
        },
      );
    },
  );
}

export const storageSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: STEP_RM_STORAGE_RESOURCES,
    name: 'Storage Resources',
    entities: [
      STORAGE_ACCOUNT_ENTITY_METADATA,
      STORAGE_CONTAINER_ENTITY_METADATA,
      STORAGE_FILE_SHARE_ENTITY_METADATA,
    ],
    relationships: [
      createResourceGroupResourceRelationshipMetadata(
        STORAGE_ACCOUNT_ENTITY_METADATA._type,
      ),
      STORAGE_ACCOUNT_CONTAINER_RELATIONSHIP_METADATA,
      STORAGE_ACCOUNT_FILE_SHARE_RELATIONSHIP_METADATA,
    ],
    // From what I can tell, the following are not yet implemented
    // STORAGE_QUEUE_SERVICE_ENTITY_TYPE,
    // ACCOUNT_STORAGE_QUEUE_SERVICE_RELATIONSHIP_TYPE,

    // STORAGE_TABLE_SERVICE_ENTITY_TYPE,
    // ACCOUNT_STORAGE_TABLE_SERVICE_RELATIONSHIP_TYPE,
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchStorageResources,
  },
  {
    id: STEP_RM_STORAGE_QUEUES,
    name: 'Storage Queues',
    entities: [STORAGE_QUEUE_ENTITY_METADATA],
    relationships: [STORAGE_ACCOUNT_QUEUE_RELATIONSHIP_METADATA],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_STORAGE_RESOURCES],
    executionHandler: fetchStorageQueues,
  },
];
