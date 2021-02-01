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
import { MonitorEntities } from '../monitor/constants';
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
      directoryId: 'bcd90474-9b62-4040-9d7b-8af257b1427d',
      subscriptionId: '40474ebe-55a2-4071-8fa8-b610acdd8e56',
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

  it('should collect an Azure Diagnostic Log Setting entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        _class: MonitorEntities.DIAGNOSTIC_LOG_SETTING._class,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.batch/batchaccounts/j1devbatchaccount/providers/microsoft.insights/diagnosticSettings/j1dev_batch_diag_set/logs/ServiceLog/true/1/true`,
        _type: MonitorEntities.DIAGNOSTIC_LOG_SETTING._type,
        category: 'ServiceLog',
        displayName: 'j1dev_batch_diag_set',
        enabled: true,
        eventHubAuthorizationRuleId: null,
        eventHubName: null,
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.batch/batchaccounts/j1devbatchaccount/providers/microsoft.insights/diagnosticSettings/j1dev_batch_diag_set/logs/ServiceLog/true/1/true`,
        logAnalyticsDestinationType: null,
        name: 'j1dev_batch_diag_set',
        'retentionPolicy.days': 1,
        'retentionPolicy.enabled': true,
        serviceBusRuleId: null,
        storageAccountId: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.batch/batchaccounts/j1devbatchaccount/providers/microsoft.insights/diagnosticSettings/j1dev_batch_diag_set`,
        workspaceId: null,
      }),
    );
  });

  it('should create an Azure Diagnostic Metric Setting Entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.batch/batchaccounts/j1devbatchaccount/providers/microsoft.insights/diagnosticSettings/j1dev_batch_diag_set/metrics/AllMetrics/true/undefined/1/true`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.batch/batchaccounts/j1devbatchaccount/providers/microsoft.insights/diagnosticSettings/j1dev_batch_diag_set/metrics/AllMetrics/true/undefined/1/true`,
        _type: MonitorEntities.DIAGNOSTIC_METRIC_SETTING._type,
        _class: MonitorEntities.DIAGNOSTIC_METRIC_SETTING._class,
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.batch/batchaccounts/j1devbatchaccount/providers/microsoft.insights/diagnosticSettings/j1dev_batch_diag_set`,
        storageAccountId: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        eventHubAuthorizationRuleId: null,
        eventHubName: null,
        logAnalyticsDestinationType: null,
        serviceBusRuleId: null,
        workspaceId: null,
        displayName: 'j1dev_batch_diag_set',
        name: 'j1dev_batch_diag_set',
        category: 'AllMetrics',
        enabled: true,
        'retentionPolicy.days': 1,
        'retentionPolicy.enabled': true,
        timeGrain: undefined,
      }),
    );
  });

  it('should collect an Azure Batch Account has Azure Diagnostic Log Setting relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: 'HAS',
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount|has|/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.batch/batchaccounts/j1devbatchaccount/providers/microsoft.insights/diagnosticSettings/j1dev_batch_diag_set/logs/ServiceLog/true/1/true`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.batch/batchaccounts/j1devbatchaccount/providers/microsoft.insights/diagnosticSettings/j1dev_batch_diag_set/logs/ServiceLog/true/1/true`,
      _type: 'azure_resource_has_diagnostic_log_setting',
      displayName: 'HAS',
    });
  });

  it('should collect an Azure Batch Account has Diagnostic Metric Setting relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: 'HAS',
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount|has|/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.batch/batchaccounts/j1devbatchaccount/providers/microsoft.insights/diagnosticSettings/j1dev_batch_diag_set/metrics/AllMetrics/true/undefined/1/true`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.batch/batchaccounts/j1devbatchaccount/providers/microsoft.insights/diagnosticSettings/j1dev_batch_diag_set/metrics/AllMetrics/true/undefined/1/true`,
      _type: 'azure_resource_has_diagnostic_metric_setting',
      displayName: 'HAS',
    });
  });

  it('should collect an Azure Diagnostic Log Setting uses Azure Storage Account relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: 'USES',
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.batch/batchaccounts/j1devbatchaccount/providers/microsoft.insights/diagnosticSettings/j1dev_batch_diag_set/logs/ServiceLog/true/1/true`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.batch/batchaccounts/j1devbatchaccount/providers/microsoft.insights/diagnosticSettings/j1dev_batch_diag_set/logs/ServiceLog/true/1/true|uses|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
      _type: 'azure_diagnostic_log_setting_uses_storage_account',
      displayName: 'USES',
    });
  });

  it('should collect an Azure Diagnostic Metric Setting uses Azure Storage Account relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: 'USES',
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.batch/batchaccounts/j1devbatchaccount/providers/microsoft.insights/diagnosticSettings/j1dev_batch_diag_set/metrics/AllMetrics/true/undefined/1/true`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.batch/batchaccounts/j1devbatchaccount/providers/microsoft.insights/diagnosticSettings/j1dev_batch_diag_set/metrics/AllMetrics/true/undefined/1/true|uses|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
      _type: 'azure_diagnostic_metric_setting_uses_storage_account',
      displayName: 'USES',
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
      directoryId: 'bcd90474-9b62-4040-9d7b-8af257b1427d',
      subscriptionId: '40474ebe-55a2-4071-8fa8-b610acdd8e56',
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
      directoryId: 'bcd90474-9b62-4040-9d7b-8af257b1427d',
      subscriptionId: '40474ebe-55a2-4071-8fa8-b610acdd8e56',
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
      directoryId: 'bcd90474-9b62-4040-9d7b-8af257b1427d',
      subscriptionId: '40474ebe-55a2-4071-8fa8-b610acdd8e56',
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
