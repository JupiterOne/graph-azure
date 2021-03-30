import {
  Client,
  iterateAllResources,
} from '../../../azure/resource-manager/client';
import { MonitorManagementClient } from '@azure/arm-monitor';
import {
  ActivityLogAlertResource,
  DiagnosticSettingsResource,
  LogProfileResource,
} from '@azure/arm-monitor/esm/models';

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

  /**
   * Returns the Diagnostic Settings for an Azure Resource
   * Diagnostic Settings are the new way to send platform logs, including the Azure Activity Log and resource logs, and metrics to different destinations.
   * These settings define the categories or types of metrics and logs that should be sent somewhere, and one or more destinations to send the logs and metrics.
   * Currently, you can send metrics and logs to Log Analytics workspace, Event Hubs, and Azure Storage.
   * @param callback A callback function to be called after retrieving the Diagnostic Settings for an Azure Subscription
   */
  public async iterateDiagnosticSettings(
    resourceUri: string,
    callback: (s: DiagnosticSettingsResource) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      MonitorManagementClient,
    );

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => {
          const response = await serviceClient.diagnosticSettings.list(
            resourceUri,
          );
          const diagnosticSettings = response.value!;
          return Object.assign(diagnosticSettings, {
            _response: response._response,
          });
        },
      },
      resourceDescription: 'monitor.diagnosticSetting',
      callback,
    });
  }

  public async iterateActivityLogAlerts(
    resourceGroup: {
      name: string;
    },
    callback: (a: ActivityLogAlertResource) => void | Promise<void>,
  ) {
    const serviceClient = await this.getAuthenticatedServiceClient(
      MonitorManagementClient,
    );

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () =>
          serviceClient.activityLogAlerts.listByResourceGroup(
            resourceGroup.name,
          ),
      },
      resourceDescription: 'monitor.activityLogAlerts',
      callback,
    });
  }
}
