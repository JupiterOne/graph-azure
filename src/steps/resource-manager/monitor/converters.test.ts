import { createAzureWebLinker } from '../../../azure';
import {
  createMonitorLogProfileEntity,
  createDiagnosticLogSettingEntity,
  createDiagnosticMetricSettingEntity,
} from './converters';
import {
  DiagnosticSettingsResource,
  LogProfileResource,
  LogSettings,
  MetricSettings,
} from '@azure/arm-monitor/esm/models';

const webLinker = createAzureWebLinker('something.onmicrosoft.com');

describe('createMonitorLogProfileEntity', () => {
  test('properties transferred', () => {
    const data: LogProfileResource = {
      id:
        '/subscriptions/df602c9c-7aa0-407d-a6fb-eb20c8bd1192/providers/microsoft.insights/logprofiles/default',
      type: '',
      name: 'default',
      location: '',
      storageAccountId:
        '/subscriptions/df602c9c-7aa0-407d-a6fb-eb20c8bd1192/resourceGroups/JohnKemTest/providers/Microsoft.Storage/storageAccounts/johnkemtest8162',
      serviceBusRuleId: '',
      locations: ['global'],
      categories: ['Delete', 'Write', 'Action'],
      retentionPolicy: {
        enabled: true,
        days: 3,
      },
    };

    const logProfileEntity = createMonitorLogProfileEntity(webLinker, data);

    expect(logProfileEntity).toMatchSnapshot();
    expect(logProfileEntity).toMatchGraphObjectSchema({
      _class: ['Configuration'],
      schema: {
        additionalProperties: true,
        properties: {
          storageAccountId: { type: 'string' },
          serviceBusRuleId: { type: 'string' },
          locations: { type: 'array', items: { type: 'string' } },
          categories: { type: 'array', items: { type: 'string' } },
          'retentionPolicy.enabled': { type: 'boolean' },
          'retentionPolicy.days': { type: 'number' },
        },
      },
    });
  });
});

describe('createDiagnosticLogSettingEntity', () => {
  test('properties transferred', () => {
    const logSetting: LogSettings = {
      category: 'AuditEvent',
      enabled: true,
      retentionPolicy: { days: 7, enabled: true },
    };

    const diagnosticSetting: DiagnosticSettingsResource = {
      eventHubAuthorizationRuleId: undefined,
      eventHubName: undefined,
      id:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourcegroups/j1dev_diag_set_resource_group/providers/microsoft.keyvault/vaults/j1devdiagsetkeyvault/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set',
      logAnalyticsDestinationType: undefined,
      logs: [
        logSetting,
        {
          category: 'AuditEvent',
          enabled: true,
          retentionPolicy: { days: 7, enabled: false },
        },
      ],
      metrics: [
        {
          category: 'AllMetrics',
          enabled: true,
          retentionPolicy: { days: 0, enabled: false },
        },
      ],
      name: 'j1dev_diag_set',
      serviceBusRuleId: undefined,
      storageAccountId:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev_diag_set_resource_group/providers/Microsoft.Storage/storageAccounts/j1devdiagsetstrgacct',
      type: 'Microsoft.Insights/diagnosticSettings',
      workspaceId: undefined,
    };

    const diagnosticLogSettingEntity = createDiagnosticLogSettingEntity(
      webLinker,
      diagnosticSetting,
      logSetting,
    );

    expect(diagnosticLogSettingEntity).toMatchSnapshot();
    expect(diagnosticLogSettingEntity).toMatchGraphObjectSchema({
      _class: ['Configuration'],
      schema: {
        additionalProperties: true,
        properties: {
          storageAccountId: { type: 'string' },
          serviceBusRuleId: { type: 'string' },
          eventHubAuthorizationRuleId: { type: 'string' },
          eventHubName: { type: 'string' },
          workspaceId: { type: 'string' },
          logAnalyticsDestinationType: { type: 'string' },
          category: { type: 'string' },
          enabled: { type: 'boolean' },
          'retentionPolicy.enabled': { type: 'boolean' },
          'retentionPolicy.days': { type: 'number' },
        },
      },
    });
  });
});

describe('createDiagnosticMetricSettingEntity', () => {
  test('properties transferred', () => {
    const metricSetting: MetricSettings = {
      category: 'AllMetrics',
      enabled: true,
      retentionPolicy: { days: 0, enabled: false },
    };

    const diagnosticSetting: DiagnosticSettingsResource = {
      eventHubAuthorizationRuleId: undefined,
      eventHubName: undefined,
      id:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourcegroups/j1dev_diag_set_resource_group/providers/microsoft.keyvault/vaults/j1devdiagsetkeyvault/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set',
      logAnalyticsDestinationType: undefined,
      logs: [
        {
          category: 'AuditEvent',
          enabled: true,
          retentionPolicy: { days: 7, enabled: true },
        },
        {
          category: 'AuditEvent',
          enabled: true,
          retentionPolicy: { days: 7, enabled: false },
        },
      ],
      metrics: [metricSetting],
      name: 'j1dev_diag_set',
      serviceBusRuleId: undefined,
      storageAccountId:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev_diag_set_resource_group/providers/Microsoft.Storage/storageAccounts/j1devdiagsetstrgacct',
      type: 'Microsoft.Insights/diagnosticSettings',
      workspaceId: undefined,
    };

    const diagnosticMetricSettingEntity = createDiagnosticMetricSettingEntity(
      webLinker,
      diagnosticSetting,
      metricSetting,
    );

    expect(diagnosticMetricSettingEntity).toMatchSnapshot();
    expect(diagnosticMetricSettingEntity).toMatchGraphObjectSchema({
      _class: ['Configuration'],
      schema: {
        additionalProperties: true,
        properties: {
          storageAccountId: { type: 'string' },
          serviceBusRuleId: { type: 'string' },
          eventHubAuthorizationRuleId: { type: 'string' },
          eventHubName: { type: 'string' },
          workspaceId: { type: 'string' },
          logAnalyticsDestinationType: { type: 'string' },
          category: { type: 'string' },
          enabled: { type: 'boolean' },
          timeGrain: { type: 'string' },
          'retentionPolicy.enabled': { type: 'boolean' },
          'retentionPolicy.days': { type: 'number' },
        },
      },
    });
  });
});
