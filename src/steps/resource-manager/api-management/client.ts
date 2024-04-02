import { ApiManagementClient } from '@azure/arm-apimanagement';
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
import { IntegrationWarnEventName } from '@jupiterone/integration-sdk-core';
import {
  listByServiceNextOperationSpec,
  listByServiceOperationSpec,
} from './parameters';

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
            await serviceClient.sendOperationRequest(
              {
                resourceGroupName: resourceGroup,
                serviceName: serviceName,
                nextLink: nextPageLink,
              },
              nextPageLink
                ? listByServiceNextOperationSpec
                : listByServiceOperationSpec,
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
          { error: error.message, resourceUrl: resourceGroupName },
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
