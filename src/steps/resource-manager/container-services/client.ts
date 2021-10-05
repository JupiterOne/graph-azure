import {
  Client,
  iterateAllResources,
} from '../../../azure/resource-manager/client';
import { ContainerServiceClient } from '@azure/arm-containerservice';
import { ManagedCluster } from '@azure/arm-containerservice/esm/models';

export class ContainerServicesClient extends Client {
  public async iterateClusters(
    callback: (cluster: ManagedCluster) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      ContainerServiceClient,
    );

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.managedClusters,
      resourceDescription: 'containerServices.clusters',
      callback,
    });
  }
}
