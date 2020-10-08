import { ContainerRegistryManagementClient } from '@azure/arm-containerregistry';
import { Registry, Webhook } from '@azure/arm-containerregistry/esm/models';
import {
  Client,
  iterateAllResources,
} from '../../../azure/resource-manager/client';
import { resourceGroupName } from '../../../azure/utils';

export class J1ContainerRegistryManagementClient extends Client {
  public async iterateRegistries(
    callback: (s: Registry) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      ContainerRegistryManagementClient,
    );

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.registries,
      resourceDescription: 'containerRegistry.registry',
      callback,
    });
  }

  public async iterateRegistryWebhooks(
    containerRegistry: { name: string; id: string },
    callback: (s: Webhook) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      ContainerRegistryManagementClient,
    );
    const resourceGroup = resourceGroupName(containerRegistry.id, true)!;
    const registryName = containerRegistry.name;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => {
          return serviceClient.webhooks.list(resourceGroup, registryName);
        },
        listNext: /* istanbul ignore next: testing iteration might be difficult */ async (
          nextLink: string,
        ) => {
          return serviceClient.webhooks.listNext(nextLink);
        },
      },
      resourceDescription: 'containerRegistry.webhook',
      callback,
    });
  }
}
