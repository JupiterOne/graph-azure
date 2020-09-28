import {
  fetchEventGridDomains,
  fetchEventGridDomainTopics,
  fetchEventGridDomainTopicSubscriptions,
  fetchEventGridTopics,
  fetchEventGridTopicSubscriptions,
} from '.';

import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';

import { IntegrationConfig } from '../../../types';
import { setupAzureRecording } from '../../../../test/helpers/recording';

const instanceConfig: IntegrationConfig = {
  clientId: process.env.CLIENT_ID || 'clientId',
  clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
  directoryId: 'bcd90474-9b62-4040-9d7b-8af257b1427d',
  subscriptionId: '40474ebe-55a2-4071-8fa8-b610acdd8e56',
};

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

test('step = event grid domains', async () => {
  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-event-grid-domains',
  });

  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig,
    entities: [
      {
        _key:
          '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev',
        _type: 'azure_resource_group',
        _class: ['Group'],
        name: 'j1dev',
        id:
          '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev',
      },
    ],
  });

  context.jobState.getData = jest.fn().mockResolvedValue({
    defaultDomain: 'www.fake-domain.com',
  });

  await fetchEventGridDomains(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: 'Service',
    schema: {},
  });

  expect(context.jobState.collectedRelationships).toEqual([
    {
      _key:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev|has|/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain',
      _type: 'azure_resource_group_has_event_grid_domain',
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev',
      _toEntityKey:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain',
      displayName: 'HAS',
    },
  ]);
});

test('step = event grid domain topics', async () => {
  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-event-grid-domain-topics',
  });

  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig,
    entities: [
      {
        _key:
          '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev',
        _type: 'azure_resource_group',
        _class: ['Group'],
        name: 'j1dev',
        id:
          '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev',
      },

      {
        _key:
          '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain',
        _type: 'azure_event_grid_domain',
        _class: ['Service'],
        name: 'j1dev-event-grid-domain',
        id:
          '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain',
      },
    ],
  });

  context.jobState.getData = jest.fn().mockResolvedValue({
    defaultDomain: 'www.fake-domain.com',
  });

  await fetchEventGridDomainTopics(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: 'Queue',
    schema: {},
  });

  expect(context.jobState.collectedRelationships).toEqual([
    {
      _key:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain|has|/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain/topics/j1dev-event-grid-domain-topic',
      _type: 'azure_event_grid_domain_has_topic',
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain',
      _toEntityKey:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain/topics/j1dev-event-grid-domain-topic',
      displayName: 'HAS',
    },
  ]);
});

test('step = event grid domain topic subscriptions', async () => {
  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-event-grid-domain-topic-subscriptions',
  });

  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig,
    entities: [
      {
        _key:
          '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev',
        _type: 'azure_resource_group',
        _class: ['Group'],
        name: 'j1dev',
        id:
          '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev',
      },

      {
        _key:
          '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain/topics/j1dev-event-grid-domain-topic/',
        _type: 'azure_event_grid_domain_topic',
        _class: ['Queue'],
        name: 'j1dev-event-grid-domain-topic',
        id:
          '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain/topics/j1dev-event-grid-domain-topic/',
        type: 'Microsoft.EventGrid/domains/topics',
      },
    ],
  });

  context.jobState.getData = jest.fn().mockResolvedValue({
    defaultDomain: 'www.fake-domain.com',
  });

  await fetchEventGridDomainTopicSubscriptions(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: 'Subscription',
    schema: {},
  });

  expect(context.jobState.collectedRelationships).toEqual([
    {
      _key:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain/topics/j1dev-event-grid-domain-topic/|has|/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain/topics/j1dev-event-grid-domain-topic/providers/Microsoft.EventGrid/eventSubscriptions/j1dev-event-grid-domain-topic-subscription',
      _type: 'azure_event_grid_domain_topic_has_topic_subscription',
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain/topics/j1dev-event-grid-domain-topic/',
      _toEntityKey:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain/topics/j1dev-event-grid-domain-topic/providers/Microsoft.EventGrid/eventSubscriptions/j1dev-event-grid-domain-topic-subscription',
      displayName: 'HAS',
    },
  ]);
});

test('step = event grid topics', async () => {
  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-event-grid-topics',
  });

  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig,
    entities: [
      {
        _key:
          '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev',
        _type: 'azure_resource_group',
        _class: ['Group'],
        name: 'j1dev',
        id:
          '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev',
      },
    ],
  });

  context.jobState.getData = jest.fn().mockResolvedValue({
    defaultDomain: 'www.fake-domain.com',
  });

  await fetchEventGridTopics(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: 'Queue',
    schema: {},
  });

  expect(context.jobState.collectedRelationships).toEqual([
    {
      _key:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev|has|/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.EventGrid/topics/j1dev-event-grid-topic',
      _type: 'azure_resource_group_has_event_grid_topic',
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev',
      _toEntityKey:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.EventGrid/topics/j1dev-event-grid-topic',
      displayName: 'HAS',
    },
  ]);
});

test('step = event grid topic subscriptions', async () => {
  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-event-grid-topic-subscriptions',
  });

  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig,
    entities: [
      {
        _key:
          '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev',
        _type: 'azure_resource_group',
        _class: ['Group'],
        name: 'j1dev',
        id:
          '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev',
      },

      {
        _key:
          '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.EventGrid/topics/j1dev-event-grid-topic',
        _type: 'azure_event_grid_topic',
        _class: ['Queue'],
        name: 'j1dev-event-grid-topic',
        id:
          '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.EventGrid/topics/j1dev-event-grid-topic',
        type: 'Microsoft.EventGrid/topics',
      },
    ],
  });

  context.jobState.getData = jest.fn().mockResolvedValue({
    defaultDomain: 'www.fake-domain.com',
  });

  await fetchEventGridTopicSubscriptions(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: 'Subscription',
    schema: {},
  });

  expect(context.jobState.collectedRelationships).toEqual([
    {
      _key:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.EventGrid/topics/j1dev-event-grid-topic|has|/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.EventGrid/topics/j1dev-event-grid-topic/providers/Microsoft.EventGrid/eventSubscriptions/j1dev-event-grid-event-subscription',
      _type: 'azure_event_grid_topic_has_subscription',
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.EventGrid/topics/j1dev-event-grid-topic',
      _toEntityKey:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.EventGrid/topics/j1dev-event-grid-topic/providers/Microsoft.EventGrid/eventSubscriptions/j1dev-event-grid-event-subscription',
      displayName: 'HAS',
    },
  ]);
});
