import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';
import {
  getMatchRequestsBy,
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { IntegrationConfig } from '../../../types';
import { MonitorClient } from './client';
import {
  ActivityLogAlertResource,
  DiagnosticSettingsResource,
  LogProfileResource,
} from '@azure/arm-monitor/esm/models';
import { configFromEnv } from '../../../../test/integrationInstanceConfig';

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
      developerId: 'keionned',
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
      storageAccountId: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${config.developerId}j1dev`,
      serviceBusRuleId: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventHub/namespaces/j1dev-log-profile-eventhub/authorizationrules/RootManageSharedAccessKey`,
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
      developerId: 'keionned',
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

    const resourceUri = `/subscriptions/${config.subscriptionId}/resourcegroups/j1dev/providers/microsoft.keyvault/vaults/${config.developerId}1-j1dev`;

    const resources: DiagnosticSettingsResource[] = [];

    await client.iterateDiagnosticSettings(resourceUri, (e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        eventHubAuthorizationRuleId: null,
        eventHubName: null,
        id: `${resourceUri}/providers/microsoft.insights/diagnosticSettings/j1dev_key_vault_diag_set`,
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
        name: 'j1dev_key_vault_diag_set',
        serviceBusRuleId: null,
        storageAccountId: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${config.developerId}j1dev`,
        tags: null,
        type: 'Microsoft.Insights/diagnosticSettings',
        workspaceId: null,
      }),
    );
  });
});

describe('iterateActivityLogAlerts', () => {
  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateActivityLogAlerts',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const resourceGroup = {
      name: 'j1dev',
    };

    const client = new MonitorClient(
      configFromEnv,
      createMockIntegrationLogger(),
    );

    const activityLogAlerts: ActivityLogAlertResource[] = [];
    await client.iterateActivityLogAlerts(resourceGroup, (e) => {
      activityLogAlerts.push(e);
    });

    expect(activityLogAlerts.length).toBeGreaterThan(0);
  });
});
