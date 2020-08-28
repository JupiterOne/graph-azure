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
  ACCOUNT_STORAGE_BLOB_SERVICE_RELATIONSHIP_TYPE,
  ACCOUNT_STORAGE_FILE_SERVICE_RELATIONSHIP_TYPE,
  STEP_RM_STORAGE_RESOURCES,
  STORAGE_BLOB_SERVICE_CONTAINER_RELATIONSHIP_TYPE,
  STORAGE_BLOB_SERVICE_ENTITY_TYPE,
  STORAGE_CONTAINER_ENTITY_TYPE,
  STORAGE_FILE_SERVICE_ENTITY_TYPE,
  STORAGE_FILE_SERVICE_SHARE_RELATIONSHIP_TYPE,
  STORAGE_FILE_SHARE_ENTITY_TYPE,
  STORAGE_BLOB_SERVICE_ENTITY_CLASS,
  STORAGE_CONTAINER_ENTITY_CLASS,
  ACCOUNT_STORAGE_BLOB_SERVICE_RELATIONSHIP_CLASS,
  STORAGE_BLOB_SERVICE_CONTAINER_RELATIONSHIP_CLASS,
  STORAGE_FILE_SERVICE_ENTITY_CLASS,
  STORAGE_FILE_SHARE_ENTITY_CLASS,
  ACCOUNT_STORAGE_FILE_SERVICE_RELATIONSHIP_CLASS,
  STORAGE_FILE_SERVICE_SHARE_RELATIONSHIP_CLASS,
} from './constants';
import {
  createStorageContainerEntity,
  createStorageFileShareEntity,
  createStorageServiceEntity,
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
        logger.info(logInfo, 'Processing storage account service...');
        await synchronizer(
          context,
          accountEntity,
          webLinker,
          storageAccount,
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
    'blob',
  );

  await jobState.addEntity(serviceEntity);

  await jobState.addRelationship(
    createDirectRelationship({
      _class: ACCOUNT_STORAGE_BLOB_SERVICE_RELATIONSHIP_CLASS,
      from: accountEntity,
      to: serviceEntity,
    }),
  );

  await jobState.addRelationship(
    await createResourceGroupResourceRelationship(context, serviceEntity),
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
        createDirectRelationship({
          _class: STORAGE_BLOB_SERVICE_CONTAINER_RELATIONSHIP_CLASS,
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
    'file',
  );

  await jobState.addEntity(serviceEntity);

  await jobState.addRelationship(
    createDirectRelationship({
      _class: ACCOUNT_STORAGE_FILE_SERVICE_RELATIONSHIP_CLASS,
      from: accountEntity,
      to: serviceEntity,
    }),
  );

  await jobState.addRelationship(
    await createResourceGroupResourceRelationship(context, serviceEntity),
  );

  await client.iterateFileShares(storageAccount, async (e) => {
    const fileShareEntity = createStorageFileShareEntity(
      webLinker,
      storageAccount,
      e,
    );

    await jobState.addEntity(fileShareEntity);

    await jobState.addRelationship(
      createDirectRelationship({
        _class: STORAGE_BLOB_SERVICE_CONTAINER_RELATIONSHIP_CLASS,
        from: serviceEntity,
        to: fileShareEntity,
        properties: {
          storageAccountId: storageAccount.id,
        },
      }),
    );
  });
}

export const storageSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: STEP_RM_STORAGE_RESOURCES,
    name: 'Storage Resources',
    entities: [
      {
        resourceName: '[RM] Blob Storage Service',
        _type: STORAGE_BLOB_SERVICE_ENTITY_TYPE,
        _class: STORAGE_BLOB_SERVICE_ENTITY_CLASS,
      },
      {
        resourceName: '[RM] Blob Storage Container',
        _type: STORAGE_CONTAINER_ENTITY_TYPE,
        _class: STORAGE_CONTAINER_ENTITY_CLASS,
      },
      {
        resourceName: '[RM] File Storage Service',
        _type: STORAGE_FILE_SERVICE_ENTITY_TYPE,
        _class: STORAGE_FILE_SERVICE_ENTITY_CLASS,
      },
      {
        resourceName: '[RM] File Storage Share',
        _type: STORAGE_FILE_SHARE_ENTITY_TYPE,
        _class: STORAGE_FILE_SHARE_ENTITY_CLASS,
      },
    ],
    relationships: [
      {
        _type: ACCOUNT_STORAGE_BLOB_SERVICE_RELATIONSHIP_TYPE,
        sourceType: ACCOUNT_ENTITY_TYPE,
        _class: ACCOUNT_STORAGE_BLOB_SERVICE_RELATIONSHIP_CLASS,
        targetType: STORAGE_BLOB_SERVICE_ENTITY_TYPE,
      },
      createResourceGroupResourceRelationshipMetadata(
        STORAGE_BLOB_SERVICE_ENTITY_TYPE,
      ),
      {
        _type: STORAGE_BLOB_SERVICE_CONTAINER_RELATIONSHIP_TYPE,
        sourceType: STORAGE_BLOB_SERVICE_ENTITY_TYPE,
        _class: STORAGE_BLOB_SERVICE_CONTAINER_RELATIONSHIP_CLASS,
        targetType: STORAGE_CONTAINER_ENTITY_TYPE,
      },
      {
        _type: ACCOUNT_STORAGE_FILE_SERVICE_RELATIONSHIP_TYPE,
        sourceType: ACCOUNT_ENTITY_TYPE,
        _class: ACCOUNT_STORAGE_FILE_SERVICE_RELATIONSHIP_CLASS,
        targetType: STORAGE_FILE_SERVICE_ENTITY_TYPE,
      },
      createResourceGroupResourceRelationshipMetadata(
        STORAGE_FILE_SERVICE_ENTITY_TYPE,
      ),
      {
        _type: STORAGE_FILE_SERVICE_SHARE_RELATIONSHIP_TYPE,
        sourceType: STORAGE_FILE_SERVICE_ENTITY_TYPE,
        _class: STORAGE_FILE_SERVICE_SHARE_RELATIONSHIP_CLASS,
        targetType: STORAGE_FILE_SHARE_ENTITY_TYPE,
      },
    ],
    // From what I can tell, the following are not yet implemented
    // STORAGE_QUEUE_SERVICE_ENTITY_TYPE,
    // ACCOUNT_STORAGE_QUEUE_SERVICE_RELATIONSHIP_TYPE,

    // STORAGE_TABLE_SERVICE_ENTITY_TYPE,
    // ACCOUNT_STORAGE_TABLE_SERVICE_RELATIONSHIP_TYPE,
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchStorageResources,
  },
];
