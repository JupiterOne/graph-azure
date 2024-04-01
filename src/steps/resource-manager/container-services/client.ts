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
  public async iterateClusters(
    config,
    callback: (cluster: ManagedCluster) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = new ContainerServiceClient(
      this.getClientSecretCredentials(),
      config.subscriptionId,
    );
    for await (const item of serviceClient.managedClusters.list()) {
      await callback(item);
    }
  }

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

    for (let location of locationsArray) {
      const resArray: any = [];
      try {
        const roles = serviceClient.trustedAccessRoles.list(location.name);

        for await (let item of roles) {
          resArray.push(item);
        }

        for (let role of resArray) {
          await callback(role, location.name);
        }
      } catch (error) {
        if (error.statusCode && error.statusCode === 400) {
          logger.warn(`No registered resource provider found for location '${location.name}'.`);
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
