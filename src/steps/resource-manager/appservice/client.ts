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

  public createAppAuthConfigurationContext(): (
    name?: string,
    resourceGroup?: string,
  ) => Promise<WebAppsGetAuthSettingsResponse | undefined> {
    let canGetAuthSettings: boolean | undefined = undefined;

    return async (
      name?: string,
      resourceGroup?: string,
    ): Promise<WebAppsGetAuthSettingsResponse | undefined> => {
      if (typeof canGetAuthSettings === 'undefined') {
        canGetAuthSettings = await this.canFetchAppAuthSettings(
          name,
          resourceGroup,
        );
      }

      if (!canGetAuthSettings) {
        return;
      }

      const serviceClient = await this.getAuthenticatedServiceClient(
        WebSiteManagementClient,
      );

      if (!name || !resourceGroup) {
        return;
      }

      return serviceClient.webApps.getAuthSettings(resourceGroup, name);
    };
  }

  public async canFetchAppAuthSettings(
    name: string | undefined,
    resourceGroup: string | undefined,
  ): Promise<boolean | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      WebSiteManagementClient,
    );

    if (!name || !resourceGroup) {
      return;
    }

    try {
      await serviceClient.webApps.getAuthSettings(resourceGroup, name);
      return true;
    } catch (err) {
      this.logger.warn({ err }, 'Warning: unable to fetch app configuration.');
      if (err.statusCode === 403 && err.code === 'AuthorizationFailed') {
        this.logger.publishEvent({
          name: 'MISSING_PERMISSION',
          description:
            'Missing permission "Microsoft.Web/sites/config/list/action", which is used to fetch WebApp Auth Settings. Please update the `JupiterOne Reader` Role in your Azure environment in order to fetch these settings for your WebApp.',
        });
        return false;
      }
      return;
    }
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

    return serviceClient.webApps.getConfiguration(resourceGroup, name);
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

    return serviceClient.webApps.getAuthSettings(resourceGroup, name);
  }
}
