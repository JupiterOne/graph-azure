import {
  fetchResourceGroups,
  createSubscriptionResourceGroupRelationship,
} from '.';
import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import globalInstanceConfig from '../../../../test/integrationInstanceConfig';
import { IntegrationConfig } from '../../../types';
import { setupAzureRecording } from '../../../../test/helpers/recording';
import { Entity } from '@jupiterone/integration-sdk-core';
let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

describe('#createSubscriptionResourceGroupRelationship', () => {
  test('should return direct relationship when subscription exists in jobState', async () => {
    const subscriptionId = '/subscriptions/subscription-id';
    const subscriptionEntity: Entity = {
      _class: ['Account'],
      _type: 'azure_subscription',
      _key: subscriptionId,
    };

    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: globalInstanceConfig,
      entities: [subscriptionEntity],
    });

    const resourceGroupEntity: Entity = {
      _class: ['Group'],
      _type: 'azure_resource_group',
      _key: subscriptionId + '/resourceGroups/resource-group-id',
    };

    const result = await createSubscriptionResourceGroupRelationship(
      context,
      resourceGroupEntity,
    );

    expect(result).toEqual({
      _class: 'HAS',
      _fromEntityKey: '/subscriptions/subscription-id',
      _key:
        '/subscriptions/subscription-id|has|/subscriptions/subscription-id/resourceGroups/resource-group-id',
      _toEntityKey:
        '/subscriptions/subscription-id/resourceGroups/resource-group-id',
      _type: 'azure_subscription_has_resource_group',
      displayName: 'HAS',
    });
  });

  test('should throw when subscription does not exist in jobState', async () => {
    const subscriptionId = '/subscriptions/subscription-id';

    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: globalInstanceConfig,
      entities: [],
    });

    const resourceGroupEntity: Entity = {
      _class: ['Group'],
      _type: 'azure_resource_group',
      _key: subscriptionId + '/resourceGroups/resource-group-id',
    };

    const exec = async () =>
      await createSubscriptionResourceGroupRelationship(
        context,
        resourceGroupEntity,
      );

    await expect(exec).rejects.toThrow(
      'Could not find the subscription "/subscriptions/subscription-id" in this integration',
    );
  });

  test('should throw when subscription ID cannot be extracted from entity _key', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: globalInstanceConfig,
      entities: [],
    });

    const resourceGroupEntity: Entity = {
      _class: ['Group'],
      _type: 'azure_resource_group',
      _key: 'some-key-without-subscription-id',
    };

    const exec = async () =>
      await createSubscriptionResourceGroupRelationship(
        context,
        resourceGroupEntity,
      );

    await expect(exec).rejects.toThrow(
      'Could not identify a subscription ID in the resource group _key: some-key-without-subscription-id',
    );
  });
});

test('step - resource groups', async () => {
  const instanceConfig: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
    subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
  };

  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-resource-groups',
  });

  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig,
    entities: [
      {
        _class: ['Account'],
        _type: 'azure_subscription',
        _key: `/subscriptions/${instanceConfig.subscriptionId}`,
      },
    ],
  });

  context.jobState.getData = jest.fn().mockResolvedValue({
    defaultDomain: 'www.fake-domain.com',
  });

  await fetchResourceGroups(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: 'Group',
    schema: {
      additionalProperties: false,
      properties: {
        _type: { const: 'azure_resource_group' },
        _key: { type: 'string' },
        _class: { type: 'array', items: { const: 'Group' } },
        id: { type: 'string' },
        name: { type: 'string' },
        displayName: { type: 'string' },
        type: { const: 'Microsoft.Resources/resourceGroups' },
        location: { type: 'string' },
        managedBy: { type: 'string' },
        provisioningState: { type: 'string' },
        webLink: { type: 'string' },
        _rawData: { type: 'array', items: { type: 'object' } },
      },
    },
  });
  expect(context.jobState.collectedRelationships.length).toEqual(2);
  expect(context.jobState.collectedRelationships).toEqual([
    {
      _key:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7|has|/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/NetworkWatcherRG',
      _type: 'azure_subscription_has_resource_group',
      _class: 'HAS',
      _fromEntityKey: '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7',
      _toEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/NetworkWatcherRG',
      displayName: 'HAS',
    },
    {
      _key:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7|has|/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev',
      _type: 'azure_subscription_has_resource_group',
      _class: 'HAS',
      _fromEntityKey: '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7',
      _toEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev',
      displayName: 'HAS',
    },
  ]);
});
