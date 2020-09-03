import { StorageManagementClient } from '@azure/arm-storage';
import {
  BlobContainer,
  FileShare,
  StorageAccount,
  StorageQueue,
} from '@azure/arm-storage/esm/models';

interface ListStorageAccountResourcesEndpoint extends ListResourcesEndpoint {
  list<ListResponseType>(
    resourceGroupName: string,
    accountName: string,
  ): Promise<ListResponseType>;
  listNext<ListResponseType>(nextLink: string): Promise<ListResponseType>;
}

interface IterateAllStorageAccountResourcesOptions<ResourceType>
  extends IterateAllResourcesOptions<any, ResourceType> {
  resourceGroupName: string;
  accountName: string;
  serviceClient: StorageManagementClient;
  resourceEndpoint: ListStorageAccountResourcesEndpoint;
}

async function iterateAllStorageAccountResources<ResourceType>({
  serviceClient,
  resourceEndpoint,
  resourceDescription,
  callback,
  logger,
  resourceGroupName,
  accountName,
}: IterateAllStorageAccountResourcesOptions<ResourceType>) {
  return iterateAllResources({
    logger,
    serviceClient,
    resourceEndpoint: {
      list: async () => {
        try {
          const resources = await resourceEndpoint.list(
            resourceGroupName,
            accountName,
          );
          return resources;
        } catch (err) {
          if (err?.body?.code === 'FeatureNotSupportedForAccount') {
            // Different storage account kinds support different resources (e.g. BlobStorage does not support queues)
            const response: any = [];
            response._response = { request: err?.request };
            return response;
          }
          throw err;
        }
      },
      listNext: /* istanbul ignore next: testing iteration might be difficult */ async (
        nextLink: string,
      ) => {
        return resourceEndpoint.listNext(nextLink);
      },
    } as ListResourcesEndpoint,
    resourceDescription,
    callback,
  });
}

import {
  Client,
  iterateAllResources,
  ListResourcesEndpoint,
  IterateAllResourcesOptions,
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
      } as ListResourcesEndpoint,
      resourceDescription: 'storage.blobContainers',
      callback,
    });
  }

  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  public async iterateQueues(
    storageAccount: { name: string; id: string },
    callback: (e: StorageQueue) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      StorageManagementClient,
    );
    const resourceGroup = resourceGroupName(storageAccount.id, true)!;
    const accountName = storageAccount.name!;

    return iterateAllStorageAccountResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.queue,
      resourceGroupName: resourceGroup,
      accountName,
      resourceDescription: 'storage.queues',
      callback,
    });
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
      } as ListResourcesEndpoint,
      resourceDescription: 'storage.fileShares',
      callback,
    });
  }
}
