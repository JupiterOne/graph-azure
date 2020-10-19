import { fetchApiManagementServices, fetchApiManagementApis } from '.';
import { Recording } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import { setupAzureRecording } from '../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

test('step - api management services', async () => {
  const instanceConfig: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
    subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
  };

  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-api-management-services',
  });

  const context = createMockAzureStepExecutionContext({
    instanceConfig,
    entities: [
      {
        _key:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev',
        _type: 'azure_resource_group',
        _class: ['Group'],
      },
    ],
  });

  context.jobState.getData = jest.fn().mockResolvedValue({
    defaultDomain: 'www.fake-domain.com',
  });

  await fetchApiManagementServices(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: 'Gateway',
    schema: {
      additionalProperties: false,
      properties: {
        _type: { const: 'azure_api_management_service' },
        _key: { type: 'string' },
        _class: { type: 'array', items: { const: 'Gateway' } },
        id: { type: 'string' },
        name: { type: 'string' },
        type: { const: 'Microsoft.ApiManagement/service' },
        notificationSenderEmail: { type: 'string' },
        provisioningState: { type: 'string' },
        targetProvisioningState: { type: 'string' },
        gatewayUrl: { type: 'string' },
        gatewayRegionalUrl: { type: 'string' },
        portalUrl: { type: 'string' },
        managementApiUrl: { type: 'string' },
        scmUrl: { type: 'string' },
        developerPortalUrl: { type: 'string' },
        publicIpAddresses: { type: 'array', items: { type: 'string' } },
        enableClientCertificate: { type: 'boolean' },
        disableGateway: { type: 'boolean' },
        virtualNetworkType: { type: 'string' },
        publisherEmail: { type: 'string' },
        publisherName: { type: 'string' },
        location: { type: 'string' },
        etag: { type: 'string' },
        displayName: { type: 'string' },
        webLink: { type: 'string' },
        _rawData: { type: 'array', items: { type: 'object' } },
      },
    },
  });

  expect(context.jobState.collectedRelationships).toEqual([
    {
      _key:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev|has|/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev',
      _type: 'azure_resource_group_has_api_management_service',
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev',
      _toEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev',
      displayName: 'HAS',
    },
    {
      _key:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev|has|/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/nick-api-management',
      _type: 'azure_resource_group_has_api_management_service',
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev',
      _toEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/nick-api-management',
      displayName: 'HAS',
    },
  ]);
});

test('step - api management apis', async () => {
  const instanceConfig: IntegrationConfig = {
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

  const context = createMockAzureStepExecutionContext({
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
  });

  context.jobState.getData = jest.fn().mockResolvedValue({
    defaultDomain: 'www.fake-domain.com',
  });

  await fetchApiManagementApis(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: 'ApplicationEndpoint',
    schema: {
      additionalProperties: false,
      properties: {
        _type: { const: 'azure_api_management_api' },
        _key: { type: 'string' },
        _class: { type: 'array', items: { const: 'ApplicationEndpoint' } },
        id: { type: 'string' },
        name: { type: 'string' },
        displayName: { type: 'string' },
        type: { const: 'Microsoft.ApiManagement/service/apis' },
        apiRevision: { type: 'string' },
        apiVersion: { type: 'string' },
        isCurrent: { type: 'boolean' },
        subscriptionRequired: { type: 'boolean' },
        serviceUrl: { type: 'string' },
        path: { type: 'string' },
        protocols: { type: 'array', items: { type: 'string' } },
        webLink: { type: 'string' },
        _rawData: { type: 'array', items: { type: 'object' } },
      },
    },
  });

  expect(context.jobState.collectedRelationships).toEqual([
    {
      _key:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev|has|/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev/apis/echo-api',
      _type: 'azure_api_management_service_has_api',
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev',
      _toEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev/apis/echo-api',
      displayName: 'HAS',
    },
    {
      _key:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev|has|/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev/apis/j1dev-api',
      _type: 'azure_api_management_service_has_api',
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev',
      _toEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev/apis/j1dev-api',
      displayName: 'HAS',
    },
  ]);
});
