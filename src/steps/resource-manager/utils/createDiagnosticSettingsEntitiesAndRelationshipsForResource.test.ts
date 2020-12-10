import {
  MockIntegrationStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import { setupAzureRecording } from '../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';
import { createDiagnosticSettingsEntitiesAndRelationshipsForResource } from './createDiagnosticSettingsEntitiesAndRelationshipsForResource';
import {
  KEY_VAULT_SERVICE_ENTITY_CLASS,
  KEY_VAULT_SERVICE_ENTITY_TYPE,
} from '../key-vault';
import { Entity } from '@jupiterone/integration-sdk-core';
import { MonitorEntities } from '../monitor/constants';

let recording: Recording;

afterAll(async () => {
  if (recording) {
    await recording.stop();
  }
});

describe('createDiagnosticSettingsEntitiesAndRelationshipsForResource', () => {
  let instanceConfig: IntegrationConfig;
  let context: MockIntegrationStepExecutionContext<IntegrationConfig>;
  let resourceUri: string;

  beforeAll(async () => {
    instanceConfig = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: 'bcd90474-9b62-4040-9d7b-8af257b1427d',
      subscriptionId: '40474ebe-55a2-4071-8fa8-b610acdd8e56',
      developerId: 'keionned',
    };

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'create-diagnostic-settings-entities-and-relationships',
    });

    /**
     * NOTE:
     * The function used to create entities lowercases the id and _key.
     * This means that the id and _key of Azure Diagnostic Log Setting and Azure Diagnostic Metric Setting entities are the lowercased version of the resource URI.
     * The id/URI of the storage account these entities use are returned by the endpoint in camel case.
     * When creating relationships between these entities and others, all other references to Azure Diagnostic Log Setting and Azure Diagnostic Metric Setting _keys or ids will be lowercased, but all other references to _keys or id are in the casing returned by the client.
     */
    resourceUri = `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.keyvault/vaults/${instanceConfig.developerId}j1-dgset-kv`;

    const resourceEntity: Entity = {
      id: resourceUri,
      _class: KEY_VAULT_SERVICE_ENTITY_CLASS,
      _type: KEY_VAULT_SERVICE_ENTITY_TYPE,
      _key: resourceUri,
    };

    context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [resourceEntity],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
      },
    });

    await createDiagnosticSettingsEntitiesAndRelationshipsForResource(
      context,
      resourceEntity,
    );
  });

  it('should create the first Azure Diagnostic Log Setting Entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `${resourceUri}/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/logs/AuditEvent/true/7/false`,
        _key: `${resourceUri}/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/logs/AuditEvent/true/7/false`,
        _type: MonitorEntities.DIAGNOSTIC_LOG_SETTING._type,
        _class: MonitorEntities.DIAGNOSTIC_LOG_SETTING._class,
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource${resourceUri}/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set`,
        storageAccountId: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        eventHubAuthorizationRuleId: null,
        eventHubName: null,
        logAnalyticsDestinationType: null,
        serviceBusRuleId: null,
        workspaceId: null,
        displayName: 'j1dev_diag_set',
        name: 'j1dev_diag_set',
        category: 'AuditEvent',
        enabled: true,
        'retentionPolicy.days': 7,
        'retentionPolicy.enabled': false,
      }),
    );
  });

  it('should create the second Azure Diagnostic Log Setting Entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `${resourceUri}/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/logs/AuditEvent/true/7/true`,
        _key: `${resourceUri}/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/logs/AuditEvent/true/7/true`,
        _type: MonitorEntities.DIAGNOSTIC_LOG_SETTING._type,
        _class: MonitorEntities.DIAGNOSTIC_LOG_SETTING._class,
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource${resourceUri}/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set`,
        storageAccountId: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        eventHubAuthorizationRuleId: null,
        eventHubName: null,
        logAnalyticsDestinationType: null,
        serviceBusRuleId: null,
        workspaceId: null,
        displayName: 'j1dev_diag_set',
        name: 'j1dev_diag_set',
        category: 'AuditEvent',
        enabled: true,
        'retentionPolicy.days': 7,
        'retentionPolicy.enabled': true,
      }),
    );
  });

  it('should create an Azure Diagnostic Metric Setting Entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `${resourceUri}/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/metrics/AllMetrics/true/undefined/0/false`,
        _key: `${resourceUri}/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/metrics/AllMetrics/true/undefined/0/false`,
        _type: MonitorEntities.DIAGNOSTIC_METRIC_SETTING._type,
        _class: MonitorEntities.DIAGNOSTIC_METRIC_SETTING._class,
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource${resourceUri}/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set`,
        storageAccountId: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        eventHubAuthorizationRuleId: null,
        eventHubName: null,
        logAnalyticsDestinationType: null,
        serviceBusRuleId: null,
        workspaceId: null,
        displayName: 'j1dev_diag_set',
        name: 'j1dev_diag_set',
        category: 'AllMetrics',
        enabled: true,
        'retentionPolicy.days': 0,
        'retentionPolicy.enabled': false,
      }),
    );
  });

  it('should create relationships that match the direct relationship schema', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toMatchDirectRelationshipSchema({});
  });

  it('should create the first Azure Key Vault has Diagnostic Log Setting relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: 'HAS',
      _fromEntityKey: resourceUri,
      _key: `${resourceUri}|has|${resourceUri}/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/logs/AuditEvent/true/7/false`,
      _toEntityKey: `${resourceUri}/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/logs/AuditEvent/true/7/false`,
      _type: 'azure_resource_has_diagnostic_log_setting',
      displayName: 'HAS',
    });
  });

  it('should create the second Azure Key Vault has Diagnostic Log Setting relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: 'HAS',
      _fromEntityKey: resourceUri,
      _key: `${resourceUri}|has|${resourceUri}/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/logs/AuditEvent/true/7/true`,
      _toEntityKey: `${resourceUri}/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/logs/AuditEvent/true/7/true`,
      _type: 'azure_resource_has_diagnostic_log_setting',
      displayName: 'HAS',
    });
  });

  it('should create an Azure Key Vault has Diagnostic Metric Setting relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: 'HAS',
      _fromEntityKey: resourceUri,
      _key: `${resourceUri}|has|${resourceUri}/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/metrics/AllMetrics/true/undefined/0/false`,
      _toEntityKey: `${resourceUri}/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/metrics/AllMetrics/true/undefined/0/false`,
      _type: 'azure_resource_has_diagnostic_metric_setting',
      displayName: 'HAS',
    });
  });

  it('should create the first Azure Diagnostic Log Setting uses Azure Storage Account relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: 'USES',
      _fromEntityKey: `${resourceUri}/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/logs/AuditEvent/true/7/false`,
      _key: `${resourceUri}/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/logs/AuditEvent/true/7/false|uses|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
      _type: 'azure_diagnostic_log_setting_uses_storage_account',
      displayName: 'USES',
    });
  });

  it('should create the second Azure Diagnostic Log Setting uses Azure Storage Account relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: 'USES',
      _fromEntityKey: `${resourceUri}/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/logs/AuditEvent/true/7/true`,
      _key: `${resourceUri}/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/logs/AuditEvent/true/7/true|uses|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
      _type: 'azure_diagnostic_log_setting_uses_storage_account',
      displayName: 'USES',
    });
  });

  it('should create an Azure Diagnostic Metric Setting uses Azure Storage Account relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: 'USES',
      _fromEntityKey: `${resourceUri}/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/metrics/AllMetrics/true/undefined/0/false`,
      _key: `${resourceUri}/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/metrics/AllMetrics/true/undefined/0/false|uses|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
      _type: 'azure_diagnostic_metric_setting_uses_storage_account',
      displayName: 'USES',
    });
  });
});
