import { DdosProtectionPlan } from '@azure/arm-network-latest';
import {
  Client,
  iterateAllResources,
} from '../../../azure/resource-manager/client';
import { NetworkManagementClient } from '@azure/arm-network';

export class Ddos extends Client {
  /**
   * Retrieves all Event Grid Domains for a Resource Group from an Azure Subscription
   * @param domainInfo An object containing information about the domain to retrieve like the Resource Group name belonging to an Azure Subscription
   * @param callback A callback function to be called after retrieving an Event Grid Domain
   */
  public async iterateDdosProtectionPlan(
    callback: (s: DdosProtectionPlan) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      NetworkManagementClient,
    );

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.ddosProtectionPlans,
      resourceDescription: 'ddos.protectionplan',
      callback,
    });
  }
}
