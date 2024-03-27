import { Client } from '../../../azure/resource-manager/client';
import { resourceGroupName } from '../../../azure/utils';
import { SubscriptionClient } from '@azure/arm-resources-subscriptions';
import { ContainerServiceClient } from '@azure/arm-containerservice';
import {
  ManagedCluster,
  MaintenanceConfiguration,
} from '@azure/arm-containerservice/src/models';
import { Location } from '@azure/arm-subscriptions/esm/models';

export class ContainerServicesClient extends Client {
  public async iterateClusters(
    config,
    callback: (cluster: ManagedCluster) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = new ContainerServiceClient(
      this.getClientSecretCredentials(),
      config.subscriptionId,
    );
    for (const item of await serviceClient.managedClusters.list()) {
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
    for (const item of await serviceClient.maintenanceConfigurations.listByManagedCluster(
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
    for (const item of await serviceClient.trustedAccessRoleBindings.list(
      resourceGroup,
      resourceName,
    )) {
      await callback(item);
    }
  }

  public async iterateAccessRoles(
    config,
    callback: (e, location) => void | Promise<void>,
  ): Promise<void> {
    const subscriptionClient = new SubscriptionClient(
      this.getClientSecretCredentials(),
      config.subscriptionId,
    );

    const locationsArray: Array<Location> = [];
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
      try {
        for await (const item of serviceClient.trustedAccessRoles.list(
          location.name!,
        )) {
          await callback(item, location.name);
        }
      } catch (e) {
        // NoRegisteredProviderFound: Ignore the error as there are no resources on the location
      }
    }
  }
}
