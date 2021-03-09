import {
  BlobContainer,
  FileShare,
  StorageAccount,
  StorageQueue,
  Table,
  Endpoints,
} from '@azure/arm-storage/esm/models';
import {
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import { resourceGroupName } from '../../../azure/utils';
import flatten from '../utils/flatten';
import { entities } from './constants';

/**
 * J1 entity properties cannot be arrays of objects; create an array of string endpoints
 */
function getArrayOfStorageAccountEndpoints(
  endpoints?: Endpoints,
): string[] | undefined {
  if (endpoints) {
    return [
      endpoints.blob,
      endpoints.queue,
      endpoints.table,
      endpoints.file,
      endpoints.web,
      endpoints.dfs,
      endpoints.microsoftEndpoints?.blob,
      endpoints.microsoftEndpoints?.queue,
      endpoints.microsoftEndpoints?.table,
      endpoints.microsoftEndpoints?.file,
      endpoints.microsoftEndpoints?.web,
      endpoints.microsoftEndpoints?.dfs,
      endpoints.internetEndpoints?.blob,
      endpoints.internetEndpoints?.file,
      endpoints.internetEndpoints?.web,
      endpoints.internetEndpoints?.dfs,
    ].filter((e): e is string => e !== undefined);
  }
}

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
        _type: entities.STORAGE_ACCOUNT._type,
        _class: entities.STORAGE_ACCOUNT._class,
        displayName: data.name,
        webLink: webLinker.portalResourceUrl(data.id),
        region: data.location,
        resourceGroup: resourceGroupName(data.id),
        kind: data.kind,
        sku: data.sku?.name,
        endpoints: getArrayOfStorageAccountEndpoints(data.primaryEndpoints),
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
        allowBlobPublicAccess: data.allowBlobPublicAccess,
        ...flatten({
          encryption: {
            keySource: data.encryption?.keySource,
            keyVaultProperties: data.encryption?.keyVaultProperties,
          },
        }),
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
        _type: entities.STORAGE_CONTAINER._type,
        _class: entities.STORAGE_CONTAINER._class,
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
        _type: entities.STORAGE_FILE_SHARE._type,
        _class: entities.STORAGE_FILE_SHARE._class,
        webLink: webLinker.portalResourceUrl(data.id),
        resourceGroup: resourceGroupName(data.id),
        classification: null,
        encrypted: !!account.encryption?.services?.file?.enabled,
      },
    },
  });
}

export function createStorageQueueEntity(
  webLinker: AzureWebLinker,
  storageAccountEntity: Entity,
  data: StorageQueue,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _type: entities.STORAGE_QUEUE._type,
        _class: entities.STORAGE_QUEUE._class,
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

export function createStorageTableEntity(
  webLinker: AzureWebLinker,
  storageAccountEntity: Entity,
  data: Table,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _type: entities.STORAGE_TABLE._type,
        _class: entities.STORAGE_TABLE._class,
        webLink: webLinker.portalResourceUrl(data.id),
        name: data.name,
        displayName: data.name,
        tableName: data.tableName,
        type: data.type,
        resourceGroup: resourceGroupName(data.id),
        classification: null,
        encrypted: !!storageAccountEntity.encryptedTable,
      },
    },
  });
}
