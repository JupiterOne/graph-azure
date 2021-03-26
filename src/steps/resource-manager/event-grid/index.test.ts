import {
  fetchEventGridDomains,
  fetchEventGridDomainTopics,
  fetchEventGridDomainTopicSubscriptions,
  fetchEventGridTopics,
  fetchEventGridTopicSubscriptions,
} from '.';

import {
  MockIntegrationStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';

import { IntegrationConfig } from '../../../types';
import { setupAzureRecording } from '../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';
import { EventGridEntities } from './constants';

let recording: Recording;
let context: MockIntegrationStepExecutionContext<IntegrationConfig>;
let instanceConfig: IntegrationConfig;

describe('step = event grid domains', () => {
  beforeAll(async () => {
    instanceConfig = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: '4a17becb-fb42-4633-b5c8-5ab66f28d195',
      subscriptionId: '87f62f44-9dad-4284-a08f-f2fb3d8b528a',
      developerId: 'keionned',
    };

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'resource-manager-step-event-grid-domains',
    });

    context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [
        {
          _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
          _type: 'azure_resource_group',
          _class: ['Group'],
          name: 'j1dev',
          id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
        },
      ],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
      },
    });

    await fetchEventGridDomains(context);
  });

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should collect an Azure Event Grid Domain entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain`,
        _class: EventGridEntities.DOMAIN._class,
        _type: EventGridEntities.DOMAIN._type,
        category: ['infrastructure'],
        displayName: 'j1dev-event-grid-domain',
        endpoint:
          'https://j1dev-event-grid-domain.eastus-1.eventgrid.azure.net/api/events',
        inputSchema: 'EventGridSchema',
        location: 'eastus',
        name: 'j1dev-event-grid-domain',
        metricResourceId: expect.any(String),
        provisioningState: 'Succeeded',
        publicNetworkAccess: 'Enabled',
        'tag.environment': 'j1dev',
        type: 'Microsoft.EventGrid/domains',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain`,
      }),
    );
  });

  it('should collect an Azure Resource Group has Azure Event Grid Domain relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual(
      expect.objectContaining({
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain`,
        _type: 'azure_resource_group_has_event_grid_domain',
        _class: 'HAS',
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain`,
        displayName: 'HAS',
      }),
    );
  });
});

describe('step = event grid domain topics', () => {
  beforeAll(async () => {
    instanceConfig = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: '4a17becb-fb42-4633-b5c8-5ab66f28d195',
      subscriptionId: '87f62f44-9dad-4284-a08f-f2fb3d8b528a',
    };

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'resource-manager-step-event-grid-domain-topics',
    });

    context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [
        {
          _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
          _type: 'azure_resource_group',
          _class: ['Group'],
          name: 'j1dev',
          id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
        },

        {
          _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain`,
          _type: 'azure_event_grid_domain',
          _class: ['Service'],
          name: 'j1dev-event-grid-domain',
          id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain`,
        },
      ],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
      },
    });

    await fetchEventGridDomainTopics(context);
  });

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should collect an Azure Event Grid Domain Topic entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain/topics/j1dev-event-grid-domain-topic`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain/topics/j1dev-event-grid-domain-topic`,
        _class: EventGridEntities.DOMAIN_TOPIC._class,
        _type: EventGridEntities.DOMAIN_TOPIC._type,
        displayName: 'j1dev-event-grid-domain-topic',
        name: 'j1dev-event-grid-domain-topic',
        provisioningState: 'Succeeded',
        type: 'Microsoft.EventGrid/domains/topics',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain/topics/j1dev-event-grid-domain-topic`,
      }),
    );
  });

  it('should collect an Azure Event Grid Domain has Azure Event Grid Domain Topic relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual(
      expect.objectContaining({
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain/topics/j1dev-event-grid-domain-topic`,
        _type: 'azure_event_grid_domain_has_topic',
        _class: 'HAS',
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain/topics/j1dev-event-grid-domain-topic`,
        displayName: 'HAS',
      }),
    );
  });
});

describe('step = event grid domain topic subscriptions', () => {
  beforeAll(async () => {
    instanceConfig = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: '4a17becb-fb42-4633-b5c8-5ab66f28d195',
      subscriptionId: '87f62f44-9dad-4284-a08f-f2fb3d8b528a',
    };

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'resource-manager-step-event-grid-domain-topic-subscriptions',
    });

    context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [
        {
          _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
          _type: 'azure_resource_group',
          _class: ['Group'],
          name: 'j1dev',
          id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
        },

        {
          _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain/topics/j1dev-event-grid-domain-topic/`,
          _type: 'azure_event_grid_domain_topic',
          _class: ['Queue'],
          name: 'j1dev-event-grid-domain-topic',
          id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain/topics/j1dev-event-grid-domain-topic/`,
          type: 'Microsoft.EventGrid/domains/topics',
        },
      ],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
      },
    });

    await fetchEventGridDomainTopicSubscriptions(context);
  });

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should collect an Azure Event Grid Domain Topic Subscription entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain/topics/j1dev-event-grid-domain-topic/providers/Microsoft.EventGrid/eventSubscriptions/j1dev-event-grid-domain-topic-subscription`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain/topics/j1dev-event-grid-domain-topic/providers/Microsoft.EventGrid/eventSubscriptions/j1dev-event-grid-domain-topic-subscription`,
        _class: EventGridEntities.TOPIC_SUBSCRIPTION._class,
        _type: EventGridEntities.TOPIC_SUBSCRIPTION._type,
      }),
    );
  });

  it('should collect an Azure Event Grid Domain Topic has Azure Event Grid Domain Topic Subscription relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual(
      expect.objectContaining({
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain/topics/j1dev-event-grid-domain-topic/|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain/topics/j1dev-event-grid-domain-topic/providers/Microsoft.EventGrid/eventSubscriptions/j1dev-event-grid-domain-topic-subscription`,
        _type: 'azure_event_grid_domain_topic_has_topic_subscription',
        _class: 'HAS',
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain/topics/j1dev-event-grid-domain-topic/`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/j1dev-event-grid-domain/topics/j1dev-event-grid-domain-topic/providers/Microsoft.EventGrid/eventSubscriptions/j1dev-event-grid-domain-topic-subscription`,
        displayName: 'HAS',
      }),
    );
  });
});

