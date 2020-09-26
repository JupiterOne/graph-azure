import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';
import {
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { BatchClient } from './client';
import { IntegrationConfig } from '../../../types';
import { BatchAccount, Pool, Application } from '@azure/arm-batch/esm/models';

// developer used different creds than ~/test/integrationInstanceConfig
const config: IntegrationConfig = {
  clientId: process.env.CLIENT_ID || 'clientId',
  clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
  directoryId: 'bcd90474-9b62-4040-9d7b-8af257b1427d',
  subscriptionId: '40474ebe-55a2-4071-8fa8-b610acdd8e56',
};

let recording: Recording;

afterEach(async () => {
  recording.stop();
});

describe('iterate batch accounts', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateBatchAccounts',
    });

    const client = new BatchClient(config, createMockIntegrationLogger(), true);

    const resourceGroup = {
      name: 'j1dev',
      location: 'eastus',
    };

    const resources: BatchAccount[] = [];
    await client.iterateBatchAccounts(resourceGroup, (e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/${resourceGroup.name}/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount`,
        name: 'j1devbatchaccount',
        type: 'Microsoft.Batch/batchAccounts',
        location: resourceGroup.location,
        accountEndpoint: expect.any(String),
        activeJobAndJobScheduleQuota: expect.any(Number),
        dedicatedCoreQuota: expect.any(Number),
        lowPriorityCoreQuota: expect.any(Number),
        poolAllocationMode: expect.any(String),
        poolQuota: expect.any(Number),
        provisioningState: expect.any(String),
        autoStorage: expect.objectContaining({
          lastKeySync: expect.any(Date),
          storageAccountId: expect.any(String),
        }),
      }),
    );
  });
});

describe('iterate batch account pools', () => {});

describe('iterate batch account applications', () => {});
