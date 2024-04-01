import { SecurityCenter } from '@azure/arm-security';
import {
  AutoProvisioningSetting,
  Pricing,
  SecurityAssessment,
  SecurityContact,
  Setting,
} from '@azure/arm-security/esm/models';
import {
  Client,
  iterateAllResources,
} from '../../../azure/resource-manager/client';

export class SecurityClient extends Client {
  public async iterateAssessments(
    subscriptionScope: string,
    callback: (s: SecurityAssessment) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      SecurityCenter,
    );

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => {
          return serviceClient.assessments.list(subscriptionScope);
        },
        listNext: async (nextPageLink: string) => {
          return serviceClient.assessments.listNext(nextPageLink);
        },
      },
      resourceDescription: 'security.assessments',
      callback,
    });
  }

  public async iteratePricings(
    callback: (p: Pricing) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      SecurityCenter,
    );

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => {
          const response = await serviceClient.pricings.list();
          const pricings = response.value;
          return Object.assign(pricings, {
            _response: response._response,
          });
        },
      },
      resourceDescription: 'security.pricings',
      callback,
    });
  }

  public async iterateSettings(
    callback: (s: Setting) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      SecurityCenter,
    );

    try {
      await iterateAllResources({
        logger: this.logger,
        serviceClient,
        resourceEndpoint: serviceClient.settings,
        resourceDescription: 'security.settings',
        callback,
      });
    } catch (err) {
      this.logger.warn(
        { error: err.message },
        'Error iterating security settings.',
      );
    }
  }

  public async iterateAutoProvisioningSettings(
    callback: (s: AutoProvisioningSetting) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      SecurityCenter,
    );

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.autoProvisioningSettings,
      resourceDescription: 'security.autoProvisioningSettings',
      callback,
    });
  }

  /**
   * This operation retrieves the list of all security contact configurations for the given subscription.
   * @param callback A callback function to be called after retrieving a Security Contact
   */
  public async iterateSecurityContacts(
    callback: (s: SecurityContact) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      SecurityCenter,
    );

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.securityContacts,
      resourceDescription: 'security.contacts',
      callback,
    });
  }
}
