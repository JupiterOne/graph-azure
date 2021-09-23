import {
  fetchResourceGroups,
  createSubscriptionResourceGroupRelationship,
  fetchResourceGroupLocks,
} from '.';
import { Recording } from '@jupiterone/integration-sdk-testing';
import globalInstanceConfig, {
  configFromEnv,
} from '../../../../test/integrationInstanceConfig';
import { IntegrationConfig } from '../../../types';
import { setupAzureRecording } from '../../../../test/helpers/recording';
import { Entity } from '@jupiterone/integration-sdk-core';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';
import { getMockAccountEntity } from '../../../../test/helpers/getMockEntity';
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

    const context = createMockAzureStepExecutionContext({
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

    const context = createMockAzureStepExecutionContext({
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
    const context = createMockAzureStepExecutionContext({
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
  const instanceConfig = {
    ...configFromEnv,
    directoryId: '19ae0f99-6fc6-444b-bd54-97504efc66ad',
    subscriptionId: '193f89dc-6225-4a80-bacb-96b32fbf6dd0',
  };

  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-groups',
  });

  const context = createMockAzureStepExecutionContext({
    instanceConfig,
    entities: [
      {
        _class: ['Account'],
        _type: 'azure_subscription',
        _key: `/subscriptions/${instanceConfig.subscriptionId}`,
      },
    ],
    setData: {
      [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
    },
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
  expect(context.jobState.collectedRelationships.length).toBeGreaterThan(0);
}, 10000);

test('step - resource group locks', async () => {
  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-resource-group-locks',
  });

  const instanceConfig: IntegrationConfig = {
    ...configFromEnv,
    directoryId: '19ae0f99-6fc6-444b-bd54-97504efc66ad',
    subscriptionId: '193f89dc-6225-4a80-bacb-96b32fbf6dd0',
  };

  const context = createMockAzureStepExecutionContext({
    instanceConfig,
    entities: [
      {
        _class: ['Account'],
        _type: 'azure_subscription',
        _key: `/subscriptions/${instanceConfig.subscriptionId}`,
      },
    ],
    setData: {
      [ACCOUNT_ENTITY_TYPE]: getMockAccountEntity(configFromEnv),
    },
  });

  await fetchResourceGroups(context);
  await fetchResourceGroupLocks(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(
    context.jobState.collectedEntities.filter(
      (item) => item._class === 'Group',
    ),
  ).toMatchGraphObjectSchema({
    _class: 'Rule',
    schema: {
      additionalProperties: false,
      properties: {
        _type: { const: 'azure_resource_group_lock' },
        _key: { type: 'string' },
        _class: { type: 'array', items: { const: 'Rule' } },
        id: { type: 'string' },
        name: { type: 'string' },
        displayName: { type: 'string' },
        type: { const: 'Microsoft.Resources/resourceGroups' },
        level: { type: 'string' },
        notes: { type: 'string' },
        webLink: { type: 'string' },
        _rawData: { type: 'array', items: { type: 'object' } },
      },
    },
  });
}, 100000);
