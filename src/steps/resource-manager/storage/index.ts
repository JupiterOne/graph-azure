import { StorageAccount, Kind, SkuTier } from '@azure/arm-storage/esm/models';
import {
  createDirectRelationship,
  Entity,
  RelationshipClass,
  getRawData,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, AzureIntegrationStep } from '../../../types';
import { getAccountEntity } from '../../active-directory';
import { STEP_AD_ACCOUNT } from '../../active-directory/constants';
import { StorageClient, createStorageAccountServiceClient } from './client';
import { steps, entities, relationships } from './constants';
import {
  createStorageContainerEntity,
  createStorageFileShareEntity,
  createStorageAccountEntity,
  createStorageQueueEntity,
  createStorageTableEntity,
} from './converters';
import createResourceGroupResourceRelationship, {
  createResourceGroupResourceRelationshipMetadata,
} from '../utils/createResourceGroupResourceRelationship';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources/constants';
import {
  KEY_VAULT_SERVICE_ENTITY_TYPE,
  STEP_RM_KEYVAULT_VAULTS,
} from '../key-vault/constants';
import { Vault } from '@azure/arm-keyvault/esm/models';
import { ContainerItem } from '@azure/storage-blob';
// import { MonitorClient } from '../monitor/client';
// import { compareAsc } from 'date-fns';

export async function fetchStorageAccounts(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  async function getStorageAccountServiceProperties(storageAccount: {
    name: string;
    kind: Kind;
    skuTier: SkuTier;
    id: string;
  }) {
    const storageAccountServiceClient = createStorageAccountServiceClient({
      config: instance.config,
      logger,
      storageAccount,
    });

    const storageBlobServiceProperties = await storageAccountServiceClient.getBlobServiceProperties();
    const storageQueueServiceProperties = await storageAccountServiceClient.getQueueServiceProperties();
    const storageTableServiceProperties = await storageAccountServiceClient.getTableServiceProperties();

    let lastAccessKeyRegenerationDate: Date | undefined;
    /**
     * We have temporarily disabled this code because it iterates the past 90
     * days of activity logs for every storage account in a subscription.
     *
     * Once this is re-enabled, also re-enable the managed question:
     *
     *    integration-question-azure-storage-account-key-regeneration
     *
     * TODO re-enable lastAccessKeyRegenerationDate
     */
    // const monitorClient = new MonitorClient(instance.config, logger);
    // await monitorClient.iterateActivityLogsFromPreviousNDays(
    //   storageAccount.id as string,
    //   (log) => {
    //     const eventTimestamp = log.eventTimestamp as Date;
    //     if (
    //       log.authorization?.action ===
    //         'Microsoft.Storage/storageAccounts/regenerateKey/action' &&
    //       log.status?.value === 'Succeeded'
    //     ) {
    //       if (
    //         !lastAccessKeyRegenerationDate ||
    //         (lastAccessKeyRegenerationDate &&
    //           compareAsc(eventTimestamp, lastAccessKeyRegenerationDate) === 1)
    //       ) {
    //         lastAccessKeyRegenerationDate = eventTimestamp;
    //       }
    //     }
    //   },
    //   {
    //     select: 'authorization, status, eventTimestamp',
    //   },
    // );

    return {
      blob: storageBlobServiceProperties,
      queue: storageQueueServiceProperties,
      lastAccessKeyRegenerationDate,
      table: storageTableServiceProperties,
    };
  }
  const client = new StorageClient(instance.config, logger);

  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  const keyVaultEntityMap = await buildKeyVaultEntityMap(executionContext);

  await client.iterateStorageAccounts(async (storageAccount) => {
    const storageAccountServiceProperties = await getStorageAccountServiceProperties(
      {
        name: storageAccount.name!,
        kind: storageAccount.kind!,
        skuTier: storageAccount.sku?.tier as SkuTier,
        id: storageAccount.id!,
      },
    );
    const storageAccountEntity = await jobState.addEntity(
      createStorageAccountEntity(
        webLinker,
        storageAccount,
        storageAccountServiceProperties,
      ),
    );
    await createResourceGroupResourceRelationship(
      executionContext,
      storageAccountEntity,
    );

    if (storageAccountUsesKeyVault(storageAccount)) {
      await associateStorageAccountWithKeyVault(
        executionContext,
        storageAccount,
        storageAccountEntity,
        keyVaultEntityMap,
      );
    }
  });
}

