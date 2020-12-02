import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';
import {
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { IntegrationConfig } from '../../../types';
import { MonitorClient } from './client';
import {
  DiagnosticSettingsResource,
  LogProfileResource,
} from '@azure/arm-monitor/esm/models';

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

describe('iterateLogProfiles', () => {
  test('all', async () => {
    // developer used different creds than ~/test/integrationInstanceConfig
    const config: IntegrationConfig = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: 'bcd90474-9b62-4040-9d7b-8af257b1427d',
      subscriptionId: '40474ebe-55a2-4071-8fa8-b610acdd8e56',
    };

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateLogProfiles',
    });

    const client = new MonitorClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const resources: LogProfileResource[] = [];

    await client.iterateLogProfiles((e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual({
      id: `/subscriptions/${config.subscriptionId}/providers/microsoft.insights/logprofiles/default`,
      tags: null,
      type: null,
      identity: null,
      kind: null,
      name: 'default',
      location: null,
      storageAccountId: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev_log_profile_resource_group/providers/Microsoft.Storage/storageAccounts/j1devlogprofilestrgacct`,
      serviceBusRuleId: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev_log_profile_resource_group/providers/Microsoft.EventHub/namespaces/j1dev-log-profile-eventhub/authorizationrules/RootManageSharedAccessKey`,
      locations: ['westus', 'global'],
      categories: ['Delete', 'Action', 'Write'],
      retentionPolicy: {
        enabled: true,
        days: 365,
      },
    });
  });
});

describe('iterateDiagnosticSettings', () => {
  test('all', async () => {
    // developer used different creds than ~/test/integrationInstanceConfig
    const config: IntegrationConfig = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: 'bcd90474-9b62-4040-9d7b-8af257b1427d',
      subscriptionId: '40474ebe-55a2-4071-8fa8-b610acdd8e56',
    };

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateDiagnosticSettings',
    });

    const client = new MonitorClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const resourceUri = `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev_diag_set_resource_group/providers/Microsoft.KeyVault/vaults/j1devdiagsetkeyvault`;

    const resources: DiagnosticSettingsResource[] = [];

    await client.iterateDiagnosticSettings(resourceUri, (e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        eventHubAuthorizationRuleId: null,
        eventHubName: null,
        id: `/subscriptions/${config.subscriptionId}/resourcegroups/j1dev_diag_set_resource_group/providers/microsoft.keyvault/vaults/j1devdiagsetkeyvault/providers/microsoft.insights/diagnosticSettings/j1dev_diag_set`,
        identity: null,
        kind: null,
        location: null,
        logAnalyticsDestinationType: null,
        logs: expect.arrayContaining([
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
        ]),
        metrics: expect.arrayContaining([
          {
            category: 'AllMetrics',
            enabled: true,
            retentionPolicy: { days: 0, enabled: false },
          },
        ]),
        name: 'j1dev_diag_set',
        serviceBusRuleId: null,
        storageAccountId: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev_diag_set_resource_group/providers/Microsoft.Storage/storageAccounts/j1devdiagsetstrgacct`,
        tags: null,
        type: 'Microsoft.Insights/diagnosticSettings',
        workspaceId: null,
      }),
    );
  });
});
