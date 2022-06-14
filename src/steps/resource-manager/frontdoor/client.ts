import { FrontDoorManagementClient } from '@azure/arm-frontdoor';
import { FrontDoor } from '@azure/arm-frontdoor/esm/models';
import {
  Client,
  iterateAllResources,
} from '../../../azure/resource-manager/client';

export class FrontDoorClient extends Client {
  public async iterateFrontDoors(
    callback: (resource: FrontDoor) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      FrontDoorManagementClient,
    );

    await iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.frontDoors,
      resourceDescription: 'frontdoor.frontdoors',
      callback,
    });
  }
}
