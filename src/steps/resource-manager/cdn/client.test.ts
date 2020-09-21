import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';

import {
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { CdnClient } from './client';
import { IntegrationConfig } from '../../../types';
import { Profile, Endpoint } from '@azure/arm-cdn/esm/models';

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

describe('iterate profiles', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateProfiles',
    });

    const client = new CdnClient(config, createMockIntegrationLogger(), true);

    const resources: Profile[] = [];
    await client.iterateProfiles((e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        name: expect.stringContaining('j1dev'),
      }),
    );
  });
});

describe('iterate endpoints', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateEndpoints',
      options: {
        recordFailedRequests: true,
      },
    });

    const client = new CdnClient(config, createMockIntegrationLogger(), true);

    const profile = {
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev',
      name: 'j1dev',
    };

    const resources: Endpoint[] = [];
    await client.iterateEndpoints(profile, (e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        name: 'j1dev',
      }),
    );
  });
});
