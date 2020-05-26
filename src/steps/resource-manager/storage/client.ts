import { StorageManagementClient } from "@azure/arm-storage";
import {
  BlobContainer,
  FileShare,
  StorageAccount,
} from "@azure/arm-storage/esm/models";

import {
  Client,
  iterateAllResources,
  ListResourcesEndpoint,
} from "../../../azure/resource-manager/client";
import { resourceGroupName } from "../../../azure/utils";

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
      resourceDescription: "storage.storageAccounts",
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
      resourceDescription: "storage.blobContainers",
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
      resourceDescription: "storage.fileShares",
      callback,
    });
  }
}
