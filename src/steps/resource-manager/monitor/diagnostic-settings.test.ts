import { Recording } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import { setupAzureRecording } from '../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';
import { fetchDiagnosticSettings } from './diagnostic-settings';
import {
  KEY_VAULT_SERVICE_ENTITY_CLASS,
  KEY_VAULT_SERVICE_ENTITY_TYPE,
} from '../key-vault';
import { Entity } from '@jupiterone/integration-sdk-core';
import { MonitorEntities } from './constants';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

test('fetchDiagnosticSettings', async () => {
  const instanceConfig: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: 'bcd90474-9b62-4040-9d7b-8af257b1427d',
    subscriptionId: '40474ebe-55a2-4071-8fa8-b610acdd8e56',
  };

  recording = setupAzureRecording({
    directory: __dirname,
    name: 'fetch-diagnostic-settings',
  });

  const resourceUri = `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev_diag_set_resource_group/providers/Microsoft.KeyVault/vaults/j1devdiagsetkeyvault`;

  const resourceEntity: Entity = {
    id: resourceUri,
    _class: KEY_VAULT_SERVICE_ENTITY_CLASS,
    _type: KEY_VAULT_SERVICE_ENTITY_TYPE,
    _key: resourceUri,
  };

  const context = createMockAzureStepExecutionContext({
    instanceConfig,
    entities: [resourceEntity],
    setData: {
      [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
    },
  });

  await fetchDiagnosticSettings(context, resourceEntity);

  const { collectedEntities, collectedRelationships } = context.jobState;

  expect(collectedEntities.length).toBeGreaterThan(0);

  // it should create an Azure Diagnostic Log Setting Entity
  expect(collectedEntities).toContainEqual(
    expect.objectContaining({
      id: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev_diag_set_resource_group/providers/microsoft.keyvault/vaults/j1devdiagsetkeyvault/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/logs/AuditEvent/true/7/false`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev_diag_set_resource_group/providers/microsoft.keyvault/vaults/j1devdiagsetkeyvault/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/logs/AuditEvent/true/7/false`,
      _type: MonitorEntities.DIAGNOSTIC_LOG_SETTING._type,
      _class: MonitorEntities.DIAGNOSTIC_LOG_SETTING._class,
      webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev_diag_set_resource_group/providers/microsoft.keyvault/vaults/j1devdiagsetkeyvault/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set`,
      storageAccountId: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev_diag_set_resource_group/providers/Microsoft.Storage/storageAccounts/j1devdiagsetstrgacct`,
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
  // it should create an Azure Diagnostic Log Setting Entity
  expect(collectedEntities).toContainEqual(
    expect.objectContaining({
      id: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev_diag_set_resource_group/providers/microsoft.keyvault/vaults/j1devdiagsetkeyvault/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/logs/AuditEvent/true/7/true`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev_diag_set_resource_group/providers/microsoft.keyvault/vaults/j1devdiagsetkeyvault/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/logs/AuditEvent/true/7/true`,
      _type: MonitorEntities.DIAGNOSTIC_LOG_SETTING._type,
      _class: MonitorEntities.DIAGNOSTIC_LOG_SETTING._class,
      webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev_diag_set_resource_group/providers/microsoft.keyvault/vaults/j1devdiagsetkeyvault/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set`,
      storageAccountId: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev_diag_set_resource_group/providers/Microsoft.Storage/storageAccounts/j1devdiagsetstrgacct`,
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
  // it should create an Azure Diagnostic Metric Setting Entity
  expect(collectedEntities).toContainEqual(
    expect.objectContaining({
      id: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev_diag_set_resource_group/providers/microsoft.keyvault/vaults/j1devdiagsetkeyvault/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/metrics/AllMetrics/true/undefined/0/false`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev_diag_set_resource_group/providers/microsoft.keyvault/vaults/j1devdiagsetkeyvault/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/metrics/AllMetrics/true/undefined/0/false`,
      _type: MonitorEntities.DIAGNOSTIC_METRIC_SETTING._type,
      _class: MonitorEntities.DIAGNOSTIC_METRIC_SETTING._class,
      webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev_diag_set_resource_group/providers/microsoft.keyvault/vaults/j1devdiagsetkeyvault/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set`,
      storageAccountId: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev_diag_set_resource_group/providers/Microsoft.Storage/storageAccounts/j1devdiagsetstrgacct`,
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

  expect(collectedRelationships).toMatchDirectRelationshipSchema({});

  // it should connect those entities with the Azure resource (Key Vault in this case)
  expect(collectedRelationships).toContainEqual({
    _class: 'HAS',
    _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev_diag_set_resource_group/providers/Microsoft.KeyVault/vaults/j1devdiagsetkeyvault`,
    _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev_diag_set_resource_group/providers/Microsoft.KeyVault/vaults/j1devdiagsetkeyvault|has|/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev_diag_set_resource_group/providers/microsoft.keyvault/vaults/j1devdiagsetkeyvault/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/logs/AuditEvent/true/7/false`,
    _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev_diag_set_resource_group/providers/microsoft.keyvault/vaults/j1devdiagsetkeyvault/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/logs/AuditEvent/true/7/false`,
    _type: 'azure_keyvault_service_has_diagnostic_log_setting',
    displayName: 'HAS',
  });
  expect(collectedRelationships).toContainEqual({
    _class: 'HAS',
    _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev_diag_set_resource_group/providers/Microsoft.KeyVault/vaults/j1devdiagsetkeyvault`,
    _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev_diag_set_resource_group/providers/Microsoft.KeyVault/vaults/j1devdiagsetkeyvault|has|/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev_diag_set_resource_group/providers/microsoft.keyvault/vaults/j1devdiagsetkeyvault/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/logs/AuditEvent/true/7/true`,
    _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev_diag_set_resource_group/providers/microsoft.keyvault/vaults/j1devdiagsetkeyvault/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/logs/AuditEvent/true/7/true`,
    _type: 'azure_keyvault_service_has_diagnostic_log_setting',
    displayName: 'HAS',
  });
  expect(collectedRelationships).toContainEqual({
    _class: 'HAS',
    _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev_diag_set_resource_group/providers/Microsoft.KeyVault/vaults/j1devdiagsetkeyvault`,
    _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev_diag_set_resource_group/providers/Microsoft.KeyVault/vaults/j1devdiagsetkeyvault|has|/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev_diag_set_resource_group/providers/microsoft.keyvault/vaults/j1devdiagsetkeyvault/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/metrics/AllMetrics/true/undefined/0/false`,
    _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev_diag_set_resource_group/providers/microsoft.keyvault/vaults/j1devdiagsetkeyvault/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/metrics/AllMetrics/true/undefined/0/false`,
    _type: 'azure_keyvault_service_has_diagnostic_metric_setting',
    displayName: 'HAS',
  });

  // it should connect the Diagnostic Settings with the Azure Storage Account they use
  expect(collectedRelationships).toContainEqual({
    _class: 'USES',
    _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev_diag_set_resource_group/providers/microsoft.keyvault/vaults/j1devdiagsetkeyvault/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/logs/AuditEvent/true/7/false`,
    _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev_diag_set_resource_group/providers/microsoft.keyvault/vaults/j1devdiagsetkeyvault/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/logs/AuditEvent/true/7/false|uses|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev_diag_set_resource_group/providers/Microsoft.Storage/storageAccounts/j1devdiagsetstrgacct`,
    _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev_diag_set_resource_group/providers/Microsoft.Storage/storageAccounts/j1devdiagsetstrgacct`,
    _type: 'azure_diagnostic_log_setting_uses_storage_account',
    displayName: 'USES',
  });
  expect(collectedRelationships).toContainEqual({
    _class: 'USES',
    _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev_diag_set_resource_group/providers/microsoft.keyvault/vaults/j1devdiagsetkeyvault/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/logs/AuditEvent/true/7/true`,
    _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev_diag_set_resource_group/providers/microsoft.keyvault/vaults/j1devdiagsetkeyvault/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/logs/AuditEvent/true/7/true|uses|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev_diag_set_resource_group/providers/Microsoft.Storage/storageAccounts/j1devdiagsetstrgacct`,
    _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev_diag_set_resource_group/providers/Microsoft.Storage/storageAccounts/j1devdiagsetstrgacct`,
    _type: 'azure_diagnostic_log_setting_uses_storage_account',
    displayName: 'USES',
  });
  expect(collectedRelationships).toContainEqual({
    _class: 'USES',
    _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev_diag_set_resource_group/providers/microsoft.keyvault/vaults/j1devdiagsetkeyvault/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/metrics/AllMetrics/true/undefined/0/false`,
    _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev_diag_set_resource_group/providers/microsoft.keyvault/vaults/j1devdiagsetkeyvault/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set/metrics/AllMetrics/true/undefined/0/false|uses|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev_diag_set_resource_group/providers/Microsoft.Storage/storageAccounts/j1devdiagsetstrgacct`,
    _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev_diag_set_resource_group/providers/Microsoft.Storage/storageAccounts/j1devdiagsetstrgacct`,
    _type: 'azure_diagnostic_metric_setting_uses_storage_account',
    displayName: 'USES',
  });
});
