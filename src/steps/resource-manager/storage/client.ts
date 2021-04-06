import { StorageManagementClient } from '@azure/arm-storage';
import { BlobServiceClient } from '@azure/storage-blob';
import { QueueServiceClient } from '@azure/storage-queue';
import {
  BlobContainer,
  FileShare,
  StorageAccount,
  Table,
  StorageQueue,
  Kind,
} from '@azure/arm-storage/esm/models';

import {
  Client,
  iterateAllResources,
} from '../../../azure/resource-manager/client';
import { resourceGroupName } from '../../../azure/utils';
import { IntegrationConfig } from '../../../types';
import { IntegrationLogger } from '@jupiterone/integration-sdk-core';
import { ClientSecretCredential } from '@azure/identity';

export function createStorageAccountServiceClient(options: {
  config: IntegrationConfig;
  logger: IntegrationLogger;
  storageAccount: { name: string; kind: Kind };
}) {
  const { config, logger, storageAccount } = options;
  const credential = new ClientSecretCredential(
    config.directoryId,
    config.clientId,
    config.clientSecret,
  );

  return {
    getBlobServiceProperties: async () => {
      const client = new BlobServiceClient(
        `https://${storageAccount.name}.blob.core.windows.net`,
        credential,
      );
      try {
        const response = await client.getProperties();
        return response._response.parsedBody;
      } catch (e) {
        logger.warn(
          {
            storageAccount,
            e,
          },
          'Failed to get blob service properties for storage account',
        );
      }
    },

    getQueueServiceProperties: async () => {
      if (isServiceEnabledForKind.queue(storageAccount.kind)) {
        const client = new QueueServiceClient(
          `https://${storageAccount.name}.queue.core.windows.net`,
          credential,
        );
        try {
          const response = await client.getProperties();
          return response._response.parsedBody;
        } catch (e) {
          logger.warn(
            {
              storageAccount,
              e,
            },
            'Failed to get queue service properties for storage account',
          );
        }
      }
    },
  };
}

export class StorageClient extends Client {
  public async iterateStorageAccounts(
    callback: (sa: StorageAccount) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      StorageManagementClient,
    );
    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.storageAccounts,
      resourceDescription: 'storage.storageAccounts',
      callback,
    });
  }

  public async iterateStorageBlobContainers(
    storageAccount: {
      name: string;
      id: string;
      kind: Kind;
    },
    callback: (e: BlobContainer) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      StorageManagementClient,
    );
    const resourceGroup = resourceGroupName(storageAccount.id, true)!;
    const accountName = storageAccount.name!;

    if (!isServiceEnabledForKind.blob(storageAccount.kind)) return;

    await iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => {
          return serviceClient.blobContainers.list(resourceGroup, accountName);
        },
        listNext: /* istanbul ignore next: testing iteration might be difficult */ async (
          nextLink: string,
        ) => {
          return serviceClient.blobContainers.listNext(nextLink);
        },
      },
      resourceDescription: 'storage.blobContainers',
      callback,
    });
  }

  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  public async iterateQueues(
    storageAccount: { name: string; id: string; kind: Kind },
    callback: (e: StorageQueue) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      StorageManagementClient,
    );
    const resourceGroup = resourceGroupName(storageAccount.id, true)!;
    const accountName = storageAccount.name!;

    if (!isServiceEnabledForKind.queue(storageAccount.kind)) return;

    await iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => {
          return serviceClient.queue.list(resourceGroup, accountName);
        },
        listNext: async (nextLink: string) => {
          return serviceClient.queue.listNext(nextLink);
        },
      },
      resourceDescription: 'storage.queues',
      callback,
    });
  }

  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  public async iterateTables(
    storageAccount: { name: string; id: string; kind: Kind },
    callback: (e: Table) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      StorageManagementClient,
    );
    const resourceGroup = resourceGroupName(storageAccount.id, true)!;
    const accountName = storageAccount.name;

    if (!isServiceEnabledForKind.table(storageAccount.kind)) return;

    await iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => {
          return serviceClient.table.list(resourceGroup, accountName);
        },
        listNext: async (nextLink: string) => {
          return serviceClient.table.listNext(nextLink);
        },
      },
      resourceDescription: 'storage.tables',
      callback,
    });
  }

  public async iterateFileShares(
    storageAccount: {
      name: string;
      id: string;
      kind: Kind;
    },
    callback: (e: FileShare) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      StorageManagementClient,
    );
    const resourceGroup = resourceGroupName(storageAccount.id, true)!;
    const accountName = storageAccount.name!;

    if (!isServiceEnabledForKind.fileShare(storageAccount.kind)) return;

    await iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => {
          return serviceClient.fileShares.list(resourceGroup, accountName);
        },
        listNext: /* istanbul ignore next: testing iteration might be difficult */ async (
          nextLink: string,
        ) => {
          return serviceClient.fileShares.listNext(nextLink);
        },
      },
      resourceDescription: 'storage.fileShares',
      callback,
    });
  }
}

const isServiceEnabledForKind = {
  table: (kind: Kind) => {
    return getSupportedServicesForKind(kind).includes(StorageService.TABLE);
  },
  queue: (kind: Kind) => {
    return getSupportedServicesForKind(kind).includes(StorageService.QUEUE);
  },
  fileShare: (kind: Kind) => {
    return getSupportedServicesForKind(kind).includes(
      StorageService.FILE_SHARE,
    );
  },
  blob: (kind: Kind) => {
    return getSupportedServicesForKind(kind).includes(StorageService.BLOB);
  },
};

enum StorageService {
  TABLE = 'TABLE',
  FILE_SHARE = 'FILE_SHARE',
  QUEUE = 'QUEUE',
  BLOB = 'BLOB',
}

/**
 * See Azure documentation for available services by each account kind:
 *
 * https://docs.microsoft.com/en-us/azure/storage/common/storage-account-overview
 */
function getSupportedServicesForKind(kind: Kind): StorageService[] {
  switch (kind) {
    case 'Storage':
      return [
        StorageService.BLOB,
        StorageService.FILE_SHARE,
        StorageService.QUEUE,
        StorageService.TABLE,
      ];
    case 'StorageV2':
      return [
        StorageService.BLOB,
        StorageService.FILE_SHARE,
        StorageService.QUEUE,
        StorageService.TABLE,
      ];
    case 'FileStorage':
      return [StorageService.FILE_SHARE];
    case 'BlobStorage':
      return [StorageService.BLOB];
    case 'BlockBlobStorage':
      return [StorageService.BLOB];
  }
}
