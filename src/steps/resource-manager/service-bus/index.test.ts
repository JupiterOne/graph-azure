import {
  fetchServiceBusNamespaces,
  fetchServiceBusQueues,
  fetchServiceBusTopics,
  fetchServiceBusSubscriptions,
} from '.';
import { Recording } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig, IntegrationStepContext } from '../../../types';
import { setupAzureRecording } from '../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory/constants';
let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

test('step - service bus namespaces', async () => {
  const instanceConfig: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
    subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
  };

  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-service-bus-namespaces',
  });

  const context = createMockAzureStepExecutionContext({
    instanceConfig,
    entities: [
      {
        _key: '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev',
        _type: 'azure_resource_group',
        _class: ['Group'],
      },
    ],
    setData: {
      [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
    },
  });

  await fetchServiceBusNamespaces(context as IntegrationStepContext);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: ['Service'],
  });

  expect(context.jobState.collectedRelationships).toEqual([
    {
      _key: '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev|has|/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev',
      _type: 'azure_resource_group_has_service_bus_namespace',
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev',
      _toEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev',
      displayName: 'HAS',
    },
  ]);
});

test('step - service bus queues', async () => {
  const instanceConfig: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
    subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
  };

  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-service-bus-queues',
  });

  const context = createMockAzureStepExecutionContext({
    instanceConfig,
    entities: [
      {
        _key: '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev',
        _type: 'azure_service_bus_namespace',
        _class: ['Service'],
        id: '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev',
        name: 'ndowmon1j1dev',
      },
    ],
    setData: {
      [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
    },
  });

  await fetchServiceBusQueues(context as IntegrationStepContext);

  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: ['Queue'],
  });

  expect(context.jobState.collectedRelationships).toEqual([
    {
      _key: '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev|has|/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev/queues/j1dev-queue',
      _type: 'azure_service_bus_namespace_has_queue',
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev',
      _toEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev/queues/j1dev-queue',
      displayName: 'HAS',
    },
  ]);
});

test('step - service bus topics', async () => {
  const instanceConfig: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
    subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
  };

  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-service-bus-topics',
  });

  const context = createMockAzureStepExecutionContext({
    instanceConfig,
    entities: [
      {
        _key: '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev',
        _type: 'azure_service_bus_namespace',
        _class: ['Service'],
        id: '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev',
        name: 'ndowmon1j1dev',
      },
    ],
    setData: {
      [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
    },
  });

  await fetchServiceBusTopics(context as IntegrationStepContext);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: ['Queue'],
  });

  expect(context.jobState.collectedRelationships).toEqual([
    {
      _key: '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev|has|/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev/topics/j1dev-topic',
      _type: 'azure_service_bus_namespace_has_topic',
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev',
      _toEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev/topics/j1dev-topic',
      displayName: 'HAS',
    },
  ]);
});

test('step - service bus subscriptions', async () => {
  const instanceConfig: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
    subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
  };

  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-service-bus-subscriptions',
  });

  const context = createMockAzureStepExecutionContext({
    instanceConfig,
    entities: [
      {
        _key: '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev/topics/j1dev-topic|has|/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev/topics/j1dev-topic/subscriptions/j1dev-Microsoft.ServiceBus/Namespaces/Topics/Subscriptions',
        _type: 'azure_service_bus_topic',
        _class: ['Queue'],
        id: '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev/topics/j1dev-topic',
        name: 'j1dev-topic',
      },
    ],
    setData: {
      [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
    },
  });

  await fetchServiceBusSubscriptions(context as IntegrationStepContext);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: ['Subscription'],
  });

  expect(context.jobState.collectedRelationships).toEqual([
    {
      _key: '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev/topics/j1dev-topic|has|/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev/topics/j1dev-topic/subscriptions/j1dev-Microsoft.ServiceBus/Namespaces/Topics/Subscriptions|has|/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev/topics/j1dev-topic/subscriptions/j1dev',
      _type: 'azure_service_bus_topic_has_subscription',
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev/topics/j1dev-topic|has|/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev/topics/j1dev-topic/subscriptions/j1dev-Microsoft.ServiceBus/Namespaces/Topics/Subscriptions',
      _toEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ServiceBus/namespaces/ndowmon1j1dev/topics/j1dev-topic/subscriptions/j1dev',
      displayName: 'HAS',
    },
  ]);
});
