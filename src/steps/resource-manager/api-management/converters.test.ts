import { convertProperties } from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import {
  createApiManagementServiceEntity,
  createApiManagementApiEntity,
} from './converters';
import {
  ApiManagementServiceResource,
  ApiContract,
} from '@azure/arm-apimanagement/esm/models';

const webLinker = createAzureWebLinker('something.onmicrosoft.com');

describe('createApiManagementServiceEntity', () => {
  test('properties transferred', () => {
    const data: ApiManagementServiceResource = {
      id:
        '/subscriptions/subscription-id/resourceGroups/resource-group-id/providers/Microsoft.ApiManagement/service/j1dev-api-management-service',
      name: 'j1dev-api-management-service',
      type: 'Microsoft.ApiManagement/service',
      tags: {},
      notificationSenderEmail: 'apimgmt-noreply@mail.windowsazure.com',
      provisioningState: 'Succeeded',
      targetProvisioningState: '',
      createdAtUtc: new Date('2020-09-08T18:17:27.987Z'),
      gatewayUrl: 'https://j1dev.azure-api.net',
      gatewayRegionalUrl: 'https://j1dev-eastus-01.regional.azure-api.net',
      portalUrl: 'https://j1dev.portal.azure-api.net',
      managementApiUrl: 'https://j1dev.management.azure-api.net',
      scmUrl: 'https://j1dev.scm.azure-api.net',
      developerPortalUrl: 'https://j1dev.developer.azure-api.net',
      hostnameConfigurations: [
        {
          type: 'Proxy',
          hostName: 'j1dev.azure-api.net',
          keyVaultId: undefined,
          encodedCertificate: undefined,
          certificatePassword: undefined,
          defaultSslBinding: true,
          negotiateClientCertificate: false,
          certificate: undefined,
        },
      ],
      publicIPAddresses: ['138.91.127.67'],
      privateIPAddresses: undefined,
      virtualNetworkConfiguration: undefined,
      additionalLocations: undefined,
      customProperties: {
        'Microsoft.WindowsAzure.ApiManagement.Gateway.Security.Backend.Protocols.Ssl30':
          'false',
        'Microsoft.WindowsAzure.ApiManagement.Gateway.Security.Backend.Protocols.Tls10':
          'false',
        'Microsoft.WindowsAzure.ApiManagement.Gateway.Security.Backend.Protocols.Tls11':
          'false',
        'Microsoft.WindowsAzure.ApiManagement.Gateway.Security.Ciphers.TripleDes168':
          'false',
        'Microsoft.WindowsAzure.ApiManagement.Gateway.Security.Protocols.Ssl30':
          'false',
        'Microsoft.WindowsAzure.ApiManagement.Gateway.Security.Protocols.Tls10':
          'false',
        'Microsoft.WindowsAzure.ApiManagement.Gateway.Security.Protocols.Tls11':
          'false',
        'Microsoft.WindowsAzure.ApiManagement.Gateway.Protocols.Server.Http2':
          'False',
      },
      certificates: [],
      enableClientCertificate: false,
      disableGateway: false,
      virtualNetworkType: 'None',
      apiVersionConstraint: { minApiVersion: undefined },
      publisherEmail: 'ndowmon@jupiterone.com',
      publisherName: 'JupiterOne',
      sku: { name: 'Developer', capacity: 1 },
      identity: undefined,
      location: 'East US',
      etag: 'AAAAAAAVrY8=',
    };

    expect(createApiManagementServiceEntity(webLinker, data)).toEqual({
      ...convertProperties(data),
      _key:
        '/subscriptions/subscription-id/resourceGroups/resource-group-id/providers/Microsoft.ApiManagement/service/j1dev-api-management-service',
      _type: 'azure_api_management_service',
      _class: ['Gateway'],
      _rawData: [{ name: 'default', rawData: data }],
      id:
        '/subscriptions/subscription-id/resourceGroups/resource-group-id/providers/Microsoft.ApiManagement/service/j1dev-api-management-service',
      name: 'j1dev-api-management-service',
      displayName: 'j1dev-api-management-service',
      public: true,
      function: ['api-gateway'],
      category: ['application'],
      createdOn: undefined,
      webLink: webLinker.portalResourceUrl(
        '/subscriptions/subscription-id/resourceGroups/resource-group-id/providers/Microsoft.ApiManagement/service/j1dev-api-management-service',
      ),
    });
  });
});

describe('createApiManagementApiEntity', () => {
  test('properties transferred', () => {
    const data: ApiContract = {
      id:
        '/subscriptions/subscription-id/resourceGroups/resource-group-id/providers/Microsoft.ApiManagement/service/j1dev-api-management-service/apis/j1dev-api',
      name: 'j1dev-api',
      type: 'Microsoft.ApiManagement/service/apis',
      description: '',
      authenticationSettings: undefined,
      subscriptionKeyParameterNames: undefined,
      apiRevision: '1',
      apiVersion: '',
      isCurrent: true,
      subscriptionRequired: false,
      displayName: 'j1dev API',
      serviceUrl: '',
      path: 'j1dev/test',
      protocols: ['https'],
    };

    expect(createApiManagementApiEntity(webLinker, data)).toEqual({
      ...convertProperties(data),
      _key:
        '/subscriptions/subscription-id/resourceGroups/resource-group-id/providers/Microsoft.ApiManagement/service/j1dev-api-management-service/apis/j1dev-api',
      _type: 'azure_api_management_api',
      _class: ['ApplicationEndpoint'],
      _rawData: [{ name: 'default', rawData: data }],
      id:
        '/subscriptions/subscription-id/resourceGroups/resource-group-id/providers/Microsoft.ApiManagement/service/j1dev-api-management-service/apis/j1dev-api',
      name: 'j1dev-api',
      address: 'j1dev/test',
      webLink: webLinker.portalResourceUrl(
        '/subscriptions/subscription-id/resourceGroups/resource-group-id/providers/Microsoft.ApiManagement/service/j1dev-api-management-service/apis/j1dev-api',
      ),
    });
  });
});
