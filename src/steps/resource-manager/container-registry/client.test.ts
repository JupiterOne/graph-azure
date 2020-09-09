import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';

import {
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { J1ContainerRegistryManagementClient } from './client';
import { IntegrationConfig } from '../../../types';
import { Registry, Webhook } from '@azure/arm-containerregistry/esm/models';

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

describe('iterate container registries', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateRegistries',
    });

    const client = new J1ContainerRegistryManagementClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const resources: Registry[] = [];
    await client.iterateRegistries((e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        name: expect.stringContaining('j1dev'),
      }),
    );
  });
});

describe('iterate container registry webhooks', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateRegistryWebhooks',
      options: {
        recordFailedRequests: true,
      },
    });

    const client = new J1ContainerRegistryManagementClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const registry = {
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ContainerRegistry/registries/ndowmon1j1dev',
      name: 'ndowmon1j1dev',
    };

    const resources: Webhook[] = [];
    await client.iterateRegistryWebhooks(registry, (e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        name: 'j1dev',
      }),
    );
  });
});
