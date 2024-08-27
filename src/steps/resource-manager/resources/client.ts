import { ResourceManagementClient } from '@azure/arm-resources';
import { ResourceGroup } from '@azure/arm-resources/esm/models';
import {
  Client,
  FIVE_MINUTES,
  iterateAll,
  iterateAllResources,
  request,
} from '../../../azure/resource-manager/client';
import { ManagementLockClient, ManagementLockObject } from '@azure/arm-locks';
export class ResourcesClient extends Client {
  public async getResourceProvider(resourceProviderNamespace: string) {
    const serviceClient = await this.getAuthenticatedServiceClient(
      ResourceManagementClient,
    );
    const response = await request(
      async () => await serviceClient.providers.get(resourceProviderNamespace),
      this.logger,
      'resourceProvider',
      FIVE_MINUTES,
    );
    return response?._response?.parsedBody;
  }

  public async iterateResourceGroups(
    callback: (rg: ResourceGroup) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      ResourceManagementClient,
    );
    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => serviceClient.resourceGroups.list(),
        listNext: serviceClient.resourceGroups.listNext,
      },
      resourceDescription: 'resources.resourceGroups',
      callback,
    });
  }

  public async iterateLocks(
    resourceGroupName: string,
    callback: (lock: ManagementLockObject) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = this.getServiceClient(ManagementLockClient);

    await iterateAll({
      resourceEndpoint:
        serviceClient.managementLocks.listAtResourceGroupLevel(
          resourceGroupName,
        ),
      logger: this.logger,
      resourceDescription: 'resources.resourceLocks',
      callback,
      endpointRatePeriod: FIVE_MINUTES,
      maxRetryAttempts: 20,
    });
  }
}
