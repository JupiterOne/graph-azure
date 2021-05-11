import {
  Client,
  iterateAllResources,
} from '../../../azure/resource-manager/client';
import { PolicyInsightsClient } from '@azure/arm-policyinsights';
import { PolicyState } from '@azure/arm-policyinsights/esm/models';
import { IntegrationConfig } from '../../../types';
import { IntegrationLogger } from '@jupiterone/integration-sdk-core';

export class AzurePolicyInsightsClient extends Client {
  private subscriptionId: string;

  constructor(
    config: IntegrationConfig,
    logger: IntegrationLogger,
    noRetryPolicy?: boolean,
  ) {
    super(config, logger, noRetryPolicy);
    this.subscriptionId = config.subscriptionId!;
  }

  public async iterateLatestPolicyStatesForSubscription(
    callback: (s: PolicyState) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PolicyInsightsClient,
      { passSubscriptionId: false },
    );

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: () => {
          return serviceClient.policyStates.listQueryResultsForSubscription(
            'latest',
            this.subscriptionId,
          );
        },
        listNext: (nextLink) => {
          return serviceClient.policyStates.listQueryResultsForSubscriptionNext(
            nextLink,
          );
        },
      },
      resourceDescription: 'policyInsights.policyStates',
      callback,
    });
  }
}
