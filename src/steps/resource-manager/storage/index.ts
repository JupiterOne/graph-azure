import { StorageAccount, Kind } from '@azure/arm-storage/esm/models';
import {
  createDirectRelationship,
  Entity,
  Step,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker, createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { ACCOUNT_ENTITY_TYPE, STEP_AD_ACCOUNT } from '../../active-directory';
import { StorageClient } from './client';
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
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources';
import {
  KEY_VAULT_SERVICE_ENTITY_TYPE,
  STEP_RM_KEYVAULT_VAULTS,
} from '../key-vault/constants';
export * from './constants';

export async function fetchStorageResources(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new StorageClient(instance.config, logger);

  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  const keyVaultEntityMap = await buildKeyVaultEntityMap(executionContext);

  await client.iterateStorageAccounts(async (storageAccount) => {
    const storageAccountEntity = await jobState.addEntity(
      createStorageAccountEntity(webLinker, storageAccount),
    );
    await createResourceGroupResourceRelationship(
      executionContext,
      storageAccountEntity,
    );

    await synchronizeStorageAccount(
      executionContext,
      accountEntity,
      webLinker,
      storageAccount,
      storageAccountEntity,
      client,
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
      const keyVaultRawData = keyVaultEntity?._rawData?.[0]?.rawData;
      if (!keyVaultRawData) return;

      const rawVaultUri: string = keyVaultRawData.properties?.vaultUri;
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
          _class: RelationshipClass.HAS,
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
        _class: RelationshipClass.HAS,
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
    { _type: entities.STORAGE_ACCOUNT._type },
    async (storageAccountEntity) => {
      await client.iterateQueues(
        (storageAccountEntity as unknown) as {
          name: string;
          id: string;
          kind: Kind;
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

  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  await jobState.iterateEntities(
    { _type: entities.STORAGE_ACCOUNT._type },
    async (storageAccountEntity) => {
      await client.iterateTables(
        (storageAccountEntity as unknown) as {
          name: string;
          id: string;
          kind: Kind;
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

export const storageSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: steps.STORAGE_RESOURCES,
    name: 'Storage Resources',
    entities: [
      entities.STORAGE_ACCOUNT,
      entities.STORAGE_CONTAINER,
      entities.STORAGE_FILE_SHARE,
    ],
    relationships: [
      createResourceGroupResourceRelationshipMetadata(
        entities.STORAGE_ACCOUNT._type,
      ),
      relationships.STORAGE_ACCOUNT_HAS_CONTAINER,
      relationships.STORAGE_ACCOUNT_HAS_FILE_SHARE,
      relationships.STORAGE_ACCOUNT_USES_KEY_VAULT,
    ],
    dependsOn: [
      STEP_AD_ACCOUNT,
      STEP_RM_RESOURCES_RESOURCE_GROUPS,
      STEP_RM_KEYVAULT_VAULTS,
    ],
    executionHandler: fetchStorageResources,
  },
  {
    id: steps.STORAGE_QUEUES,
    name: 'Storage Queues',
    entities: [entities.STORAGE_QUEUE],
    relationships: [relationships.STORAGE_ACCOUNT_HAS_QUEUE],
    dependsOn: [STEP_AD_ACCOUNT, steps.STORAGE_RESOURCES],
    executionHandler: fetchStorageQueues,
  },
  {
    id: steps.STORAGE_TABLES,
    name: 'Storage Tables',
    entities: [entities.STORAGE_TABLE],
    relationships: [relationships.STORAGE_ACCOUNT_HAS_TABLE],
    dependsOn: [STEP_AD_ACCOUNT, steps.STORAGE_RESOURCES],
    executionHandler: fetchStorageTables,
  },
];
