import {
  Subscription,
  Location,
  SubscriptionClient,
} from '@azure/arm-subscriptions';

import { Client } from '../../../azure/resource-manager/client';

export class J1SubscriptionClient extends Client {
  public async getSubscription(subscriptionId: string) {
    return await this.fetchSubscription(subscriptionId);
  }

  public async iterateSubscriptions(
    callback: (s: Subscription) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      SubscriptionClient,
      {
        passSubscriptionId: false,
      },
    );
    const iterator = await serviceClient.subscriptions.list();
    let page;
    do {
      page = await iterator.next();
      await callback(page.value);
    } while (page.done !== undefined && !page.done);
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
    const iterator = await serviceClient.subscriptions.listLocations(
      subscriptionId,
    );
    let page;
    do {
      page = await iterator.next();
      await callback(page.value);
    } while (page.done !== undefined && !page.done);
  }

  public async fetchSubscriptions(): Promise<Array<Subscription> | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      SubscriptionClient,
      {
        passSubscriptionId: false,
      },
    );
    const allSubscriptions: Subscription[] = [];
    const iterator = await serviceClient.subscriptions.list();
    const page = await iterator.byPage();
    let nextPage: IteratorResult<Subscription[], any>;
    do {
      nextPage = await page.next();
      allSubscriptions.push(nextPage.value);
    } while (nextPage.done !== undefined && !nextPage.done);
    return allSubscriptions;
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
    return await serviceClient.subscriptions.get(subscriptionId);
  }
}
