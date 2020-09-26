import { fetchBatchAccounts, fetchBatchApplications, fetchBatchPools } from '.';
import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import { setupAzureRecording } from '../../../../test/helpers/recording';

let recording: Recording;

// developer used different creds than ~/test/integrationInstanceConfig
const instanceConfig: IntegrationConfig = {
  clientId: process.env.CLIENT_ID || 'clientId',
  clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
  directoryId: 'bcd90474-9b62-4040-9d7b-8af257b1427d',
  subscriptionId: '40474ebe-55a2-4071-8fa8-b610acdd8e56',
};

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

test('step - batch accounts', async () => {
  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-batch-accounts',
  });

  const resourceGroup = {
    _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
    _type: 'azure_resource_group',
    _class: ['Group'],
    name: 'j1dev',
    location: 'eastus',
  };

  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig,
    entities: [resourceGroup],
  });

  context.jobState.getData = jest.fn().mockResolvedValue({
    defaultDomain: 'www.fake-domain.com',
  });

  await fetchBatchAccounts(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: 'Service',
    schema: {},
  });
  expect(context.jobState.collectedRelationships).toContainEqual({
    _class: 'HAS',
    _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
    _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount`,
    _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount`,
    _type: 'azure_resource_group_has_batch_account',
    displayName: 'HAS',
  });
});

test('step - batch pools', async () => {
  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-batch-pools',
  });

  const batchAccount = {
    _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount`,
    id:
      '/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount',
    _type: 'azure_batch_account',
    _class: ['Service'],
    name: 'j1devbatchaccount',
  };

  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig,
    entities: [batchAccount],
  });

  context.jobState.getData = jest.fn().mockResolvedValue({
    defaultDomain: 'www.fake-domain.com',
  });

  await fetchBatchPools(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: 'Cluster',
    schema: {},
  });
  expect(context.jobState.collectedRelationships).toContainEqual({
    _class: 'HAS',
    _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount`,
    _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount/pools/j1devbatchpool`,
    _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount/pools/j1devbatchpool`,
    _type: 'azure_batch_account_has_pool',
    displayName: 'HAS',
  });
});

test('step - batch applications', async () => {
  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-batch-applications',
  });

  const batchAccount = {
    _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount`,
    id:
      '/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount',
    _type: 'azure_batch_account',
    _class: ['Service'],
    name: 'j1devbatchaccount',
  };

  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig,
    entities: [batchAccount],
  });

  context.jobState.getData = jest.fn().mockResolvedValue({
    defaultDomain: 'www.fake-domain.com',
  });

  await fetchBatchApplications(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: 'Process',
    schema: {},
  });
  expect(context.jobState.collectedRelationships).toContainEqual({
    _class: 'HAS',
    _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount`,
    _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount|has|j1devbatchapplication`,
    _toEntityKey: `j1devbatchapplication`,
    _type: 'azure_batch_account_has_application',
    displayName: 'HAS',
  });
});
