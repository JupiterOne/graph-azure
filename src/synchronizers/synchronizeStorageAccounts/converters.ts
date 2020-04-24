import {
  StorageAccount,
  BlobContainer,
  FileShare,
  EncryptionServices,
} from "@azure/arm-storage/esm/models";
import {
  createIntegrationEntity,
  EntityFromIntegration,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { AzureWebLinker } from "../../azure";
import { resourceGroupName } from "../../azure/utils";
import {
  STORAGE_BLOB_SERVICE_ENTITY_CLASS,
  STORAGE_BLOB_SERVICE_ENTITY_TYPE,
  STORAGE_FILE_SERVICE_ENTITY_CLASS,
  STORAGE_FILE_SERVICE_ENTITY_TYPE,
  STORAGE_QUEUE_SERVICE_ENTITY_CLASS,
  STORAGE_QUEUE_SERVICE_ENTITY_TYPE,
  STORAGE_TABLE_SERVICE_ENTITY_CLASS,
  STORAGE_TABLE_SERVICE_ENTITY_TYPE,
  STORAGE_CONTAINER_ENTITY_TYPE,
  STORAGE_CONTAINER_ENTITY_CLASS,
  STORAGE_FILE_SHARE_ENTITY_TYPE,
  STORAGE_FILE_SHARE_ENTITY_CLASS,
} from "../../jupiterone";

type StorageAccountServiceConfig = {
  type: string;
  class: string | string[];
  pathSuffix: string;
};

type StorageAccountServiceConfigMap = {
  blob: StorageAccountServiceConfig;
  file: StorageAccountServiceConfig;
  queue: StorageAccountServiceConfig;
  table: StorageAccountServiceConfig;
};

const storageAccountServiceConfig: StorageAccountServiceConfigMap = {
  blob: {
    type: STORAGE_BLOB_SERVICE_ENTITY_TYPE,
    class: STORAGE_BLOB_SERVICE_ENTITY_CLASS,
    pathSuffix: "/containersList",
  },
  file: {
    type: STORAGE_FILE_SERVICE_ENTITY_TYPE,
    class: STORAGE_FILE_SERVICE_ENTITY_CLASS,
    pathSuffix: "/fileList",
  },
  queue: {
    type: STORAGE_QUEUE_SERVICE_ENTITY_TYPE,
    class: STORAGE_QUEUE_SERVICE_ENTITY_CLASS,
    pathSuffix: "/queueList",
  },
  table: {
    type: STORAGE_TABLE_SERVICE_ENTITY_TYPE,
    class: STORAGE_TABLE_SERVICE_ENTITY_CLASS,
    pathSuffix: "/tableList",
  },
};

/**
 * Creates an entity for a storage service. Storage accounts have one or more
 * services enabled.
 */
export function createStorageServiceEntity(
  webLinker: AzureWebLinker,
  data: StorageAccount,
  service: keyof EncryptionServices,
): EntityFromIntegration {
  const config = storageAccountServiceConfig[service];
  const endpoint = data.primaryEndpoints![service];

  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: `${data.id}#${service}`,
        _type: config.type,
        _class: config.class,
        displayName: `${data.name} (${service})`,
        webLink: webLinker.portalResourceUrl(`${data.id}${config.pathSuffix}`),
        region: data.location,
        resourceGroup: resourceGroupName(data.id),
        kind: data.kind,
        sku: data.sku?.name,
        endpoints: [endpoint],
        enableHttpsTrafficOnly: data.enableHttpsTrafficOnly,
        category: ["infrastructure"],
        encrypted: !!data.encryption?.services?.[service]?.enabled,
      },
      tagProperties: ["environment"],
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
): EntityFromIntegration {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _type: STORAGE_CONTAINER_ENTITY_TYPE,
        _class: STORAGE_CONTAINER_ENTITY_CLASS,
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
): EntityFromIntegration {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _type: STORAGE_FILE_SHARE_ENTITY_TYPE,
        _class: STORAGE_FILE_SHARE_ENTITY_CLASS,
        webLink: webLinker.portalResourceUrl(data.id),
        resourceGroup: resourceGroupName(data.id),
        classification: null,
        encrypted: !!account.encryption?.services?.file?.enabled,
      },
    },
  });
}
