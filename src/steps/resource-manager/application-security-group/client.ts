import { ApplicationSecurityGroup } from '@azure/arm-network/esm/models';
import {
  Client,
  iterateAllResources,
} from '../../../azure/resource-manager/client';
import { NetworkManagementClient as AzureNetworkManagementClient } from '@azure/arm-network';

export class MyNetworkManagementClient extends Client {
  /**
   * Retrieves all applicationSecurityGroups data for a Resource Group from an Azure Subscription
   * @param applicationSecurityGroups An object containing the resource group name.
   * @param callback A callback function to be called after retrieving an Event Grid Domain
   */
  public async iterateApplicationSecurityGroups(
    applicationSecurityGroups: { resourceGroupName: string },
    callback: (s: ApplicationSecurityGroup) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      AzureNetworkManagementClient,
    );
    await serviceClient.applicationSecurityGroups;
    const { resourceGroupName } = applicationSecurityGroups;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () =>
          serviceClient.applicationSecurityGroups.list(resourceGroupName),
      },
      resourceDescription: 'ApplicationSecurityGroup',
      callback,
    });
  }
}
