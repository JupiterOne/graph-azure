import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';

import {
  getMatchRequestsBy,
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { J1SubscriptionClient } from './client';
import { Location, Subscription } from '@azure/arm-subscriptions/esm/models';
import {
  config,
  configFromEnv,
} from '../../../../test/integrationInstanceConfig';

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

describe('iterateSubscriptions', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateSubscriptions',
      options: {
        recordFailedRequests: true,
      },
    });

    const client = new J1SubscriptionClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const resources: Subscription[] = [];
    await client.iterateSubscriptions((e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        authorizationSource: expect.any(String),
        displayName: expect.any(String),
        id: expect.any(String),
        state: expect.any(String),
        subscriptionId: expect.any(String),
        subscriptionPolicies: expect.any(Object),
      }),
    );
  });
});

describe('iterateLocations', () => {
  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateLocations',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });
    const client = new J1SubscriptionClient(
      configFromEnv,
      createMockIntegrationLogger(),
    );

    const subscriptionId = configFromEnv.subscriptionId!;

    const locations: Location[] = [];
    await client.iterateLocations(subscriptionId, (location) => {
      locations.push(location);
    });

    expect(locations.length).toBeGreaterThan(0);
  });
});

describe('fetchSubscription', () => {
  test('fetchSubscription', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'fetchSubscription',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const client = new J1SubscriptionClient(
      configFromEnv,
      createMockIntegrationLogger(),
    );

    const subscription = await client.fetchSubscription(
      configFromEnv.subscriptionId!,
    );

    expect(subscription).toMatchObject({
      authorizationSource: expect.any(String),
      displayName: expect.any(String),
      id: expect.any(String),
      state: expect.any(String),
      subscriptionId: expect.any(String),
      subscriptionPolicies: expect.any(Object),
    });
  });
});

describe('fetchSubscriptions', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'fetchSubscriptions',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const client = new J1SubscriptionClient(
      configFromEnv,
      createMockIntegrationLogger(),
    );

    const subscriptions = await client.fetchSubscriptions();

    expect(subscriptions).toContainEqual(
      expect.objectContaining({
        authorizationSource: expect.any(String),
        displayName: expect.any(String),
        id: expect.any(String),
        state: expect.any(String),
        subscriptionId: expect.any(String),
        subscriptionPolicies: expect.any(Object),
      }),
    );
  });
});
