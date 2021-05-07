import { WebSiteManagementClient } from '@azure/arm-appservice';
import { Site } from '@azure/arm-appservice/esm/models';
import {
  Client,
  iterateAllResources,
} from '../../../azure/resource-manager/client';

export class AppServiceClient extends Client {
  public async iterateApps(
    callback: (s: Site) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      WebSiteManagementClient,
    );

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.webApps,
      resourceDescription: 'appService.webApps',
      callback,
    });
  }
}
