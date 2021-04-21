import {
  BlobContainer,
  FileShare,
  StorageAccount,
  StorageQueue,
  Table,
  Kind,
  SkuTier,
} from '@azure/arm-storage/esm/models';
import {
  createMockIntegrationLogger,
  Recording,
} from '@jupiterone/integration-sdk-testing';

import config, {
  configFromEnv,
} from '../../../../test/integrationInstanceConfig';
import { StorageClient, createStorageAccountServiceClient } from './client';
import { IntegrationConfig } from '../../../types';
import {
  setupAzureRecording,
  getMatchRequestsBy,
} from '../../../../test/helpers/recording';

import * as baseClient from '../../../azure/resource-manager/client';

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

describe('iterateStorageAccounts', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateStorageAccounts',
    });

    const client = new StorageClient(config, createMockIntegrationLogger());

    const sa: StorageAccount[] = [];
    await client.iterateStorageAccounts((e) => {
      sa.push(e);
    });

    expect(sa).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: 'j1dev',
        kind: 'StorageV2',
        tags: expect.objectContaining({
          environment: 'j1dev',
        }),
      }),
      expect.objectContaining({
        id: expect.any(String),
        name: 'j1devblobstorage',
        kind: 'BlobStorage',
        enableHttpsTrafficOnly: true,
        tags: expect.objectContaining({
          environment: 'j1dev',
        }),
      }),
    ]);
  });
});

describe('createStorageAccountServiceClient', () => {
  async function getSetupData() {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'storageAccountServiceClient-getSetupData',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });
    const client = new StorageClient(
      configFromEnv,
      createMockIntegrationLogger(),
    );

    const storageAccounts: StorageAccount[] = [];
    await client.iterateStorageAccounts((sa) => {
      storageAccounts.push(sa);
    });

    const j1devStorageAccounts = storageAccounts.filter((sa) =>
      sa.name?.endsWith('j1dev'),
    );
    expect(j1devStorageAccounts.length).toBe(1);
    const storageAccount = j1devStorageAccounts[0];

    await recording.stop();
    return { storageAccount };
  }

  describe('getBlobServiceProperties', () => {
    test('success', async () => {
      const { storageAccount } = await getSetupData();

      recording = setupAzureRecording({
        directory: __dirname,
        name: 'storageAccountServiceClient-getBlobServiceProperties',
        options: {
          matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
        },
      });

      const storageAccountServiceClient = createStorageAccountServiceClient({
        config: configFromEnv,
        logger: createMockIntegrationLogger(),
        storageAccount: {
          name: storageAccount.name!,
          kind: storageAccount.kind!,
          skuTier: storageAccount.sku?.tier as SkuTier,
        },
      });

      const response = await storageAccountServiceClient.getBlobServiceProperties();

      expect(response).toMatchObject({
        blobAnalyticsLogging: {
          read: expect.any(Boolean),
          write: expect.any(Boolean),
          deleteProperty: expect.any(Boolean),
        },
        deleteRetentionPolicy: {
          enabled: expect.any(Boolean),
        },
      });
    });
  });

  describe('getQueueServiceProperties', () => {
    test('success', async () => {
      const { storageAccount } = await getSetupData();

      recording = setupAzureRecording({
        directory: __dirname,
        name: 'storageAccountServiceClient-getQueueServiceProperties',
        options: {
          matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
        },
      });

      const storageAccountServiceClient = createStorageAccountServiceClient({
        config: configFromEnv,
        logger: createMockIntegrationLogger(),
        storageAccount: {
          name: storageAccount.name!,
          kind: storageAccount.kind!,
          skuTier: storageAccount.sku?.tier as SkuTier,
        },
      });

      const response = await storageAccountServiceClient.getQueueServiceProperties();

      expect(response).toMatchObject({
        queueAnalyticsLogging: {
          read: expect.any(Boolean),
          write: expect.any(Boolean),
          deleteProperty: expect.any(Boolean),
        },
      });
    });
  });
});

