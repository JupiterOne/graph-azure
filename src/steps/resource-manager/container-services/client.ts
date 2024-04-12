import { Client } from '../../../azure/resource-manager/client';
import { resourceGroupName } from '../../../azure/utils';
import { SubscriptionClient } from '@azure/arm-resources-subscriptions';
import { ContainerServiceClient } from '@azure/arm-containerservice';
import {
  ManagedCluster,
  MaintenanceConfiguration,
} from '@azure/arm-containerservice/src/models';
import { IntegrationLogger } from '@jupiterone/integration-sdk-core';

export class ContainerServicesClient extends Client {
  /**
   * Retrieves all managed clusters from an Azure Container Service.
   * @param config The configuration object containing necessary parameters such as subscriptionId.
   * @param callback A callback function to be called with each retrieved managed cluster.
   * @returns A promise that resolves once all managed clusters have been iterated through.
   * @throws {Error} If an error occurs during the retrieval process.
   */
  public async iterateClusters(
    config,
    callback: (cluster: ManagedCluster) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = new ContainerServiceClient(
      this.getClientSecretCredentials(),
      config.subscriptionId as string,
    );
    for await (const item of serviceClient.managedClusters.list()) {
      await callback(item);
    }
  }

  /**
   * Retrieves all maintenance configurations for a specified managed cluster from an Azure Container Service.
   * @param config The configuration object containing necessary parameters such as subscriptionId.
   * @param cluster An object containing the name and id of the managed cluster.
   * @param callback A callback function to be called with each retrieved maintenance configuration.
   * @returns A promise that resolves once all maintenance configurations have been iterated through.
   * @throws {Error} If an error occurs during the retrieval process.
   */
  public async iterateMaintenanceConfigurations(
    config,
    cluster: { name: string; id: string },
    callback: (e: MaintenanceConfiguration) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = new ContainerServiceClient(
      this.getClientSecretCredentials(),
      config.subscriptionId,
    );
    const resourceGroup = resourceGroupName(cluster.id, true);
    for await (const item of serviceClient.maintenanceConfigurations.listByManagedCluster(
      resourceGroup,
      cluster.name,
    )) {
      await callback(item);
    }
  }

  /**
   * Retrieves all role bindings for a specified managed cluster from an Azure Container Service.
   * @param config The configuration object containing necessary parameters such as subscriptionId.
   * @param cluster An object containing the name and id of the managed cluster.
   * @param callback A callback function to be called with each retrieved role binding.
   * @returns A promise that resolves once all role bindings have been iterated through.
   * @throws {Error} If an error occurs during the retrieval process.
   */
  public async iterateRoleBindings(
    config,
    cluster: { name: string; id: string },
    callback: (e) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = new ContainerServiceClient(
      this.getClientSecretCredentials(),
      config.subscriptionId,
    );
    const resourceGroup = resourceGroupName(cluster.id, true)!;
    const resourceName = cluster.name;
    for await (const item of serviceClient.trustedAccessRoleBindings.list(
      resourceGroup,
      resourceName,
    )) {
      await callback(item);
    }
  }

  /**
   * Retrieves access roles for each location in an Azure Subscription.
   * @param config The configuration object containing necessary parameters such as subscriptionId.
   * @param logger An integration logger for logging warnings or errors.
   * @param callback A callback function to be called with each retrieved access role and its location.
   * @returns A promise that resolves once all access roles have been iterated through.
   * @throws {Error} If an error occurs during the retrieval process.
   */
  public async iterateAccessRoles(
    config,
    logger: IntegrationLogger,
    callback: (e, location) => void | Promise<void>,
  ): Promise<void> {
    const subscriptionClient = new SubscriptionClient(
      this.getClientSecretCredentials(),
      config.subscriptionId,
    );

    const locationsArray: any = [];
    for await (const item of subscriptionClient.subscriptions.listLocations(
      config.subscriptionId,
    )) {
      locationsArray.push(item);
    }
    const serviceClient = new ContainerServiceClient(
      this.getClientSecretCredentials(),
      config.subscriptionId,
    );

    for (const location of locationsArray) {
      const resArray: any = [];
      try {
        const roles = serviceClient.trustedAccessRoles.list(location.name);

        for await (const item of roles) {
          resArray.push(item);
        }

        for (const role of resArray) {
          await callback(role, location.name);
        }
      } catch (error) {
        if (error.statusCode && error.statusCode === 400) {
          logger.warn(
            `No registered resource provider found for location '${location.name}'.`,
          );
          // Skipping this location and continue with the next one
          continue;
        } else {
          // Rethrow the error if it's not a 400 error
          throw error;
        }
      }
    }
  }
}
