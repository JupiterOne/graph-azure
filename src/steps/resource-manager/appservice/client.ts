import { WebSiteManagementClient } from '@azure/arm-appservice';
import {
  AppServicePlan,
  Site,
  WebAppsGetAuthSettingsResponse,
  WebAppsGetConfigurationResponse,
} from '@azure/arm-appservice/esm/models';
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
  ): Promise<WebAppsGetConfigurationResponse | null> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      WebSiteManagementClient,
    );

    if (!name || !resourceGroup) {
      return null;
    }

    return serviceClient.webApps.getConfiguration(resourceGroup, name);
  }

  public async fetchAppAuthSettings(
    name: string | undefined,
    resourceGroup: string | undefined,
  ): Promise<WebAppsGetAuthSettingsResponse | null> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      WebSiteManagementClient,
    );

    if (!name || !resourceGroup) {
      return null;
    }

    return serviceClient.webApps.getAuthSettings(resourceGroup, name);
  }
}
