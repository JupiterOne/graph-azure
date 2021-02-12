import { fetchProfiles, fetchEndpoints } from '.';
import {
  MockIntegrationStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import { setupAzureRecording } from '../../../../test/helpers/recording';
import { CdnEntities } from './constants';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';
import { MonitorEntities } from '../monitor/constants';

let recording: Recording;
let instanceConfig: IntegrationConfig;
let context: MockIntegrationStepExecutionContext<IntegrationConfig>;

describe('step - cdn profiles', () => {
  beforeAll(async () => {
    instanceConfig = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: '4a17becb-fb42-4633-b5c8-5ab66f28d195',
      subscriptionId: '87f62f44-9dad-4284-a08f-f2fb3d8b528a',
      developerId: 'keionned',
    };

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'resource-manager-step-cdn-profiles',
    });

    context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [
        {
          _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
          _type: 'azure_resource_group',
          _class: ['Group'],
        },
      ],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
      },
    });

    await fetchProfiles(context);
  });

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should collect an Azure CDN Profile entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        _class: CdnEntities.PROFILE._class,
        _type: CdnEntities.PROFILE._type,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev`,
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev`,
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev`,
        displayName: 'j1dev',
        kind: 'cdn',
        location: 'EastUs',
        name: 'j1dev',
        provisioningState: 'Succeeded',
        resourceState: 'Active',
        type: 'Microsoft.Cdn/profiles',
      }),
    );
  });

  it('should collect an Azure Resource Group has Azure CDN Profile relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev`,
      _type: 'azure_resource_group_has_cdn_profile',
      _class: 'HAS',
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev`,
      displayName: 'HAS',
    });
  });

  it('should collect an Azure Diagnostic Log Setting entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        _class: MonitorEntities.DIAGNOSTIC_LOG_SETTING._class,
        _type: MonitorEntities.DIAGNOSTIC_LOG_SETTING._type,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.cdn/profiles/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_cdn_prof_diag_set/logs/AzureCdnAccessLog/true/1/true`,
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.cdn/profiles/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_cdn_prof_diag_set/logs/AzureCdnAccessLog/true/1/true`,
        category: 'AzureCdnAccessLog',
        displayName: 'j1dev_cdn_prof_diag_set',
        enabled: true,
        eventHubAuthorizationRuleId: null,
        eventHubName: null,
        logAnalyticsDestinationType: null,
        name: 'j1dev_cdn_prof_diag_set',
        'retentionPolicy.days': 1,
        'retentionPolicy.enabled': true,
        serviceBusRuleId: null,
        storageAccountId: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.cdn/profiles/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_cdn_prof_diag_set`,
        workspaceId: null,
      }),
    );
  });

  it('should collect an Azure Diagnostic Metric Setting entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        _class: MonitorEntities.DIAGNOSTIC_METRIC_SETTING._class,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.cdn/profiles/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_cdn_prof_diag_set/metrics/AllMetrics/true/undefined/1/true`,
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.cdn/profiles/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_cdn_prof_diag_set/metrics/AllMetrics/true/undefined/1/true`,
        _type: MonitorEntities.DIAGNOSTIC_METRIC_SETTING._type,
        category: 'AllMetrics',
        displayName: 'j1dev_cdn_prof_diag_set',
        enabled: true,
        eventHubAuthorizationRuleId: null,
        eventHubName: null,
        logAnalyticsDestinationType: null,
        name: 'j1dev_cdn_prof_diag_set',
        'retentionPolicy.days': 1,
        'retentionPolicy.enabled': true,
        serviceBusRuleId: null,
        storageAccountId: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        timeGrain: undefined,
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.cdn/profiles/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_cdn_prof_diag_set`,
        workspaceId: null,
      }),
    );
  });

  it('should collect an Azure CDN Profile has Azure Diagnostic Log Setting relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: 'HAS',
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.cdn/profiles/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_cdn_prof_diag_set/logs/AzureCdnAccessLog/true/1/true`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.cdn/profiles/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_cdn_prof_diag_set/logs/AzureCdnAccessLog/true/1/true`,
      _type: 'azure_resource_has_diagnostic_log_setting',
      displayName: 'HAS',
    });
  });

  it('should collect an Azure Diagnostic Log Setting uses Azure Storage Account relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: 'USES',
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.cdn/profiles/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_cdn_prof_diag_set/logs/AzureCdnAccessLog/true/1/true`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.cdn/profiles/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_cdn_prof_diag_set/logs/AzureCdnAccessLog/true/1/true|uses|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
      _type: 'azure_diagnostic_log_setting_uses_storage_account',
      displayName: 'USES',
    });
  });
});

describe('step - cdn endpoints', () => {
  beforeAll(async () => {
    instanceConfig = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: '4a17becb-fb42-4633-b5c8-5ab66f28d195',
      subscriptionId: '87f62f44-9dad-4284-a08f-f2fb3d8b528a',
      developerId: 'keionned',
    };

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'resource-manager-step-cdn-endpoints',
    });

    const parentId = `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev`;

    context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [
        {
          _key: parentId,
          _type: CdnEntities.PROFILE._type,
          _class: CdnEntities.PROFILE._class,
          id: parentId,
          name: 'j1dev',
        },
      ],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
      },
    });

    await fetchEndpoints(context);
  });

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should collect an Azure CDN Endpoint entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev/endpoints/j1dev`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev/endpoints/j1dev`,
        _class: CdnEntities.ENDPOINT._class,
        _type: CdnEntities.ENDPOINT._type,
        category: ['data'],
        displayName: 'j1dev',
        function: ['content-distribution'],
        hostName: 'j1dev.azureedge.net',
        isCompressionEnabled: false,
        isHttpAllowed: true,
        isHttpsAllowed: true,
        location: 'EastUs',
        name: 'j1dev',
        originHostHeader: 'www.jupiterone.com',
        provisioningState: 'Succeeded',
        public: true,
        queryStringCachingBehavior: 'IgnoreQueryString',
        resourceState: 'Running',
        type: 'Microsoft.Cdn/profiles/endpoints',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev/endpoints/j1dev`,
      }),
    );
  });

  it('should collect an Azure Diagnostic Log Setting entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.cdn/profiles/j1dev/endpoints/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_cdn_endpt_diag_set/logs/CoreAnalytics/true/1/true`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.cdn/profiles/j1dev/endpoints/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_cdn_endpt_diag_set/logs/CoreAnalytics/true/1/true`,
        _class: MonitorEntities.DIAGNOSTIC_LOG_SETTING._class,
        _type: MonitorEntities.DIAGNOSTIC_LOG_SETTING._type,
        category: 'CoreAnalytics',
        displayName: 'j1dev_cdn_endpt_diag_set',
        enabled: true,
        eventHubAuthorizationRuleId: null,
        eventHubName: null,
        logAnalyticsDestinationType: null,
        name: 'j1dev_cdn_endpt_diag_set',
        'retentionPolicy.days': 1,
        'retentionPolicy.enabled': true,
        serviceBusRuleId: null,
        storageAccountId: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.cdn/profiles/j1dev/endpoints/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_cdn_endpt_diag_set`,
        workspaceId: null,
      }),
    );
  });

  it('should collect an Azure CDN Profile has an Azure CDN Endpoint relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual(
      expect.objectContaining({
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev/endpoints/j1dev`,
        _type: 'azure_cdn_profile_has_endpoint',
        _class: 'HAS',
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev/endpoints/j1dev`,
        displayName: 'HAS',
      }),
    );
  });

  it('should collect an Azure CDN Endpoint has an Azure Diagnostic Log Setting relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual(
      expect.objectContaining({
        _class: 'HAS',
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev/endpoints/j1dev`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev/endpoints/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.cdn/profiles/j1dev/endpoints/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_cdn_endpt_diag_set/logs/CoreAnalytics/true/1/true`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.cdn/profiles/j1dev/endpoints/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_cdn_endpt_diag_set/logs/CoreAnalytics/true/1/true`,
        _type: 'azure_resource_has_diagnostic_log_setting',
        displayName: 'HAS',
      }),
    );
  });

  it('should collect an Azure Diagnostic Log Setting uses an Azure Storage Account relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual(
      expect.objectContaining({
        _class: 'USES',
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.cdn/profiles/j1dev/endpoints/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_cdn_endpt_diag_set/logs/CoreAnalytics/true/1/true`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.cdn/profiles/j1dev/endpoints/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_cdn_endpt_diag_set/logs/CoreAnalytics/true/1/true|uses|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        _type: 'azure_diagnostic_log_setting_uses_storage_account',
        displayName: 'USES',
      }),
    );
  });
});
