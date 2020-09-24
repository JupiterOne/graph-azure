import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';
import {
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { IntegrationConfig } from '../../../types';
import { EventGridClient } from './client';
import {
  Domain,
  DomainTopic,
  EventSubscription,
  Topic,
} from '@azure/arm-eventgrid/esm/models';

// developer used different creds than ~/test/integrationInstanceConfig
const config: IntegrationConfig = {
  clientId: process.env.CLIENT_ID || 'clientId',
  clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
  directoryId: 'bcd90474-9b62-4040-9d7b-8af257b1427d',
  subscriptionId: '40474ebe-55a2-4071-8fa8-b610acdd8e56',
};

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

describe('iterate domains', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateDomains',
    });

    const client = new EventGridClient(
      config,
      createMockIntegrationLogger(),
      true,
    );
    const resources: Domain[] = [];
    const resourceGroup = {
      name: 'j1dev',
    };

    await client.iterateDomains(resourceGroup, (e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        name: 'j1dev-event-grid-domain',
        type: 'Microsoft.EventGrid/domains',
      }),
    );
  });
});

describe('iterate domain topics', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateDomainTopics',
    });

    const client = new EventGridClient(
      config,
      createMockIntegrationLogger(),
      true,
    );
    const resources: DomainTopic[] = [];
    const eventGridDomain = {
      id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/Microsoft.EventGrid/domains/j1dev-event-grid-domain`,
      name: 'j1dev-event-grid-domain',
    };

    await client.iterateDomainTopics(eventGridDomain, (e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        name: 'j1dev-event-grid-domain-topic',
        type: 'Microsoft.EventGrid/domains/topics',
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

    const client = new EventGridClient(
      config,
      createMockIntegrationLogger(),
      true,
    );
    const resources: Topic[] = [];
    const resourceGroup = {
      name: 'j1dev',
    };

    await client.iterateTopics(resourceGroup, (e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        name: 'j1dev-event-grid-topic',
        type: 'Microsoft.EventGrid/topics',
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

    const client = new EventGridClient(
      config,
      createMockIntegrationLogger(),
      true,
    );
    const resources: EventSubscription[] = [];
    const topic = {
      name: 'j1dev-event-grid-topic',
      type: 'Microsoft.EventGrid/topics',
      id:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.EventGrid/topics/j1dev-event-grid-topic',
    };

    await client.iterateTopicSubscriptions(topic, (e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        id:
          '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.EventGrid/topics/j1dev-event-grid-topic/providers/Microsoft.EventGrid/eventSubscriptions/j1dev-event-grid-event-subscription',
        name: 'j1dev-event-grid-event-subscription',
        type: 'Microsoft.EventGrid/eventSubscriptions',
        topic:
          '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/microsoft.eventgrid/topics/j1dev-event-grid-topic',
      }),
    );
  });
});

// TODO add iterate subscriptions test
