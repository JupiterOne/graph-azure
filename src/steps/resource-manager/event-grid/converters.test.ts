import { createAzureWebLinker } from '../../../azure';
import {
  createEventGridDomainEntity,
  createEventGridDomainTopicEntity,
  createEventGridTopicSubscriptionEntity,
  createEventGridTopicEntity,
} from './converters';
import {
  Domain,
  DomainTopic,
  EventSubscription,
  Topic,
} from '@azure/arm-eventgrid/esm/models';

const webLinker = createAzureWebLinker('something.onmicrosoft.com');

describe('createEventGridDomainEntity', () => {
  test('properties transferred', () => {
    const data: Domain = {
      endpoint:
        'https://j1dev-event-grid-domain.eastus-1.eventgrid.azure.net/api/events',
      id:
        '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/resoruce/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain',
      inputSchema: 'EventGridSchema',
      location: 'eastus',
      metricResourceId: '10000000-0000-0000-0000-000000000000',
      name: 'j1dev-event-grid-domain',
      provisioningState: 'Succeeded',
      publicNetworkAccess: 'Enabled',
      tags: {
        environment: 'j1dev',
      },
      type: 'Microsoft.EventGrid/domains',
    };

    const domainEntity = createEventGridDomainEntity(webLinker, data);

    expect(domainEntity).toMatchSnapshot();
    expect(domainEntity).toMatchGraphObjectSchema({
      _class: ['Service'],
      schema: {},
    });
  });
});

describe('createEventGridDomainTopicEntity', () => {
  test('properties transferred', () => {
    const data: DomainTopic = {
      id:
        '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain/topics/j1dev-event-grid-domain-topic',
      name: 'j1dev-event-grid-domain-topic',
      provisioningState: 'Succeeded',
      type: 'Microsoft.EventGrid/domains/topics',
    };

    const domainTopicEntity = createEventGridDomainTopicEntity(webLinker, data);

    expect(domainTopicEntity).toMatchSnapshot();
    expect(domainTopicEntity).toMatchGraphObjectSchema({
      _class: ['Queue'],
      schema: {},
    });
  });
});

describe('createEventGridTopicSubscriptionEntity', () => {
  test('properties transferred', () => {
    const data: EventSubscription = {
      id:
        '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/j1dev/providers/Microsoft.EventGrid/topics/j1dev-event-grid-topic/providers/Microsoft.EventGrid/eventSubscriptions/j1dev-event-grid-subscription',
      name: 'j1dev-event-grid-subscription',
      provisioningState: 'Succeeded',
      type: 'Microsoft.EventGrid/eventSubscriptions',
    };

    const eventSubscriptionEntity = createEventGridTopicSubscriptionEntity(
      webLinker,
      data,
    );

    expect(eventSubscriptionEntity).toMatchSnapshot();
    expect(eventSubscriptionEntity).toMatchGraphObjectSchema({
      _class: ['Subscription'],
      schema: {},
    });
  });
});

describe('createEventGridTopicEntity', () => {
  test('properties transferred', () => {
    const data: Topic = {
      endpoint:
        'https://j1dev-eventgrid-topic.eastus-1.eventgrid.azure.net/api/events',
      id:
        '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/j1dev/providers/Microsoft.EventGrid/topics/j1dev-event-grid-topic',
      inputSchema: 'EventGridSchema',
      location: 'eastus',
      metricResourceId: '20000000-0000-0000-0000-000000000000',
      name: 'j1dev-event-grid-topic',
      provisioningState: 'Succeeded',
      publicNetworkAccess: 'Enabled',
      tags: { environment: 'j1dev' },
      type: 'Microsoft.EventGrid/topics',
    };

    const topicEntity = createEventGridTopicEntity(webLinker, data);

    expect(topicEntity).toMatchSnapshot();
    expect(topicEntity).toMatchGraphObjectSchema({
      _class: ['Queue'],
      schema: {},
    });
  });
});
