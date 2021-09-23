import { Client } from '../../../azure/resource-manager/client';
import {
  ContainerServiceClient,
  ContainerServiceClientContext,
} from '@azure/arm-containerservice';
import { IntegrationProviderAPIError } from '@jupiterone/integration-sdk-core';
import { ManagedCluster } from '@azure/arm-containerservice/esm/models';

export class ContainerServicesClient extends Client {
  public async iterateClusters(
    callback: (cluster: ManagedCluster) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      ContainerServiceClientContext,
    );
    const client = new ContainerServiceClient(
      serviceClient.credentials,
      serviceClient.subscriptionId,
    );
    try {
      const items = await client.managedClusters.list();
      for (const item of items) {
        await callback(item);
      }
    } catch (err) {
      /* istanbul ignore else */
      if (err.statusCode === 404) {
        this.logger.warn({ err }, 'Clusters not found');
      } else {
        throw new IntegrationProviderAPIError({
          cause: err,
          endpoint: 'containerServices.kubernetesClusters',
          status: err.statusCode,
          statusText: err.statusText,
        });
      }
    }
  }
}
