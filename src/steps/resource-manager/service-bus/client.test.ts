import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';

import {
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { ServiceBusClient } from './client';
import { IntegrationConfig } from '../../../types';
import { Zone, RecordSet } from '@azure/arm-dns/esm/models';

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

describe('iterate namespaces', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateNamespaces',
    });

    const client = new ServiceBusClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const resources: Zone[] = [];
    await client.iterateNamespaces((e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        name: 'ndowmon1j1dev',
      }),
    );
  });
});

describe('iterate queues', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateQueues',
    });

    const client = new ServiceBusClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const serviceBusNamespace = {
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev',
      name: 'ndowmon1j1dev',
    };

    const resources: RecordSet[] = [];
    await client.iterateQueues(serviceBusNamespace, (e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        name: 'j1dev-queue',
      }),
    );
  });
});

describe('iterate topics', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateTopics',
    });

    const client = new ServiceBusClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const serviceBusNamespace = {
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev',
      name: 'ndowmon1j1dev',
    };

    const resources: RecordSet[] = [];
    await client.iterateTopics(serviceBusNamespace, (e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        name: 'j1dev-topic',
      }),
    );
  });
});

describe('iterate topic subscriptions', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateTopicSubscriptions',
    });

    const client = new ServiceBusClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const serviceBusNamespace = {
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev',
      name: 'ndowmon1j1dev',
    };

    const resources: RecordSet[] = [];
    await client.iterateTopicSubscriptions(
      serviceBusNamespace,
      'j1dev-topic',
      (e) => {
        resources.push(e);
      },
    );

    expect(resources).toContainEqual(
      expect.objectContaining({
        name: 'j1dev',
      }),
    );
  });
});
