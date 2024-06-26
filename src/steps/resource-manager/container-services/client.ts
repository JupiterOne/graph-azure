import { Client } from '../../../azure/resource-manager/client';
import { resourceGroupName } from '../../../azure/utils';
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
    locationsArray: string[] | undefined,
    logger: IntegrationLogger,
    callback: (e, location) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = new ContainerServiceClient(
      this.getClientSecretCredentials(),
      config.subscriptionId,
    );
    if (!locationsArray) return;
    for (const locationName of locationsArray) {
      const resArray: any = [];
      try {
        const roles = serviceClient.trustedAccessRoles.list(locationName);

        for await (const item of roles) {
          resArray.push(item);
        }

        for (const role of resArray) {
          await callback(role, locationName);
        }
      } catch (error) {
        if (error.statusCode) {
          if (error.statusCode === 400) {
            logger.warn(
              `No registered resource provider found for location '${locationName}'.`,
            );
            // Skipping this location and continue with the next one
            continue;
          }
          if (error.statusCode === 404) {
            logger.warn(`Subscription not found for '${locationName}'.`);
            // Skipping this location and continue with the next one
            continue;
          }
        }
        throw error;
      }
    }
  }
}