async function buildKeyVaultEntityMap(
  executionContext: IntegrationStepContext,
): Promise<{ [key: string]: Entity }> {
  const keyVaultEntityMap: { [key: string]: Entity } = {};
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: KEY_VAULT_SERVICE_ENTITY_TYPE },
    (keyVaultEntity) => {
      const keyVaultRawData = getRawData<Vault>(keyVaultEntity);
      if (!keyVaultRawData) return;

      const rawVaultUri = keyVaultRawData.properties?.vaultUri;
      if (!rawVaultUri) return;

      // NOTE: sometimes the URI is returned with a trailing slash. We must remove it to make sure it matches the URI on the Storage Account
      const vaultUri = rawVaultUri.replace(/\/$/, '');

      if (!vaultUri) return;

      keyVaultEntityMap[vaultUri] = keyVaultEntity;
    },
  );

  return keyVaultEntityMap;
}

function storageAccountUsesKeyVault(storageAccount: StorageAccount): boolean {
  return !!(
    storageAccount.encryption?.keySource === 'Microsoft.Keyvault' &&
    storageAccount.encryption?.keyVaultProperties?.keyVaultUri
  );
}

async function associateStorageAccountWithKeyVault(
  executionContext: IntegrationStepContext,
  storageAccount: StorageAccount,
  storageAccountEntity: Entity,
  keyVaultEntityMap: { [key: string]: Entity },
): Promise<void> {
  if (!storageAccount.encryption?.keyVaultProperties) return;

  const {
    keyName,
    keyVaultUri,
    keyVersion,
  } = storageAccount.encryption?.keyVaultProperties;

  if (!keyVaultUri) return;

  // NOTE: sometimes the URI is returned with a trailing slash. We must remove it to make sure it matches the URI on the Key Vault
  const keyVaultEntity = keyVaultEntityMap[keyVaultUri.replace(/\/$/, '')];

  if (!keyVaultEntity) return;

  const { jobState } = executionContext;

  await jobState.addRelationship(
    createDirectRelationship({
      _class: relationships.STORAGE_ACCOUNT_USES_KEY_VAULT._class,
      from: storageAccountEntity,
      to: keyVaultEntity,
      properties: {
        keyName,
        keyVaultUri,
        keyVersion,
      },
    }),
  );
}

export async function fetchStorageFileShares(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new StorageClient(instance.config, logger);

  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  await jobState.iterateEntities(
    { _type: entities.STORAGE_ACCOUNT._type },
    async (storageAccountEntity) => {
      const storageAccount = getRawData<StorageAccount>(storageAccountEntity);
      if (!storageAccount) return;

      await client.iterateFileShares(
        {
          name: storageAccount.name!,
          id: storageAccount.id!,
          kind: storageAccount.kind!,
          skuTier: storageAccount.sku?.tier as SkuTier,
        },
        async (fileShare) => {
          const fileShareEntity = createStorageFileShareEntity(
            webLinker,
            storageAccountEntity,
            fileShare,
          );

          await jobState.addEntity(fileShareEntity);

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: storageAccountEntity,
              to: fileShareEntity,
            }),
          );
        },
      );
    },
  );
}

export async function fetchStorageContainers(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new StorageClient(instance.config, logger);

  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  await jobState.iterateEntities(
    { _type: entities.STORAGE_ACCOUNT._type },
    async (storageAccountEntity) => {
      const storageAccount = getRawData<StorageAccount>(storageAccountEntity);
      if (!storageAccount) return;

      const storageAccountServiceClient = createStorageAccountServiceClient({
        config: instance.config,
        logger,
        storageAccount: {
          name: storageAccount.name!,
          kind: storageAccount.kind!,
          skuTier: storageAccount.sku?.tier as SkuTier,
        },
      });

      const metadataByContainerNameMap = new Map<
        string,
        ContainerItem['metadata']
      >();
      try {
        await storageAccountServiceClient.iterateContainers((c) => {
          metadataByContainerNameMap.set(c.name, c.metadata);
        });
      } catch (err) {
        logger.warn(
          {
            err,
            storageAccountName: storageAccount.name,
            storageAccountId: storageAccount.id,
          },
          'Unable to get metadata for containers',
        );
      }

      await client.iterateStorageBlobContainers(
        {
          name: storageAccount.name!,
          id: storageAccount.id!,
          kind: storageAccount.kind!,
          skuTier: storageAccount.sku?.tier as SkuTier,
        },
        async (container) => {
          const containerEntity = createStorageContainerEntity(
            webLinker,
            storageAccountEntity,
            container,
            metadataByContainerNameMap.get(container.name!),
          );

          await jobState.addEntity(containerEntity);

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: storageAccountEntity,
              to: containerEntity,
            }),
          );
        },
      );
    },
  );
}

