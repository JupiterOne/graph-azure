import {
  MockIntegrationStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import { setupAzureRecording } from '../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';
import { fetchKeyVaults } from '.';
import {
  KEY_VAULT_SERVICE_ENTITY_CLASS,
  KEY_VAULT_SERVICE_ENTITY_TYPE,
} from './constants';
import { MonitorEntities } from '../monitor/constants';

let recording: Recording;
let context: MockIntegrationStepExecutionContext<IntegrationConfig>;
let instanceConfig: IntegrationConfig;

describe('step = key vaults', () => {
  beforeAll(async () => {
    instanceConfig = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: '4a17becb-fb42-4633-b5c8-5ab66f28d195',
      subscriptionId: '87f62f44-9dad-4284-a08f-f2fb3d8b528a',
      developerId: 'keionned',
    };

    context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [
        {
          _key: `/subscriptions/${instanceConfig.subscriptionId}`,
          _class: ['Account'],
          _type: 'azure_subscription',
          id: `/subscriptions/${instanceConfig.subscriptionId}`,
        },
        {
          _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
          _type: 'azure_resource_group',
          _class: ['Group'],
          name: 'j1dev',
          location: 'eastus',
          id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
        },
      ],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: {
          defaultDomain: 'www.fake-domain.com',
          _type: ACCOUNT_ENTITY_TYPE,
          _key: 'azure_account_id',
          id: 'azure_account_id',
        },
      },
    });

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'resource-manager-step-key-vaults',
    });

    await fetchKeyVaults(context);
  });

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should collect an Azure Key Vault entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        _class: KEY_VAULT_SERVICE_ENTITY_CLASS,
        _type: KEY_VAULT_SERVICE_ENTITY_TYPE,
        category: ['infrastructure'],
        displayName: `${instanceConfig.developerId}1-j1dev`,
        region: 'eastus',
        resourceGroup: 'j1dev',
        endpoints: [
          `https://${instanceConfig.developerId}1-j1dev.vault.azure.net/`,
        ],
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/${instanceConfig.developerId}1-j1dev`,
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/${instanceConfig.developerId}1-j1dev`,
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/${instanceConfig.developerId}1-j1dev`,
      }),
    );
  });

  it('should collect an Azure Account has Azure Key Vault relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: 'HAS',
      _fromEntityKey: 'azure_account_id',
      _key: `azure_account_id|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/${instanceConfig.developerId}1-j1dev`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/${instanceConfig.developerId}1-j1dev`,
      _type: 'azure_account_has_keyvault_service',
      displayName: 'HAS',
    });
  });

  it('should collect an Azure Resource Group has Azure Key Vault relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: 'HAS',
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/${instanceConfig.developerId}1-j1dev`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/${instanceConfig.developerId}1-j1dev`,
      _type: 'azure_resource_group_has_keyvault_service',
      displayName: 'HAS',
    });
  });

  it('should collect an Azure Diagnostic Log Setting entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        _class: MonitorEntities.DIAGNOSTIC_LOG_SETTING._class,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.keyvault/vaults/${instanceConfig.developerId}1-j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_key_vault_diag_set/logs/AuditEvent/true/1/true`,
        _type: MonitorEntities.DIAGNOSTIC_LOG_SETTING._type,
        category: 'AuditEvent',
        displayName: 'j1dev_key_vault_diag_set',
        enabled: true,
        eventHubAuthorizationRuleId: null,
        eventHubName: null,
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.keyvault/vaults/${instanceConfig.developerId}1-j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_key_vault_diag_set/logs/AuditEvent/true/1/true`,
        logAnalyticsDestinationType: null,
        name: 'j1dev_key_vault_diag_set',
        'retentionPolicy.days': 1,
        'retentionPolicy.enabled': true,
        serviceBusRuleId: null,
        storageAccountId: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.keyvault/vaults/${instanceConfig.developerId}1-j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_key_vault_diag_set`,
        workspaceId: null,
      }),
    );
  });

  it('should create an Azure Diagnostic Metric Setting Entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.keyvault/vaults/${instanceConfig.developerId}1-j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_key_vault_diag_set/metrics/AllMetrics/true/undefined/1/true`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.keyvault/vaults/${instanceConfig.developerId}1-j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_key_vault_diag_set/metrics/AllMetrics/true/undefined/1/true`,
        _type: MonitorEntities.DIAGNOSTIC_METRIC_SETTING._type,
        _class: MonitorEntities.DIAGNOSTIC_METRIC_SETTING._class,
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.keyvault/vaults/${instanceConfig.developerId}1-j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_key_vault_diag_set`,
        storageAccountId: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        eventHubAuthorizationRuleId: null,
        eventHubName: null,
        logAnalyticsDestinationType: null,
        serviceBusRuleId: null,
        workspaceId: null,
        displayName: 'j1dev_key_vault_diag_set',
        name: 'j1dev_key_vault_diag_set',
        category: 'AllMetrics',
        enabled: true,
        'retentionPolicy.days': 1,
        'retentionPolicy.enabled': true,
        timeGrain: undefined,
      }),
    );
  });

  it('should collect an Azure Key Vault has Diagnostic Metric Setting relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: 'HAS',
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/${instanceConfig.developerId}1-j1dev`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/${instanceConfig.developerId}1-j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.keyvault/vaults/${instanceConfig.developerId}1-j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_key_vault_diag_set/metrics/AllMetrics/true/undefined/1/true`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.keyvault/vaults/${instanceConfig.developerId}1-j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_key_vault_diag_set/metrics/AllMetrics/true/undefined/1/true`,
      _type: 'azure_resource_has_diagnostic_metric_setting',
      displayName: 'HAS',
    });
  });

  it('should collect an Azure Key Vault has Azure Diagnostic Log Setting relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: 'HAS',
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/${instanceConfig.developerId}1-j1dev`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/${instanceConfig.developerId}1-j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.keyvault/vaults/${instanceConfig.developerId}1-j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_key_vault_diag_set/logs/AuditEvent/true/1/true`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.keyvault/vaults/${instanceConfig.developerId}1-j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_key_vault_diag_set/logs/AuditEvent/true/1/true`,
      _type: 'azure_resource_has_diagnostic_log_setting',
      displayName: 'HAS',
    });
  });

  it('should collect an Azure Diagnostic Log Setting uses Azure Storage Account relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: 'USES',
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.keyvault/vaults/${instanceConfig.developerId}1-j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_key_vault_diag_set/logs/AuditEvent/true/1/true`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.keyvault/vaults/${instanceConfig.developerId}1-j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_key_vault_diag_set/logs/AuditEvent/true/1/true|uses|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
      _type: 'azure_diagnostic_log_setting_uses_storage_account',
      displayName: 'USES',
    });
  });

  it('should create an Azure Diagnostic Metric Setting uses Azure Storage Account relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: 'USES',
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.keyvault/vaults/${instanceConfig.developerId}1-j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_key_vault_diag_set/metrics/AllMetrics/true/undefined/1/true`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.keyvault/vaults/${instanceConfig.developerId}1-j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_key_vault_diag_set/metrics/AllMetrics/true/undefined/1/true|uses|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
      _type: 'azure_diagnostic_metric_setting_uses_storage_account',
      displayName: 'USES',
    });
  });
});