describe('step = event grid topics', () => {
  beforeAll(async () => {
    instanceConfig = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: '4a17becb-fb42-4633-b5c8-5ab66f28d195',
      subscriptionId: '87f62f44-9dad-4284-a08f-f2fb3d8b528a',
      developerId: 'keionned',
    };

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'resource-manager-step-event-grid-topics',
    });

    context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [
        {
          _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
          _type: 'azure_resource_group',
          _class: ['Group'],
          name: 'j1dev',
          id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
        },
      ],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
      },
    });

    await fetchEventGridTopics(context);
  });

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should collect an Azure Event Grid Topic entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/topics/j1dev-event-grid-topic`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/topics/j1dev-event-grid-topic`,
        _class: EventGridEntities.TOPIC._class,
        _type: EventGridEntities.TOPIC._type,
        displayName: 'j1dev-event-grid-topic',
        endpoint:
          'https://j1dev-event-grid-topic.eastus-1.eventgrid.azure.net/api/events',
        inputSchema: 'EventGridSchema',
        metricResourceId: expect.any(String),
        location: 'eastus',
        name: 'j1dev-event-grid-topic',
        provisioningState: 'Succeeded',
        publicNetworkAccess: 'Enabled',
        'tag.environment': 'j1dev',
        type: 'Microsoft.EventGrid/topics',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/topics/j1dev-event-grid-topic`,
      }),
    );
  });

  it('should collect an Azure Resource Group has an Azure Event Grid Topic relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual(
      expect.objectContaining({
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/topics/j1dev-event-grid-topic`,
        _type: 'azure_resource_group_has_event_grid_topic',
        _class: 'HAS',
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/topics/j1dev-event-grid-topic`,
        displayName: 'HAS',
      }),
    );
  });
});

describe('step = event grid topic subscriptions', () => {
  beforeAll(async () => {
    instanceConfig = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: '4a17becb-fb42-4633-b5c8-5ab66f28d195',
      subscriptionId: '87f62f44-9dad-4284-a08f-f2fb3d8b528a',
      developerId: 'keionned',
    };

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'resource-manager-step-event-grid-topic-subscriptions',
    });

    context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [
        {
          _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
          _type: 'azure_resource_group',
          _class: ['Group'],
          name: 'j1dev',
          id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
        },

        {
          _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/topics/j1dev-event-grid-topic`,
          _type: 'azure_event_grid_topic',
          _class: ['Queue'],
          name: 'j1dev-event-grid-topic',
          id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/topics/j1dev-event-grid-topic`,
          type: 'Microsoft.EventGrid/topics',
        },
      ],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
      },
    });

    await fetchEventGridTopicSubscriptions(context);
  });

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should collect an Azure Event Grid Topic Subscription entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/topics/j1dev-event-grid-topic/providers/Microsoft.EventGrid/eventSubscriptions/j1dev-event-grid-event-subscription`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/topics/j1dev-event-grid-topic/providers/Microsoft.EventGrid/eventSubscriptions/j1dev-event-grid-event-subscription`,
        _type: EventGridEntities.TOPIC_SUBSCRIPTION._type,
        _class: EventGridEntities.TOPIC_SUBSCRIPTION._class,
        displayName: 'j1dev-event-grid-event-subscription',
        eventDeliverySchema: 'EventGridSchema',
        name: 'j1dev-event-grid-event-subscription',
        provisioningState: 'Succeeded',
        topic: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/microsoft.eventgrid/topics/j1dev-event-grid-topic`,
        type: 'Microsoft.EventGrid/eventSubscriptions',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/topics/j1dev-event-grid-topic/providers/Microsoft.EventGrid/eventSubscriptions/j1dev-event-grid-event-subscription`,
      }),
    );
  });

  it('should collect an Azure Event Grid Topic has an Azure Event Grid Topic Subscription relationships', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual(
      expect.objectContaining({
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/topics/j1dev-event-grid-topic|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/topics/j1dev-event-grid-topic/providers/Microsoft.EventGrid/eventSubscriptions/j1dev-event-grid-event-subscription`,
        _type: 'azure_event_grid_topic_has_subscription',
        _class: 'HAS',
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/topics/j1dev-event-grid-topic`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.EventGrid/topics/j1dev-event-grid-topic/providers/Microsoft.EventGrid/eventSubscriptions/j1dev-event-grid-event-subscription`,
        displayName: 'HAS',
      }),
    );
  });
});
