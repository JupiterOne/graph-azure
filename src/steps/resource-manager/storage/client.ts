import { StorageManagementClient } from '@azure/arm-storage';
import { TableServiceClient } from '@azure/data-tables';
import { BlobServiceClient } from '@azure/storage-blob';
import { QueueServiceClient } from '@azure/storage-queue';
import {
  BlobContainer,
  FileShare,
  StorageAccount,
  Table,
  StorageQueue,
  Kind,
  SkuTier,
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
  storageAccount: { name: string; kind: Kind; skuTier: SkuTier };
}) {
  const { config, logger, storageAccount } = options;
  const credential = new ClientSecretCredential(
    config.directoryId,
    config.clientId,
    config.clientSecret,
  );

  return {
    getBlobServiceProperties: async () => {
      if (
        isServiceEnabledForKindAndTier.blob(
          storageAccount.kind,
          storageAccount.skuTier,
        )
      ) {
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
      }
    },

    getQueueServiceProperties: async () => {
      if (
        isServiceEnabledForKindAndTier.queue(
          storageAccount.kind,
          storageAccount.skuTier,
        )
      ) {
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

    getTableServiceProperties: async () => {
      if (
        isServiceEnabledForKindAndTier.blob(
          storageAccount.kind,
          storageAccount.skuTier,
        )
      ) {
        const client = new TableServiceClient(
          `https://${storageAccount.name}.table.core.windows.net`,
          credential,
        );
        try {
          const response = await client.getProperties();
          return response;
        } catch (e) {
          logger.warn(
            {
              storageAccount,
              e,
            },
            'Failed to get table service properties for storage account',
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
      skuTier: SkuTier;
    },
    callback: (e: BlobContainer) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      StorageManagementClient,
    );
    const resourceGroup = resourceGroupName(storageAccount.id, true)!;
    const accountName = storageAccount.name!;

    if (
      !isServiceEnabledForKindAndTier.blob(
        storageAccount.kind,
        storageAccount.skuTier,
      )
    )
      return;

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
    storageAccount: { name: string; id: string; kind: Kind; skuTier: SkuTier },
    callback: (e: StorageQueue) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      StorageManagementClient,
    );
    const resourceGroup = resourceGroupName(storageAccount.id, true)!;
    const accountName = storageAccount.name!;

    if (
      !isServiceEnabledForKindAndTier.queue(
        storageAccount.kind,
        storageAccount.skuTier,
      )
    )
      return;

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
    storageAccount: { name: string; id: string; kind: Kind; skuTier: SkuTier },
    callback: (e: Table) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      StorageManagementClient,
    );
    const resourceGroup = resourceGroupName(storageAccount.id, true)!;
    const accountName = storageAccount.name;

    if (
      !isServiceEnabledForKindAndTier.table(
        storageAccount.kind,
        storageAccount.skuTier,
      )
    )
      return;

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
      skuTier: SkuTier;
    },
    callback: (e: FileShare) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      StorageManagementClient,
    );
    const resourceGroup = resourceGroupName(storageAccount.id, true)!;
    const accountName = storageAccount.name!;

    if (
      !isServiceEnabledForKindAndTier.fileShare(
        storageAccount.kind,
        storageAccount.skuTier,
      )
    )
      return;

    await iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async function listFileShares() {
          return serviceClient.fileShares.list(resourceGroup, accountName);
        },
        listNext: /* istanbul ignore next: testing iteration might be difficult */ async function listNextFileShares(
          nextLink: string,
        ) {
          return serviceClient.fileShares.listNext(nextLink);
        },
      },
      resourceDescription: 'storage.fileShares',
      callback,
    });
  }
}

const isServiceEnabledForKindAndTier = {
  table: (kind: Kind, tier: SkuTier) => {
    return getSupportedServicesForKindAndTier(kind, tier).includes(
      StorageService.TABLE,
    );
  },
  queue: (kind: Kind, tier: SkuTier) => {
    return getSupportedServicesForKindAndTier(kind, tier).includes(
      StorageService.QUEUE,
    );
  },
  fileShare: (kind: Kind, tier: SkuTier) => {
    return getSupportedServicesForKindAndTier(kind, tier).includes(
      StorageService.FILE_SHARE,
    );
  },
  blob: (kind: Kind, tier: SkuTier) => {
    return getSupportedServicesForKindAndTier(kind, tier).includes(
      StorageService.BLOB,
    );
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
function getSupportedServicesForKindAndTier(
  kind: Kind,
  tier: SkuTier,
): StorageService[] {
  switch (kind) {
    case 'Storage':
    case 'StorageV2':
      {
        switch (tier) {
          case 'Standard':
            return [
              StorageService.BLOB,
              StorageService.FILE_SHARE,
              StorageService.QUEUE,
              StorageService.TABLE,
            ];
          case 'Premium':
            return [StorageService.BLOB];
        }
      }
      break;
    case 'FileStorage':
      return [StorageService.FILE_SHARE];
    case 'BlobStorage':
      return [StorageService.BLOB];
    case 'BlockBlobStorage':
      return [StorageService.BLOB];
  }
}
