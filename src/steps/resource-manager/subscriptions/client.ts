import { SubscriptionClient } from '@azure/arm-subscriptions';
import { Subscription } from '@azure/arm-subscriptions/esm/models';
import {
  Client,
  iterateAllResources,
} from '../../../azure/resource-manager/client';

export class J1SubscriptionClient extends Client {
  public async iterateSubscriptions(
    callback: (s: Subscription) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      SubscriptionClient,
      {
        passSubscriptionId: false,
      },
    );
    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.subscriptions,
      resourceDescription: 'subscriptions',
      callback,
    });
  }
}
