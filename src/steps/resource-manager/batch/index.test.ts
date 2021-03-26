import {
  fetchBatchAccounts,
  fetchBatchApplications,
  fetchBatchCertificates,
  fetchBatchPools,
} from '.';
import {
  MockIntegrationStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import { setupAzureRecording } from '../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';
import { BatchEntities } from './constants';

let recording: Recording;
let context: MockIntegrationStepExecutionContext<IntegrationConfig>;
let instanceConfig: IntegrationConfig;

describe('step - batch accounts', () => {
  beforeAll(async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'resource-manager-step-batch-accounts',
    });

    instanceConfig = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: '4a17becb-fb42-4633-b5c8-5ab66f28d195',
      subscriptionId: '87f62f44-9dad-4284-a08f-f2fb3d8b528a',
      developerId: 'keionned',
    };

    const resourceGroup = {
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
      _type: 'azure_resource_group',
      _class: ['Group'],
      name: 'j1dev',
      location: 'eastus',
    };

    context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [resourceGroup],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
      },
    });

    await fetchBatchAccounts(context);
  });

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should collect an Azure Batch Account entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        _class: BatchEntities.BATCH_ACCOUNT._class,
        _type: BatchEntities.BATCH_ACCOUNT._type,
        category: ['infrastructure'],
        accountEndpoint: 'j1devbatchaccount.eastus.batch.azure.com',
        activeJobAndJobScheduleQuota: 100,
        dedicatedCoreQuota: 20,
        lowPriorityCoreQuota: 10,
        poolAllocationMode: 'BatchService',
        poolQuota: 20,
        provisioningState: 'Succeeded',
        type: 'Microsoft.Batch/batchAccounts',
        displayName: 'j1devbatchaccount',
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount`,
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount`,
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount`,
      }),
    );
  });

  it('should collect an Azure Resource Group has Azure Batch Account relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: 'HAS',
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount`,
      _type: 'azure_resource_group_has_batch_account',
      displayName: 'HAS',
    });
  });
});

describe('step - batch pools', () => {
  beforeAll(async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'resource-manager-step-batch-pools',
    });

    instanceConfig = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: '4a17becb-fb42-4633-b5c8-5ab66f28d195',
      subscriptionId: '87f62f44-9dad-4284-a08f-f2fb3d8b528a',
    };

    const batchAccount = {
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount`,
      id:
        '/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount',
      _type: 'azure_batch_account',
      _class: ['Service'],
      name: 'j1devbatchaccount',
    };

    context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [batchAccount],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
      },
    });

    await fetchBatchPools(context);
  });

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should create an Azure Batch Pool entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        _class: BatchEntities.BATCH_POOL._class,
        _type: BatchEntities.BATCH_POOL._type,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount/pools/j1devbatchpool`,
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount/pools/j1devbatchpool`,
        allocationState: 'Steady',
        currentDedicatedNodes: 0,
        currentLowPriorityNodes: 0,
        interNodeCommunication: 'Disabled',
        displayName: 'J1 Dev Batch Account Pool',
        maxTasksPerNode: 1,
        name: 'j1devbatchpool',
        provisioningState: 'Succeeded',
        type: 'Microsoft.Batch/batchAccounts/pools',
        vmSize: 'STANDARD_A1',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount/pools/j1devbatchpool`,
      }),
    );
  });

  it('should create an Azure Batch Account has Azure Batch Pool relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: 'HAS',
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount/pools/j1devbatchpool`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount/pools/j1devbatchpool`,
      _type: 'azure_batch_account_has_pool',
      displayName: 'HAS',
    });
  });
});

describe('step - batch applications', () => {
  beforeAll(async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'resource-manager-step-batch-applications',
    });

    instanceConfig = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: '4a17becb-fb42-4633-b5c8-5ab66f28d195',
      subscriptionId: '87f62f44-9dad-4284-a08f-f2fb3d8b528a',
    };

    const batchAccount = {
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount`,
      id:
        '/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount',
      _type: 'azure_batch_account',
      _class: ['Service'],
      name: 'j1devbatchaccount',
    };

    context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [batchAccount],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
      },
    });

    await fetchBatchApplications(context);
  });

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should collect an Azure Batch Application entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        _type: BatchEntities.BATCH_APPLICATION._type,
        _class: BatchEntities.BATCH_APPLICATION._class,
        id: 'j1devbatchapplication',
        _key: 'j1devbatchapplication',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/j1devbatchapplication`,
      }),
    );
  });

  it('should collect an Azure Batch Account has Azure Batch Application relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: 'HAS',
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount|has|j1devbatchapplication`,
      _toEntityKey: `j1devbatchapplication`,
      _type: 'azure_batch_account_has_application',
      displayName: 'HAS',
    });
  });
});

describe('step - batch certificates', () => {
  beforeAll(async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'resource-manager-step-batch-certificates',
    });

    instanceConfig = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: '4a17becb-fb42-4633-b5c8-5ab66f28d195',
      subscriptionId: '87f62f44-9dad-4284-a08f-f2fb3d8b528a',
    };

    const batchAccount = {
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount`,
      id:
        '/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount',
      _type: 'azure_batch_account',
      _class: ['Service'],
      name: 'j1devbatchaccount',
    };

    context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [batchAccount],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
      },
    });

    await fetchBatchCertificates(context);
  });

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should collect an Azure Batch Certificate entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        _type: BatchEntities.BATCH_CERTIFICATE._type,
        _class: BatchEntities.BATCH_CERTIFICATE._class,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount/certificates/sha1-6820fee71b8312b01159d3c09fcb9f7ab24ae60d`,
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount/certificates/sha1-6820fee71b8312b01159d3c09fcb9f7ab24ae60d`,
        displayName: 'sha1-6820fee71b8312b01159d3c09fcb9f7ab24ae60d',
        format: 'Cer',
        provisioningState: 'Succeeded',
        type: 'Microsoft.Batch/batchAccounts/certificates',
        thumbprint: expect.any(String),
        thumbprintAlgorithm: 'sha1',
        publicData: expect.any(String),
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount/certificates/sha1-6820fee71b8312b01159d3c09fcb9f7ab24ae60d`,
      }),
    );
  });

  it('should collect an Azure Batch Account has Azure Batch Certificate relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: 'HAS',
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount/certificates/sha1-6820fee71b8312b01159d3c09fcb9f7ab24ae60d`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount/certificates/sha1-6820fee71b8312b01159d3c09fcb9f7ab24ae60d`,
      _type: 'azure_batch_account_has_certificate',
      displayName: 'HAS',
    });
  });
});
