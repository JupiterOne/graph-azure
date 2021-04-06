import { SubscriptionClient } from '@azure/arm-subscriptions';
import { Subscription, Location } from '@azure/arm-subscriptions/esm/models';
import {
  Client,
  iterateAllResources,
  request,
} from '../../../azure/resource-manager/client';

const FIVE_MINUTES = 5 * 60 * 1000;
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

  public async iterateLocations(
    subscriptionId: string,
    callback: (l: Location) => void | Promise<void>,
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
      resourceEndpoint: {
        list: async () => {
          return serviceClient.subscriptions.listLocations(subscriptionId);
        },
      },
      resourceDescription: 'subscriptions.locations',
      callback,
    });
  }

  public async fetchSubscriptions(): Promise<Array<Subscription> | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      SubscriptionClient,
      {
        passSubscriptionId: false,
      },
    );
    const subscriptions = await request(
      async () => await serviceClient.subscriptions.list(),
      this.logger,
      'subscription',
      FIVE_MINUTES,
    );
    return subscriptions?._response?.parsedBody;
  }

  public async fetchSubscription(
    subscriptionId: string,
  ): Promise<Subscription | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      SubscriptionClient,
      {
        passSubscriptionId: false,
      },
    );
    const subscription = await request(
      async () => await serviceClient.subscriptions.get(subscriptionId),
      this.logger,
      'subscriptions',
      FIVE_MINUTES,
    );
    return subscription?._response?.parsedBody;
  }
}
