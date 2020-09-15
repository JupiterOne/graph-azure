import { createAzureWebLinker } from '../../../azure';
import {
  createServiceBusNamespaceEntity,
  createServiceBusQueueEntity,
  createServiceBusTopicEntity,
  createServiceBusSubscriptionEntity,
} from './converters';
import {
  SBNamespace,
  SBQueue,
  SBTopic,
  SBSubscription,
} from '@azure/arm-servicebus/esm/models';

const webLinker = createAzureWebLinker('something.onmicrosoft.com');

describe('createServiceBusNamespaceEntity', () => {
  test('properties transferred', () => {
    const data: SBNamespace = {
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev',
      name: 'ndowmon1j1dev',
      type: 'Microsoft.ServiceBus/Namespaces',
      location: 'East US',
      tags: {},
      sku: { name: 'Standard', tier: 'Standard' },
      provisioningState: 'Succeeded',
      createdAt: new Date('2020-09-15T19:29:34.723Z'),
      updatedAt: new Date('2020-09-15T19:30:18.757Z'),
      serviceBusEndpoint: 'https://ndowmon1j1dev.servicebus.windows.net:443/',
      metricId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7:ndowmon1j1dev',
    };

    expect(createServiceBusNamespaceEntity(webLinker, data)).toMatchSnapshot();
    expect(
      createServiceBusNamespaceEntity(webLinker, data),
    ).toMatchGraphObjectSchema({
      _class: ['Service'],
      schema: {},
    });
  });
});

describe('createServiceBusQueueEntity', () => {
  test('properties transferred', () => {
    // the following is returned from the API, but current SDK version doesn't recognize `location` as a property on `SBQueue`
    const data: SBQueue & { location: any } = {
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev/queues/j1dev-queue',
      name: 'j1dev-queue',
      type: 'Microsoft.ServiceBus/Namespaces/Queues',
      countDetails: {
        activeMessageCount: 0,
        deadLetterMessageCount: 0,
        scheduledMessageCount: 0,
        transferMessageCount: 0,
        transferDeadLetterMessageCount: 0,
      },
      createdAt: new Date('2020-09-15T19:34:09.849Z'),
      updatedAt: new Date('2020-09-15T19:34:09.849Z'),
      accessedAt: new Date('0001-01-01T00:00:00.000Z'),
      sizeInBytes: 0,
      messageCount: 0,
      lockDuration: 'PT1M',
      maxSizeInMegabytes: 10240,
      requiresDuplicateDetection: false,
      requiresSession: false,
      defaultMessageTimeToLive: 'P10675199DT2H48M5.4775807S',
      deadLetteringOnMessageExpiration: false,
      duplicateDetectionHistoryTimeWindow: 'PT10M',
      maxDeliveryCount: 10,
      status: 'Active',
      enableBatchedOperations: true,
      autoDeleteOnIdle: 'P10675199DT2H48M5.4775807S',
      enablePartitioning: false,
      enableExpress: false,
      location: 'East US',
    };

    expect(createServiceBusQueueEntity(webLinker, data)).toMatchSnapshot();
    expect(
      createServiceBusQueueEntity(webLinker, data),
    ).toMatchGraphObjectSchema({
      _class: ['Queue'],
      schema: {},
    });
  });
});

describe('createServiceBusTopicEntity', () => {
  test('properties transferred', () => {
    // the following is returned from the API, but current SDK version doesn't recognize `location` as a property on `SBTopic`
    const data: SBTopic & { location: any } = {
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev/topics/j1dev-topic',
      name: 'j1dev-topic',
      type: 'Microsoft.ServiceBus/Namespaces/Topics',
      sizeInBytes: 0,
      createdAt: new Date('2020-09-15T19:34:08.916Z'),
      updatedAt: new Date('2020-09-15T19:34:08.916Z'),
      accessedAt: new Date('0001-01-01T00:00:00.000Z'),
      subscriptionCount: 0,
      countDetails: {
        activeMessageCount: 0,
        deadLetterMessageCount: 0,
        scheduledMessageCount: 0,
        transferMessageCount: 0,
        transferDeadLetterMessageCount: 0,
      },
      defaultMessageTimeToLive: 'P10675199DT2H48M5.4775807S',
      maxSizeInMegabytes: 10240,
      requiresDuplicateDetection: false,
      duplicateDetectionHistoryTimeWindow: 'PT10M',
      enableBatchedOperations: false,
      status: 'Active',
      supportOrdering: false,
      autoDeleteOnIdle: 'P10675199DT2H48M5.4775807S',
      enablePartitioning: false,
      enableExpress: false,
      location: 'East US',
    };

    expect(createServiceBusTopicEntity(webLinker, data)).toMatchSnapshot();
    expect(
      createServiceBusTopicEntity(webLinker, data),
    ).toMatchGraphObjectSchema({
      _class: ['Queue'],
      schema: {},
    });
  });
});

describe('createServiceBusSubscriptionEntity', () => {
  test('properties transferred', () => {
    // the following is returned from the API, but current SDK version doesn't recognize `location` as a property on `SBSubscription`
    const data: SBSubscription & { location: any } = {
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev/topics/j1dev-topic/subscriptions/j1dev',
      name: 'j1dev',
      type: 'Microsoft.ServiceBus/Namespaces/Topics/Subscriptions',
      messageCount: 0,
      createdAt: new Date('2020-09-15T19:39:49.670Z'),
      accessedAt: new Date('2020-09-15T19:39:49.670Z'),
      updatedAt: new Date('2020-09-15T19:39:49.670Z'),
      countDetails: {
        activeMessageCount: 0,
        deadLetterMessageCount: 0,
        scheduledMessageCount: 0,
        transferMessageCount: 0,
        transferDeadLetterMessageCount: 0,
      },
      lockDuration: 'PT1M',
      requiresSession: false,
      defaultMessageTimeToLive: 'P10675199DT2H48M5.4775807S',
      deadLetteringOnFilterEvaluationExceptions: true,
      deadLetteringOnMessageExpiration: false,
      maxDeliveryCount: 1,
      status: 'Active',
      enableBatchedOperations: false,
      autoDeleteOnIdle: 'P10675199DT2H48M5.4775807S',
      location: 'East US',
    };

    expect(
      createServiceBusSubscriptionEntity(webLinker, data),
    ).toMatchSnapshot();
    expect(
      createServiceBusSubscriptionEntity(webLinker, data),
    ).toMatchGraphObjectSchema({
      _class: ['Subscription'],
      schema: {},
    });
  });
});
