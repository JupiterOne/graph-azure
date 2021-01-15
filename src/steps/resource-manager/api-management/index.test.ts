import { fetchApiManagementServices, fetchApiManagementApis } from '.';
import { MockIntegrationStepExecutionContext, Recording } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import { setupAzureRecording } from '../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';
import { ApiManagementEntities } from './constants';
import { MonitorEntities } from '../monitor/constants';

let recording: Recording;
let instanceConfig: IntegrationConfig;
let context: MockIntegrationStepExecutionContext<IntegrationConfig>;

describe('step - api management services', () => {
  beforeAll(async () => {
    instanceConfig = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: 'bcd90474-9b62-4040-9d7b-8af257b1427d',
      subscriptionId: '40474ebe-55a2-4071-8fa8-b610acdd8e56',
      developerId: 'keionned'
    };

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'resource-manager-step-api-management-services',
    });

    context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [
        {
          _key:
            `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
          _type: 'azure_resource_group',
          _class: ['Group'],
        },
      ],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
      },
    });

    await fetchApiManagementServices(context);
  });

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should collect an Azure Api Management Service entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev`,
        _class: ApiManagementEntities.SERVICE._class,
        _type: ApiManagementEntities.SERVICE._type,
        category: ['application'],
        developerPortalUrl: 'https://j1dev.developer.azure-api.net',
        disableGateway: false,
        displayName: 'j1dev',
        enableClientCertificate: false,
        function: ['api-gateway'],
        gatewayRegionalUrl: 'https://j1dev-eastus-01.regional.azure-api.net',
        gatewayUrl: 'https://j1dev.azure-api.net',
        location: 'East US',
        managementApiUrl: 'https://j1dev.management.azure-api.net',
        name: 'j1dev',
        notificationSenderEmail: 'apimgmt-noreply@mail.windowsazure.com',
        portalUrl: 'https://j1dev.portal.azure-api.net',
        provisioningState: 'Succeeded',
        public: true,
        publicIpAddresses: [
          '104.211.7.149'
        ],
        publisherEmail: 'ndowmon@jupiterone.com',
        publisherName: 'JupiterOne',
        scmUrl: 'https://j1dev.scm.azure-api.net',
        targetProvisioningState: '',
        type: 'Microsoft.ApiManagement/service',
        virtualNetworkType: 'None',
        webLink:
          `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev`
      })
    );
  });

  it('should collect an Azure Diagnostic Log Setting entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set/logs/GatewayLogs/true/1/true`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set/logs/GatewayLogs/true/1/true`,
        _class: MonitorEntities.DIAGNOSTIC_LOG_SETTING._class,
        _type: MonitorEntities.DIAGNOSTIC_LOG_SETTING._type,
        category: 'GatewayLogs',
        displayName: 'j1dev_api_mgmt_diag_set',
        enabled: true,
        eventHubAuthorizationRuleId: null,
        eventHubName: null,
        logAnalyticsDestinationType: 'AzureDiagnostics',
        name: 'j1dev_api_mgmt_diag_set',
        'retentionPolicy.days': 1,
        'retentionPolicy.enabled': true,
        serviceBusRuleId: null,
        storageAccountId: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set`,
        workspaceId: null
      })
    );
  });

  it('should collect an Azure Diagnostic Metric Setting entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set/metrics/Gateway Requests/false/undefined/0/false`,
        _key:
          `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set/metrics/Gateway Requests/false/undefined/0/false`,
        _class: MonitorEntities.DIAGNOSTIC_METRIC_SETTING._class,
        _type: MonitorEntities.DIAGNOSTIC_METRIC_SETTING._type,
        category: 'Gateway Requests',
        displayName: 'j1dev_api_mgmt_diag_set',
        enabled: false,
        eventHubAuthorizationRuleId: null,
        eventHubName: null,
        logAnalyticsDestinationType: 'AzureDiagnostics',
        name: 'j1dev_api_mgmt_diag_set',
        'retentionPolicy.days': 0,
        'retentionPolicy.enabled': false,
        serviceBusRuleId: null,
        storageAccountId:
          `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        timeGrain: undefined,
        webLink:
          `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set`,
        workspaceId: null
      })
    );
  });

  it('should collect an Azure Diagnostic Metric Setting entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set/metrics/Capacity/false/undefined/0/false`,
        _key:
          `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set/metrics/Capacity/false/undefined/0/false`,
        _class: MonitorEntities.DIAGNOSTIC_METRIC_SETTING._class,
        _type: MonitorEntities.DIAGNOSTIC_METRIC_SETTING._type,
        category: 'Capacity',
        displayName: 'j1dev_api_mgmt_diag_set',
        enabled: false,
        eventHubAuthorizationRuleId: null,
        eventHubName: null,
        logAnalyticsDestinationType: 'AzureDiagnostics',
        name: 'j1dev_api_mgmt_diag_set',
        'retentionPolicy.days': 0,
        'retentionPolicy.enabled': false,
        serviceBusRuleId: null,
        storageAccountId:
          `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        timeGrain: undefined,
        webLink:
          `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set`,
        workspaceId: null
      })
    );
  });

  it('should collect an Azure Diagnostic Metric Setting entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set/metrics/EventHub Events/false/undefined/0/false`,
        _key:
          `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set/metrics/EventHub Events/false/undefined/0/false`,
        _class: MonitorEntities.DIAGNOSTIC_METRIC_SETTING._class,
        _type: MonitorEntities.DIAGNOSTIC_METRIC_SETTING._type,
        category: 'EventHub Events',
        displayName: 'j1dev_api_mgmt_diag_set',
        enabled: false,
        eventHubAuthorizationRuleId: null,
        eventHubName: null,
        logAnalyticsDestinationType: 'AzureDiagnostics',
        name: 'j1dev_api_mgmt_diag_set',
        'retentionPolicy.days': 0,
        'retentionPolicy.enabled': false,
        serviceBusRuleId: null,
        storageAccountId:
          `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        timeGrain: undefined,
        webLink:
          `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set`,
        workspaceId: null
      })
    );
  });

  it('should collect an Azure Diagnostic Metric Setting entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set/metrics/Network Status/false/undefined/0/false`,
        _key:
          `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set/metrics/Network Status/false/undefined/0/false`,
        _class: MonitorEntities.DIAGNOSTIC_METRIC_SETTING._class,
        _type: MonitorEntities.DIAGNOSTIC_METRIC_SETTING._type,
        category: 'Network Status',
        displayName: 'j1dev_api_mgmt_diag_set',
        enabled: false,
        eventHubAuthorizationRuleId: null,
        eventHubName: null,
        logAnalyticsDestinationType: 'AzureDiagnostics',
        name: 'j1dev_api_mgmt_diag_set',
        'retentionPolicy.days': 0,
        'retentionPolicy.enabled': false,
        serviceBusRuleId: null,
        storageAccountId:
          `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        timeGrain: undefined,
        webLink:
          `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set`,
        workspaceId: null
      })
    );
  });

  it('should collect an Azure Resource Group has Azure Api Management Service relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual(
      expect.objectContaining({
        _key:
          `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev`,
        _type: 'azure_resource_group_has_api_management_service',
        _class: 'HAS',
        _fromEntityKey:
          `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
        _toEntityKey:
          `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev`,
        displayName: 'HAS',
      })
    );
  });

  it('should collect an Azure Api Management Service has Azure Diagnostic Log Setting relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual(
      expect.objectContaining({
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set/logs/GatewayLogs/true/1/true`,
        _type: 'azure_resource_has_diagnostic_log_setting',
        _class: 'HAS',
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set/logs/GatewayLogs/true/1/true`,
        displayName: 'HAS'
      })
    );
  });

  it('should collect an Azure Diagnostic Log Setting uses Azure Storage Account relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual(
      expect.objectContaining({
        _class: 'USES',
        _fromEntityKey:
          `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set/logs/GatewayLogs/true/1/true`,
        _key:
          `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set/logs/GatewayLogs/true/1/true|uses|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        _toEntityKey:
          `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        _type: 'azure_diagnostic_log_setting_uses_storage_account',
        displayName: 'USES'
      })
    );
  });

  it('should collect an Azure Api Management Service has Azure Diagnostic Metric Setting relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual(
      expect.objectContaining({
        _class: 'HAS',
        _fromEntityKey:
          `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev`,
        _key:
          `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set/metrics/Gateway Requests/false/undefined/0/false`,
        _toEntityKey:
          `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set/metrics/Gateway Requests/false/undefined/0/false`,
        _type: 'azure_resource_has_diagnostic_metric_setting',
        displayName: 'HAS'
      })
    );
  });

  it('should collect an Azure Diagnostic Metric Setting uses Azure Storage Account relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual(
      expect.objectContaining({
        _class: 'USES',
        _fromEntityKey:
          `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set/metrics/Gateway Requests/false/undefined/0/false`,
        _key:
          `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set/metrics/Gateway Requests/false/undefined/0/false|uses|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        _toEntityKey:
          `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        _type: 'azure_diagnostic_metric_setting_uses_storage_account',
        displayName: 'USES'
      })
    );
  });

  it('should collect an Azure Api Management Service has Azure Diagnostic Metric Setting relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual(
      expect.objectContaining({
        _class: 'HAS',
        _fromEntityKey:
          `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev`,
        _key:
          `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set/metrics/Capacity/false/undefined/0/false`,
        _toEntityKey:
          `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set/metrics/Capacity/false/undefined/0/false`,
        _type: 'azure_resource_has_diagnostic_metric_setting',
        displayName: 'HAS'
      })
    );
  });

  it('should collect an Azure Diagnostic Metric Setting uses Azure Storage Account relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual(
      expect.objectContaining({
        _class: 'USES',
        _fromEntityKey:
          `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set/metrics/Capacity/false/undefined/0/false`,
        _key:
          `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set/metrics/Capacity/false/undefined/0/false|uses|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        _toEntityKey:
          `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        _type: 'azure_diagnostic_metric_setting_uses_storage_account',
        displayName: 'USES'
      })
    );
  });

  it('should collect an Azure Api Management Service has Azure Diagnostic Metric Setting relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual(
      expect.objectContaining({
        _class: 'HAS',
        _fromEntityKey:
          `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev`,
        _key:
          `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set/metrics/EventHub Events/false/undefined/0/false`,
        _toEntityKey:
          `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set/metrics/EventHub Events/false/undefined/0/false`,
        _type: 'azure_resource_has_diagnostic_metric_setting',
        displayName: 'HAS'
      })
    );
  });

  it('should collect an Azure Diagnostic Metric Setting uses Azure Storage Account relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual(
      expect.objectContaining({
        _class: 'USES',
        _fromEntityKey:
          `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set/metrics/EventHub Events/false/undefined/0/false`,
        _key:
          `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.apimanagement/service/j1dev/providers/microsoft.insights/diagnosticSettings/j1dev_api_mgmt_diag_set/metrics/EventHub Events/false/undefined/0/false|uses|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        _toEntityKey:
          `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        _type: 'azure_diagnostic_metric_setting_uses_storage_account',
        displayName: 'USES'
      })
    );
  });
});