describe('iterateStorageBlobContainers', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateStorageBlobContainers',
    });

    const client = new StorageClient(config, createMockIntegrationLogger());

    const containers: BlobContainer[] = [];
    await client.iterateStorageBlobContainers(
      {
        id:
          '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev',
        name: 'j1dev',
        kind: 'StorageV2',
        skuTier: 'Standard',
      },
      (e) => {
        containers.push(e);
      },
    );

    expect(containers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.stringMatching(
            /Microsoft\.Storage\/storageAccounts\/j1dev\/blobServices\/default\/containers\/bootdiagnostics-j1dev-/,
          ),
          name: expect.stringMatching(/bootdiagnostics-j1dev-/),
        }),
        expect.objectContaining({
          id:
            '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev/blobServices/default/containers/j1dev',
          name: 'j1dev',
        }),
      ]),
    );
  });

  // skipped because jest.useFakeTimers() wouldn't work
  test.skip(
    'retry',
    async () => {
      // jest.useFakeTimers();

      recording = setupAzureRecording({
        directory: __dirname,
        name: 'iterateStorageBlobContainersRetry',
        options: { recordFailedRequests: true },
      });

      const client = new StorageClient(config, createMockIntegrationLogger());

      let containers: BlobContainer[] = [];

      // Get past the 100/5 min limit, be sure we get more than 100 just over 5 minutes
      for (let index = 0; index < 103; index++) {
        containers = [];
        await client.iterateStorageBlobContainers(
          {
            id:
              '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev',
            name: 'j1dev',
            kind: 'StorageV2',
            skuTier: 'Standard',
          },
          (e) => {
            containers.push(e);
          },
        );
      }

      expect(containers).toEqual([
        expect.objectContaining({
          type: 'Microsoft.Storage/storageAccounts/blobServices/containers',
        }),
        expect.objectContaining({
          type: 'Microsoft.Storage/storageAccounts/blobServices/containers',
        }),
      ]);
    },
    1000 * 1000, // allow this test to run long enough to hit the limit
  );
});

describe('iterateFileShares', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateFileShares',
    });

    const client = new StorageClient(config, createMockIntegrationLogger());

    const resources: FileShare[] = [];
    await client.iterateFileShares(
      {
        id:
          '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev',
        name: 'j1dev',
        kind: 'StorageV2',
        skuTier: 'Standard',
      },
      (e) => {
        resources.push(e);
      },
    );

    expect(resources).toEqual([
      expect.objectContaining({
        id:
          '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev/fileServices/default/shares/j1dev',
        name: 'j1dev',
        shareQuota: 1,
      }),
    ]);
  });
});

describe('iterateQueues', () => {
  const config: IntegrationConfig & { developerId: string } = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
    subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
    developerId: 'ndowmon1',
  };

  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateQueues',
    });

    const client = new StorageClient(config, createMockIntegrationLogger());

    const resources: StorageQueue[] = [];
    await client.iterateQueues(
      {
        id:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/ndowmon1j1dev',
        name: 'ndowmon1j1dev',
        kind: 'StorageV2',
        skuTier: 'Standard',
      },
      (e) => {
        resources.push(e);
      },
    );

    expect(resources).toEqual([
      expect.objectContaining({
        id:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/ndowmon1j1dev/queueServices/default/queues/j1dev',
        name: 'j1dev',
        type: 'Microsoft.Storage/storageAccounts/queueServices/queues',
      }),
    ]);
  });

  test('skips endpoint when storage account does not support queues', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateQueeus-unsupported-account',
      options: { recordFailedRequests: true },
    });

    const client = new StorageClient(config, createMockIntegrationLogger());
    const iterateAllResourcesSpy = jest.spyOn(
      baseClient,
      'iterateAllResources',
    );

    const storageAccount = {
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/ndowmon1j1devblobstorage',
      name: 'ndowmon1j1devblobstorage',
      kind: 'BlobStorage' as Kind,
      skuTier: 'Standard' as SkuTier,
    };

    await client.iterateQueues(storageAccount, jest.fn());
    expect(iterateAllResourcesSpy).not.toHaveBeenCalled();
  });
});

describe('iterateTables', () => {
  const config: IntegrationConfig & { developerId: string } = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
    subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
    developerId: 'ndowmon1',
  };

  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateTables',
    });

    const client = new StorageClient(config, createMockIntegrationLogger());

    const resources: Table[] = [];
    await client.iterateTables(
      {
        id:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/ndowmon1j1dev',
        name: 'ndowmon1j1dev',
        kind: 'StorageV2',
        skuTier: 'Standard' as SkuTier,
      },
      (e) => {
        resources.push(e);
      },
    );

    expect(resources).toEqual([
      expect.objectContaining({
        id:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/ndowmon1j1dev/tableServices/default/tables/j1dev',
        name: 'j1dev',
        tableName: 'j1dev',
        type: 'Microsoft.Storage/storageAccounts/tableServices/tables',
      }),
    ]);
  });

  test('skips endpoint when storage account does not support tables', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateTables-unsupported-account',
      options: { recordFailedRequests: true },
    });

    const client = new StorageClient(config, createMockIntegrationLogger());
    const iterateAllResourcesSpy = jest.spyOn(
      baseClient,
      'iterateAllResources',
    );

    const storageAccount = {
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/ndowmon1j1devblobstorage',
      name: 'ndowmon1j1devblobstorage',
      kind: 'BlobStorage' as Kind,
      skuTier: 'Standard' as SkuTier,
    };

    await client.iterateTables(storageAccount, jest.fn());
    expect(iterateAllResourcesSpy).not.toHaveBeenCalled();
  });
});
