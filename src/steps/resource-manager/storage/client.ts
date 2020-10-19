import { StorageManagementClient } from '@azure/arm-storage';
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

  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  public async iterateStorageBlobContainers(
    storageAccount: StorageAccount,
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

    if ((['Storage', 'StorageV2'] as Kind[]).includes(storageAccount.kind)) {
      this.logger.info(
        {
          resourceGroupName: resourceGroup,
          storageAccountName: accountName,
          storageAccountKind: storageAccount.kind,
        },
        'Fetching queues for storage account',
      );
      return iterateAllResources({
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

    if ((['Storage', 'StorageV2'] as Kind[]).includes(storageAccount.kind)) {
      this.logger.info(
        {
          resourceGroupName: resourceGroup,
          storageAccountName: accountName,
          storageAccountKind: storageAccount.kind,
        },
        'Fetching tables for storage account',
      );
      return iterateAllResources({
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
  }

  public async iterateFileShares(
    storageAccount: StorageAccount,
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
