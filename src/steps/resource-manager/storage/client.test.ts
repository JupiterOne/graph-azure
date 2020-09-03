import {
  BlobContainer,
  FileShare,
  StorageAccount,
  StorageQueue,
  Table,
} from '@azure/arm-storage/esm/models';
import {
  createMockIntegrationLogger,
  Recording,
  setupRecording,
} from '@jupiterone/integration-sdk-testing';

import config from '../../../../test/integrationInstanceConfig';
import { StorageClient } from './client';
import { IntegrationConfig } from '../../../types';

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

describe('iterateStorageAccounts', () => {
  test('all', async () => {
    recording = setupRecording({
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

describe('iterateStorageBlobContainers', () => {
  test('all', async () => {
    recording = setupRecording({
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
      } as StorageAccount,
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

      recording = setupRecording({
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
          } as StorageAccount,
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
    recording = setupRecording({
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
      } as StorageAccount,
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
    recording = setupRecording({
      directory: __dirname,
      name: 'iterateQueues',
      options: {
        recordFailedRequests: true,
      },
    });

    const client = new StorageClient(config, createMockIntegrationLogger());

    const resources: StorageQueue[] = [];
    await client.iterateQueues(
      {
        id:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/ndowmon1j1dev',
        name: 'ndowmon1j1dev',
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

  test('skips when FeatureNotSupportedForAccount', async () => {
    recording = setupRecording({
      directory: __dirname,
      name: 'iterateQueues-FeatureNotSupportedForAccount',
      options: {
        recordFailedRequests: true,
      },
    });

    const client = new StorageClient(config, createMockIntegrationLogger());

    const resources: StorageQueue[] = [];
    await client.iterateQueues(
      {
        id:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/ndowmon1j1devblobstorage',
        name: 'ndowmon1j1devblobstorage',
      },
      (e) => {
        resources.push(e);
      },
    );

    expect(resources).toEqual([]);
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
    recording = setupRecording({
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
});
