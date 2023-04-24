import { WebSiteManagementClient } from '@azure/arm-appservice';
import {
  AppServicePlan,
  Site,
  WebAppsGetAuthSettingsResponse,
  WebAppsGetConfigurationResponse,
} from '@azure/arm-appservice/esm/models';
import {
  Client,
  FIVE_MINUTES,
  iterateAllResources,
  request,
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

  public async iterateAppServicePlans(
    callback: (s: AppServicePlan) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      WebSiteManagementClient,
    );

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.appServicePlans,
      resourceDescription: 'appService.appServicePlans',
      callback,
    });
  }

  public async fetchAppConfiguration(
    name: string | undefined,
    resourceGroup: string | undefined,
  ): Promise<WebAppsGetConfigurationResponse | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      WebSiteManagementClient,
    );

    if (!name || !resourceGroup) {
      return;
    }
    const response = await request(
      async () =>
        await serviceClient.webApps.getConfiguration(resourceGroup, name),
      this.logger,
      'webApps.getConfiguration',
      FIVE_MINUTES,
    );
    return response;
  }

  public async fetchAppAuthSettings(
    name: string | undefined,
    resourceGroup: string | undefined,
  ): Promise<WebAppsGetAuthSettingsResponse | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      WebSiteManagementClient,
    );

    if (!name || !resourceGroup) {
      return;
    }
    const response = await request(
      async () =>
        await serviceClient.webApps.getAuthSettings(resourceGroup, name),
      this.logger,
      'webApps.getAuthSettings',
      FIVE_MINUTES,
    );
    return response;
  }
}
