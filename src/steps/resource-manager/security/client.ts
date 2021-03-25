import { SecurityCenter } from '@azure/arm-security';
import {
  Pricing,
  SecurityAssessment,
  SecurityContact,
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
