import { ApiManagementMappers } from '@azure/arm-apimanagement';
import * as msRest from '@azure/ms-rest-js';
const apiVersion2021: msRest.OperationQueryParameter = {
  parameterPath: 'apiVersion',
  mapper: {
    required: true,
    isConstant: true,
    serializedName: 'api-version',
    defaultValue: '2022-08-01',
    type: {
      name: 'String',
    },
  },
};
const acceptLanguage: msRest.OperationParameter = {
  parameterPath: 'acceptLanguage',
  mapper: {
    serializedName: 'accept-language',
    defaultValue: 'en-US',
    type: {
      name: 'String',
    },
  },
};
const resourceGroupNameSpec: msRest.OperationURLParameter = {
  parameterPath: 'resourceGroupName',
  mapper: {
    required: true,
    serializedName: 'resourceGroupName',
    type: {
      name: 'String',
    },
  },
};
const serviceName: msRest.OperationURLParameter = {
  parameterPath: 'serviceName',
  mapper: {
    required: true,
    serializedName: 'serviceName',
    constraints: {
      MaxLength: 50,
      MinLength: 1,
      Pattern: /^[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/,
    },
    type: {
      name: 'String',
    },
  },
};
const subscriptionId: msRest.OperationURLParameter = {
  parameterPath: 'subscriptionId',
  mapper: {
    required: true,
    serializedName: 'subscriptionId',
    type: {
      name: 'String',
    },
  },
};
const nextPageLink: msRest.OperationURLParameter = {
  parameterPath: 'nextPageLink',
  mapper: {
    required: true,
    serializedName: 'nextLink',
    type: {
      name: 'String',
    },
  },
  skipEncoding: true,
};
export const listByServiceOperationSpec: msRest.OperationSpec = {
  httpMethod: 'GET',
  path: 'subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ApiManagement/service/{serviceName}/apis',
  urlParameters: [resourceGroupNameSpec, serviceName, subscriptionId],
  queryParameters: [apiVersion2021],
  headerParameters: [acceptLanguage],
  responses: {
    200: {
      bodyMapper: ApiManagementMappers.ApiCollection,
    },
    default: {
      bodyMapper: ApiManagementMappers.ErrorResponse,
    },
  },
  serializer: new msRest.Serializer(ApiManagementMappers),
};
export const listByServiceNextOperationSpec: msRest.OperationSpec = {
  httpMethod: 'GET',
  baseUrl: 'https://management.azure.com',
  path: '{nextLink}',
  urlParameters: [nextPageLink],
  headerParameters: [acceptLanguage],
  responses: {
    200: {
      bodyMapper: ApiManagementMappers.ApiCollection,
    },
    default: {
      bodyMapper: ApiManagementMappers.ErrorResponse,
    },
  },
  serializer: new msRest.Serializer(ApiManagementMappers),
};
