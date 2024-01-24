import {
  ApiManagementClient,
  ApiManagementMappers,
} from '@azure/arm-apimanagement';
import {
  ApiManagementServiceResource,
  ApiContract,
} from '@azure/arm-apimanagement/esm/models';
import {
  Client,
  FIVE_MINUTES,
  iterateAllResources,
  request,
} from '../../../azure/resource-manager/client';
import { resourceGroupName } from '../../../azure/utils';
import * as msRest from '@azure/ms-rest-js';
import { IntegrationWarnEventName } from '@jupiterone/integration-sdk-core';

export class J1ApiManagementClient extends Client {
  public async iterateApiManagementServices(
    callback: (s: ApiManagementServiceResource) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      ApiManagementClient,
    );
    await serviceClient.apiManagementService.list();
    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.apiManagementService,
      resourceDescription: 'apiManagement.apiManagementService',
      callback,
    });
  }

  public async iterateApiManagementServiceApis(
    apiService: { name: string; id: string },
    callback: (s: ApiContract) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      ApiManagementClient,
    );
    const resourceGroup = resourceGroupName(apiService.id, true)!;
    const serviceName = apiService.name!;

    try {
      let nextPageLink: string | undefined;
      do {
        const apiManagement: any = await request(
          async () =>
            nextPageLink
              ? await serviceClient.sendOperationRequest(
                  {
                    resourceGroupName: resourceGroup,
                    serviceName: serviceName,
                    nextLink: nextPageLink,
                  },
                  listByServiceNextOperationSpec,
                )
              : await serviceClient.sendOperationRequest(
                  {
                    resourceGroupName: resourceGroup,
                    serviceName: serviceName,
                  },
                  listByServiceOperationSpec,
                ),
          this.logger,
          'api.Management.ServiceApis',
          FIVE_MINUTES,
        );
        for (const service of apiManagement || []) {
          await callback(service);
        }
        nextPageLink = apiManagement?.nexLink;
      } while (nextPageLink);
    } catch (error) {
      if (error.status === 403) {
        this.logger.warn(
          { error, resourceUrl: resourceGroupName },
          'Encountered auth error in Azure Graph client.',
        );
        this.logger.publishWarnEvent({
          name: IntegrationWarnEventName.MissingPermission,
          description: `Received authorization error when attempting to call ${resourceGroup}. Please update credentials to grant access.`,
        });
        return;
      } else {
        throw error;
      }
    }
  }
}

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
export const acceptLanguage: msRest.OperationParameter = {
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
const listByServiceOperationSpec: msRest.OperationSpec = {
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
const listByServiceNextOperationSpec: msRest.OperationSpec = {
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
