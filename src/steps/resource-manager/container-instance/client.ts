import { ContainerInstanceManagementClient } from '@azure/arm-containerinstance';
import { ContainerGroup } from '@azure/arm-containerinstance/esm/models';
import {
  Client,
  iterateAllResources,
  ListResourcesEndpoint,
} from '../../../azure/resource-manager/client';

export class ContainerInstanceClient extends Client {
  /**
   * Retrieves all Container Groups in a Resource Group for an Azure Subscription
   * @param resourceGroupInfo An object containing information about the Resource Group that the Container Group is in. This information should contain the name of Resource Group.
   * @param callback A callback function to be called after retrieving a Container Group
   */
  public async iterateContainerGroups(
    resourceGroupInfo: { resourceGroupName: string },
    callback: (s: ContainerGroup) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      ContainerInstanceManagementClient,
    );
    const { resourceGroupName } = resourceGroupInfo;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () =>
          serviceClient.containerGroups.listByResourceGroup(resourceGroupName),
        listNext: serviceClient.containerGroups.listByResourceGroupNext,
      } as ListResourcesEndpoint,
      resourceDescription: 'containerInstance.containerGroups',
      callback,
    });
  }
}
