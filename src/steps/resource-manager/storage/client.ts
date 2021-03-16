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
  const { config, storageAccount } = options;
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
      const response = await client.getProperties();
      return response._response.parsedBody;
    },

    getQueueServiceProperties: async () => {
      if (isServiceEnabledForKind.queue(storageAccount.kind)) {
        const client = new QueueServiceClient(
          `https://${storageAccount.name}.queue.core.windows.net`,
          credential,
        );
        const response = await client.getProperties();
        return response._response.parsedBody;
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
    },
    callback: (e: BlobContainer) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      StorageManagementClient,
    );
    const resourceGroup = resourceGroupName(storageAccount.id, true)!;
    const accountName = storageAccount.name!;

    return iterateAllResources({
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

    if (isServiceEnabledForKind.queue(storageAccount.kind)) {
      try {
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
      } catch (err) {
        const azureErrorCode = err._cause?.code;
        if (
          azureErrorCode === 'FeatureNotSupportedForAccount' ||
          azureErrorCode === 'OperationNotAllowedOnKind'
        ) {
          this.logger.info(
            {
              err,
              resourceGroupName: resourceGroup,
              storageAccountName: accountName,
              storageAccountKind: storageAccount.kind,
            },
            'Could not fetch queues for storage account kind.',
          );
        } else {
          throw err;
        }
      }
    }
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

    if (isServiceEnabledForKind.table(storageAccount.kind)) {
      try {
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
      } catch (err) {
        const azureErrorCode = err._cause?.code;
        if (
          azureErrorCode === 'FeatureNotSupportedForAccount' ||
          azureErrorCode === 'OperationNotAllowedOnKind'
        ) {
          this.logger.info(
            {
              err,
              resourceGroupName: resourceGroup,
              storageAccountName: accountName,
              storageAccountKind: storageAccount.kind,
            },
            'Could not fetch tables for storage account kind.',
          );
        } else {
          throw err;
        }
      }
    }
  }

  public async iterateFileShares(
    storageAccount: {
      name: string;
      id: string;
    },
    callback: (e: FileShare) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      StorageManagementClient,
    );
    const resourceGroup = resourceGroupName(storageAccount.id, true)!;
    const accountName = storageAccount.name!;

    return iterateAllResources({
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
    return (['Storage', 'StorageV2'] as Kind[]).includes(kind);
  },
  queue: (kind: Kind) => {
    return (['Storage', 'StorageV2'] as Kind[]).includes(kind);
  },
};
