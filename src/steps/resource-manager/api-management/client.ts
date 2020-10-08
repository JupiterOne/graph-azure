import { ApiManagementClient } from '@azure/arm-apimanagement';
import {
  ApiManagementServiceResource,
  ApiContract,
} from '@azure/arm-apimanagement/esm/models';
import {
  Client,
  iterateAllResources,
} from '../../../azure/resource-manager/client';
import { resourceGroupName } from '../../../azure/utils';

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

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => {
          return serviceClient.api.listByService(resourceGroup, serviceName);
        },
        listNext: /* istanbul ignore next: testing iteration might be difficult */ async (
          nextLink: string,
        ) => {
          return serviceClient.api.listByServiceNext(nextLink);
        },
      },
      resourceDescription: 'apiManagement.api',
      callback,
    });
  }
}
