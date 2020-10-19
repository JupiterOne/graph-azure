import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';

import {
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { AdvisorClient } from './client';
import { IntegrationConfig } from '../../../types';
import { ResourceRecommendationBase } from '@azure/arm-advisor/esm/models';

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

describe('iterate advisor recommendations', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateRecommendations',
    });

    const client = new AdvisorClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const resources: ResourceRecommendationBase[] = [];
    await client.iterateRecommendations((e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        type: 'Microsoft.Advisor/recommendations',
      }),
    );
  });
});
