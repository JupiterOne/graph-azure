import {
  BlobContainer,
  FileShare,
  StorageAccount,
  StorageQueue,
} from '@azure/arm-storage/esm/models';
import {
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import { resourceGroupName } from '../../../azure/utils';
import {
  STORAGE_ACCOUNT_ENTITY_METADATA,
  STORAGE_CONTAINER_ENTITY_METADATA,
  STORAGE_FILE_SHARE_ENTITY_METADATA,
  STORAGE_QUEUE_ENTITY_METADATA,
} from './constants';

/**
 * Creates an entity for a storage service. Storage accounts have one or more
 * services enabled.
 */
export function createStorageAccountEntity(
  webLinker: AzureWebLinker,
  data: StorageAccount,
): Entity {
  const encryptedServices = data.encryption?.services;
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id,
        _type: STORAGE_ACCOUNT_ENTITY_METADATA._type,
        _class: STORAGE_ACCOUNT_ENTITY_METADATA._class,
        displayName: data.name,
        webLink: webLinker.portalResourceUrl(data.id),
        region: data.location,
        resourceGroup: resourceGroupName(data.id),
        kind: data.kind,
        sku: data.sku?.name,
        endpoints: data.primaryEndpoints
          ? Object.values(data.primaryEndpoints)
          : undefined,
        enableHttpsTrafficOnly: data.enableHttpsTrafficOnly,
        category: ['infrastructure'],
        encryptedFileShare:
          encryptedServices?.file?.enabled !== undefined
            ? encryptedServices.file?.enabled
            : undefined,
        encryptedBlob:
          encryptedServices?.blob?.enabled !== undefined
            ? encryptedServices.blob?.enabled
            : undefined,
        encryptedTable:
          encryptedServices?.table?.enabled !== undefined
            ? encryptedServices.table?.enabled
            : undefined,
        encryptedQueue:
          encryptedServices?.queue?.enabled !== undefined
            ? encryptedServices.queue?.enabled
            : undefined,
      },
      tagProperties: ['environment'],
    },
  });
}

/**
 * Creates an integration entity for a Blob service container (similar to S3
 * bucket).
 *
 * * Containers do not currently support tagging. See /docs/tagging.md.
 * * Containers are considered to be encrypted when the storage account is
 *   configured as encrypted. See
 *   https://azure.microsoft.com/en-us/blog/announcing-default-encryption-for-azure-blobs-files-table-and-queue-storage/
 */
export function createStorageContainerEntity(
  webLinker: AzureWebLinker,
  account: StorageAccount,
  data: BlobContainer,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _type: STORAGE_CONTAINER_ENTITY_METADATA._type,
        _class: STORAGE_CONTAINER_ENTITY_METADATA._class,
        webLink: webLinker.portalResourceUrl(data.id),
        resourceGroup: resourceGroupName(data.id),
        public: !!(
          data.publicAccess && /(container|blob)/i.test(data.publicAccess)
        ),
        publicAccess: data.publicAccess,
        classification: null,
        encrypted: !!account.encryption?.services?.blob?.enabled,
      },
    },
  });
}

/**
 * Creates an integration entity for a Files service file share.
 *
 * * Files are considered to be encrypted when the storage account is
 *   configured as encrypted. See
 *   https://azure.microsoft.com/en-us/blog/announcing-default-encryption-for-azure-blobs-files-table-and-queue-storage/
 */
export function createStorageFileShareEntity(
  webLinker: AzureWebLinker,
  account: StorageAccount,
  data: FileShare,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _type: STORAGE_FILE_SHARE_ENTITY_METADATA._type,
        _class: STORAGE_FILE_SHARE_ENTITY_METADATA._class,
        webLink: webLinker.portalResourceUrl(data.id),
        resourceGroup: resourceGroupName(data.id),
        classification: null,
        encrypted: !!account.encryption?.services?.file?.enabled,
      },
    },
  });
}

/**
 * Creates an integration entity for a Files service file share.
 *
 * * Files are considered to be encrypted when the storage account is
 *   configured as encrypted. See
 *   https://azure.microsoft.com/en-us/blog/announcing-default-encryption-for-azure-blobs-files-table-and-queue-storage/
 */
export function createStorageQueueEntity(
  webLinker: AzureWebLinker,
  storageAccountEntity: Entity,
  data: StorageQueue,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _type: STORAGE_QUEUE_ENTITY_METADATA._type,
        _class: STORAGE_QUEUE_ENTITY_METADATA._class,
        webLink: webLinker.portalResourceUrl(data.id),
        name: data.name,
        displayName: data.name,
        type: data.type,
        resourceGroup: resourceGroupName(data.id),
        encrypted: storageAccountEntity.encryptedQueue,
      },
    },
  });
}