export async function fetchStorageQueues(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new StorageClient(instance.config, logger);

  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  await jobState.iterateEntities(
    { _type: entities.STORAGE_ACCOUNT._type },
    async (storageAccountEntity) => {
      const storageAccount = getRawData<StorageAccount>(storageAccountEntity);
      if (!storageAccount) return;

      await client.iterateQueues(
        {
          name: storageAccount.name!,
          id: storageAccount.id!,
          kind: storageAccount.kind!,
          skuTier: storageAccount.sku?.tier as SkuTier,
        },
        async (e) => {
          const queueEntity = createStorageQueueEntity(
            webLinker,
            storageAccountEntity,
            e,
          );

          await jobState.addEntity(queueEntity);

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: storageAccountEntity,
              to: queueEntity,
            }),
          );
        },
      );
    },
  );
}

export async function fetchStorageTables(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new StorageClient(instance.config, logger);

  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  await jobState.iterateEntities(
    { _type: entities.STORAGE_ACCOUNT._type },
    async (storageAccountEntity) => {
      const storageAccount = getRawData<StorageAccount>(storageAccountEntity);
      if (!storageAccount) return;

      await client.iterateTables(
        {
          name: storageAccount.name!,
          id: storageAccount.id!,
          kind: storageAccount.kind!,
          skuTier: storageAccount.sku?.tier as SkuTier,
        },
        async (e) => {
          const tableEntity = createStorageTableEntity(
            webLinker,
            storageAccountEntity,
            e,
          );

          await jobState.addEntity(tableEntity);

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: storageAccountEntity,
              to: tableEntity,
            }),
          );
        },
      );
    },
  );
}

export const storageSteps: AzureIntegrationStep[] = [
  {
    id: steps.STORAGE_ACCOUNTS,
    name: 'Storage Accounts',
    entities: [entities.STORAGE_ACCOUNT],
    relationships: [
      createResourceGroupResourceRelationshipMetadata(
        entities.STORAGE_ACCOUNT._type,
      ),
      relationships.STORAGE_ACCOUNT_USES_KEY_VAULT,
    ],
    dependsOn: [
      STEP_AD_ACCOUNT,
      STEP_RM_RESOURCES_RESOURCE_GROUPS,
      STEP_RM_KEYVAULT_VAULTS,
    ],
    executionHandler: fetchStorageAccounts,
    permissions: ['Microsoft.Storage/storageAccounts/read'],
  },
  {
    id: steps.STORAGE_FILE_SHARES,
    name: 'Storage File Shares',
    entities: [entities.STORAGE_FILE_SHARE],
    relationships: [relationships.STORAGE_ACCOUNT_HAS_FILE_SHARE],
    dependsOn: [STEP_AD_ACCOUNT, steps.STORAGE_ACCOUNTS],
    executionHandler: fetchStorageFileShares,
    permissions: [
      'Microsoft.Storage/storageAccounts/fileServices/shares/read',
      'Microsoft.Storage/storageAccounts/fileServices/shares/read',
    ],
  },
  {
    id: steps.STORAGE_CONTAINERS,
    name: 'Storage Containers',
    entities: [entities.STORAGE_CONTAINER],
    relationships: [relationships.STORAGE_ACCOUNT_HAS_CONTAINER],
    dependsOn: [STEP_AD_ACCOUNT, steps.STORAGE_ACCOUNTS],
    executionHandler: fetchStorageContainers,
    permissions: [
      'Microsoft.Storage/storageAccounts/blobServices/containers/read',
    ],
  },
  {
    id: steps.STORAGE_QUEUES,
    name: 'Storage Queues',
    entities: [entities.STORAGE_QUEUE],
    relationships: [relationships.STORAGE_ACCOUNT_HAS_QUEUE],
    dependsOn: [STEP_AD_ACCOUNT, steps.STORAGE_ACCOUNTS],
    executionHandler: fetchStorageQueues,
    permissions: ['Microsoft.Storage/storageAccounts/queueServices/read'],
  },
  {
    id: steps.STORAGE_TABLES,
    name: 'Storage Tables',
    entities: [entities.STORAGE_TABLE],
    relationships: [relationships.STORAGE_ACCOUNT_HAS_TABLE],
    dependsOn: [STEP_AD_ACCOUNT, steps.STORAGE_ACCOUNTS],
    executionHandler: fetchStorageTables,
    permissions: ['Microsoft.Storage/storageAccounts/queueServices/read'],
  },
];
