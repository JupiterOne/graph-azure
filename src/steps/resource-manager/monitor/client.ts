import {
  Client,
  iterateAllResources,
} from '../../../azure/resource-manager/client';
import { MonitorManagementClient } from '@azure/arm-monitor';
import { LogProfileResource } from '@azure/arm-monitor/esm/models';

export class MonitorClient extends Client {
  /**
   * Returns the Log Profile for an Azure Subscription
   * Log Profiles are the legacy method for sending the Activity Log to Azure Storage or Azure Event Hubs.
   * The Activity Log captures all management activities performed on a subscription.
   * By default, Activity Logs are only retained for 90 days.
   * Historically, Log Profiles were used to make sure that all subscription related logs were retained for a longer duration.
   * @param callback A callback function to be called after retrieving the Log Profile for an Azure Subscription
   */
  public async iterateLogProfiles(
    callback: (s: LogProfileResource) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      MonitorManagementClient,
    );

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      /**
       * The @azure/arm-monitor client does not have a listNext() function for Log Profiles, because there is only one Log Profile allowed per Azure Subscription.
       */
      resourceEndpoint: serviceClient.logProfiles,
      resourceDescription: 'monitor.logProfile',
      callback,
    });
  }
}
