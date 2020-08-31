import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';

import {
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { J1SubscriptionClient } from './client';
import { Subscription } from '@azure/arm-subscriptions/esm/models';
import { IntegrationConfig } from '../../../types';

// developer used different creds than ~/test/integrationInstanceConfig
const config: IntegrationConfig = {
  clientId: process.env.CLIENT_ID || 'clientId',
  clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
  directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
  subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
};

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
