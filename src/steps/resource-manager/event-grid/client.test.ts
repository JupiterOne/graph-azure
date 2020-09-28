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
    const resourceGroupInfo = {
      resourceGroupName: 'j1dev',
    };

    await client.iterateDomains(resourceGroupInfo, (e) => {
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
    const domainInfo = {
      resourceGroupName: 'j1dev',
      domainName: 'j1dev-event-grid-domain',
    };

    await client.iterateDomainTopics(domainInfo, (e) => {
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

describe('iterate domain topic subscriptions', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateDomainTopicSubscriptions',
    });

    const client = new EventGridClient(
      config,
      createMockIntegrationLogger(),
      true,
    );
    const resources: EventSubscription[] = [];
    const domainTopicInfo = {
      domainTopicName: 'j1dev-event-grid-domain-topic',
      domainName: 'j1dev-event-grid-domain',
      resourceGroupName: 'j1dev',
    };

    await client.iterateDomainTopicSubscriptions(domainTopicInfo, (e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        id:
          '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain/topics/j1dev-event-grid-domain-topic/providers/Microsoft.EventGrid/eventSubscriptions/j1dev-event-grid-domain-topic-subscription',
        name: 'j1dev-event-grid-domain-topic-subscription',
        type: 'Microsoft.EventGrid/eventSubscriptions',
        topic:
          '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/microsoft.eventgrid/domains/j1dev-event-grid-domain/topics/j1dev-event-grid-domain-topic',
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
    const resourceGroupInfo = {
      resourceGroupName: 'j1dev',
    };

    await client.iterateTopics(resourceGroupInfo, (e) => {
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
    const topicInfo = {
      resourceGroupName: 'j1dev',
      topicName: 'j1dev-event-grid-topic',
      topicType: 'topics',
      providerNamespace: 'Microsoft.EventGrid',
    };

    await client.iterateTopicSubscriptions(topicInfo, (e) => {
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
