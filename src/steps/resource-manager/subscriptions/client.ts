import {
  SubscriptionClient,
  SubscriptionMappers,
} from '@azure/arm-subscriptions';
import * as msRest from '@azure/ms-rest-js';

import { Subscription, Location } from '@azure/arm-subscriptions/esm/models';
import {
  Client,
  iterateAllResources,
  request,
} from '../../../azure/resource-manager/client';

const FIVE_MINUTES = 5 * 60 * 1000;
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
    let allSubscriptions: Subscription[] = [];
    let nextPageLink: string | undefined;
    do {
      const subscriptions = await request(
        // Need API version to 2020-01-01 in order to return subscription tags
        // serviceClient.subscriptions.list() does not work because the api version is too old
        // sendOperationRequest was the only way I found to change the API version with this sdk
        async () =>
          nextPageLink
            ? await serviceClient.sendOperationRequest(
                { nextPageLink },
                listNextOperationSpec,
              )
            : await serviceClient.sendOperationRequest(
                {},
                listSubscripsionsOperationSpec,
              ),
        this.logger,
        'subscription',
        FIVE_MINUTES,
      );
      allSubscriptions = allSubscriptions.concat(
        subscriptions?._response?.parsedBody,
      );
      nextPageLink = subscriptions?._response?.parsedBody.nextLink;
    } while (nextPageLink);
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
    const subscription = await request(
      async () => await serviceClient.subscriptions.get(subscriptionId),
      this.logger,
      'subscriptions',
      FIVE_MINUTES,
    );
    return subscription?._response?.parsedBody;
  }
}

/**
 *  Taken from node_modules/@azure/arm-subscriptions/src/operations/subscriptions.ts with the only change being the api version
 */
const apiVersion2020: msRest.OperationQueryParameter = {
  parameterPath: 'apiVersion',
  mapper: {
    required: true,
    isConstant: true,
    serializedName: 'api-version',
    defaultValue: '2020-01-01',
    type: {
      name: 'String',
    },
  },
};
export const acceptLanguage: msRest.OperationParameter = {
  parameterPath: 'acceptLanguage',
  mapper: {
    serializedName: 'accept-language',
    defaultValue: 'en-US',
    type: {
      name: 'String',
    },
  },
};
const listSubscripsionsOperationSpec: msRest.OperationSpec = {
  httpMethod: 'GET',
  path: 'subscriptions',
  queryParameters: [apiVersion2020],
  headerParameters: [acceptLanguage],
  responses: {
    200: {
      bodyMapper: SubscriptionMappers.LocationListResult,
    },
    default: {
      bodyMapper: SubscriptionMappers.CloudError,
    },
  },
  serializer: new msRest.Serializer(SubscriptionMappers),
};
const nextPageLink: msRest.OperationURLParameter = {
  parameterPath: 'nextPageLink',
  mapper: {
    required: true,
    serializedName: 'nextLink',
    type: {
      name: 'String',
    },
  },
  skipEncoding: true,
};
const listNextOperationSpec: msRest.OperationSpec = {
  httpMethod: 'GET',
  baseUrl: 'https://management.azure.com',
  path: '{nextLink}',
  urlParameters: [nextPageLink],
  headerParameters: [acceptLanguage],
  responses: {
    200: {
      bodyMapper: SubscriptionMappers.LocationListResult,
    },
    default: {
      bodyMapper: SubscriptionMappers.CloudError,
    },
  },
  serializer: new msRest.Serializer(SubscriptionMappers),
};