describe('step - api management apis', () => {
  beforeAll(async () => {
    instanceConfig = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
      subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
    };

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'resource-manager-step-api-management-apis',
      options: {
        recordFailedRequests: true,
      },
    });

    context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [
        {
          _key:
            '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev',
          _type: 'azure_api_management_service',
          _class: ['Gateway'],
          id:
            '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev',
          name: 'j1dev',
        },
      ],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
      },
    });

    await fetchApiManagementApis(context);
  })

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  })

  it('should collect an Azure API Management API entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: ``,
        _key: ``,
        _class: ApiManagementEntities.API._class,
        _type: ApiManagementEntities.API._type
      })
    );
  });

  it('should collect an Azure API Management Service has Azure API Management API relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual(
      expect.objectContaining({
        _key:
          `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev/apis/j1dev-api`,
        _type: 'azure_api_management_service_has_api',
        _class: 'HAS',
        _fromEntityKey:
          `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev`,
        _toEntityKey:
          `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev/apis/j1dev-api`,
        displayName: 'HAS',
      })
    );
  });

  // expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
  //   _class: 'ApplicationEndpoint',
  //   schema: {
  //     additionalProperties: false,
  //     properties: {
  //       _type: { const: 'azure_api_management_api' },
  //       _key: { type: 'string' },
  //       _class: { type: 'array', items: { const: 'ApplicationEndpoint' } },
  //       id: { type: 'string' },
  //       name: { type: 'string' },
  //       displayName: { type: 'string' },
  //       type: { const: 'Microsoft.ApiManagement/service/apis' },
  //       apiRevision: { type: 'string' },
  //       apiVersion: { type: 'string' },
  //       isCurrent: { type: 'boolean' },
  //       subscriptionRequired: { type: 'boolean' },
  //       serviceUrl: { type: 'string' },
  //       path: { type: 'string' },
  //       protocols: { type: 'array', items: { type: 'string' } },
  //       webLink: { type: 'string' },
  //       _rawData: { type: 'array', items: { type: 'object' } },
  //     },
  //   },
  // });
});
