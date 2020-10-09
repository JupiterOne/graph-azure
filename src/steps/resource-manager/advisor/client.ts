import { AdvisorManagementClient } from '@azure/arm-advisor';
import {
  ResourceRecommendationBase,
  SuppressionContract,
} from '@azure/arm-advisor/esm/models';
import {
  Client,
  iterateAllResources,
} from '../../../azure/resource-manager/client';

export class AdvisorClient extends Client {
  public async iterateRecommendations(
    callback: (s: ResourceRecommendationBase) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      AdvisorManagementClient,
    );

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.recommendations,
      resourceDescription: 'advisor.recommendation',
      callback,
    });
  }

  public async iterateSuppressions(
    callback: (s: SuppressionContract) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      AdvisorManagementClient,
    );

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.suppressions,
      resourceDescription: 'advisor.suppression',
      callback,
    });
  }
}
