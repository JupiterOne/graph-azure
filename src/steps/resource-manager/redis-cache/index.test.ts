import {
  fetchRedisCaches,
  fetchRedisFirewallRules,
  fetchRedisLinkedServers,
} from '.';
import { Recording } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import { setupAzureRecording } from '../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';

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

test('step = redis caches', async () => {
  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-redis-caches',
  });

  const context = createMockAzureStepExecutionContext({
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
    setData: {
      [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
    },
  });

  await fetchRedisCaches(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: ['Database', 'DataStore', 'Cluster'],
    schema: {},
  });

  expect(context.jobState.collectedRelationships).toEqual([
    {
      _key:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev|has|/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.Cache/Redis/keionned-j1dev-redis-cache',
      _type: 'azure_resource_group_has_redis_cache',
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev',
      _toEntityKey:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.Cache/Redis/keionned-j1dev-redis-cache',
      displayName: 'HAS',
    },
  ]);
});

test('step = redis firewall rules', async () => {
  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-redis-firewall-rules',
  });

  const context = createMockAzureStepExecutionContext({
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
          '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.Cache/Redis/keionned-j1dev-redis-cache',
        id:
          '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.Cache/Redis/keionned-j1dev-redis-cache',
        _class: ['Database', 'DataStore', 'Cluster'],
        _type: 'azure_redis_cache',
        name: 'keionned-j1dev-redis-cache',
      },
    ],
    setData: {
      [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
    },
  });

  await fetchRedisFirewallRules(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: ['Firewall'],
    schema: {},
  });

  expect(context.jobState.collectedRelationships).toEqual([
    {
      _key:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.Cache/Redis/keionned-j1dev-redis-cache|has|/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.Cache/Redis/keionned-j1dev-redis-cache/firewallRules/j1dev_redis_cache_firewall_rule',
      _type: 'azure_redis_cache_has_firewall_rule',
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.Cache/Redis/keionned-j1dev-redis-cache',
      _toEntityKey:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.Cache/Redis/keionned-j1dev-redis-cache/firewallRules/j1dev_redis_cache_firewall_rule',
      displayName: 'HAS',
    },
  ]);
});

test('step = redis linked servers', async () => {
  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-redis-linked-servers',
  });

  const entities = [
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
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev-secondary-redis-cache-resource-group',
      _type: 'azure_resource_group',
      _class: ['Group'],
      name: 'j1dev-secondary-redis-cache-resource-group',
      id:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev-secondary-redis-cache-resource-group',
    },
    {
      _key:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.Cache/Redis/keionned-j1dev-redis-cache',
      id:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.Cache/Redis/keionned-j1dev-redis-cache',
      _class: ['Database', 'DataStore', 'Cluster'],
      _type: 'azure_redis_cache',
      name: 'keionned-j1dev-redis-cache',
    },
    {
      _key:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.Cache/Redis/keionned-j1dev-primary-redis-cache',
      id:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.Cache/Redis/keionned-j1dev-primary-redis-cache',
      _class: ['Database', 'DataStore', 'Cluster'],
      _type: 'azure_redis_cache',
      name: 'keionned-j1dev-primary-redis-cache',
    },
    {
      _key:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev-secondary-redis-cache-resource-group/providers/Microsoft.Cache/Redis/keionned-j1dev-secondary-redis-cache',
      id:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev-secondary-redis-cache-resource-group/providers/Microsoft.Cache/Redis/keionned-j1dev-secondary-redis-cache',
      _class: ['Database', 'DataStore', 'Cluster'],
      _type: 'azure_redis_cache',
      name: 'keionned-j1dev-secondary-redis-cache',
    },
  ];

  const context = createMockAzureStepExecutionContext({
    instanceConfig,
    entities,
    setData: {
      [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
    },
  });

  await fetchRedisLinkedServers(context);

  expect(context.jobState.collectedEntities.length).toBe(0);
  expect(context.jobState.collectedRelationships).toEqual([
    {
      _key:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.Cache/Redis/keionned-j1dev-primary-redis-cache|connects|/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev-secondary-redis-cache-resource-group/providers/Microsoft.Cache/Redis/keionned-j1dev-secondary-redis-cache',
      _type: 'azure_redis_cache_connects_cache',
      _class: 'CONNECTS',
      _fromEntityKey:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.Cache/Redis/keionned-j1dev-primary-redis-cache',
      _toEntityKey:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev-secondary-redis-cache-resource-group/providers/Microsoft.Cache/Redis/keionned-j1dev-secondary-redis-cache',
      displayName: 'CONNECTS',
      linkedServerId:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.Cache/Redis/keionned-j1dev-primary-redis-cache/linkedServers/keionned-j1dev-secondary-redis-cache',
      primaryCacheId:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.Cache/Redis/keionned-j1dev-primary-redis-cache',
      primaryCacheName: 'keionned-j1dev-primary-redis-cache',
      provisioningState: 'Succeeded',
      secondaryCacheId:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev-secondary-redis-cache-resource-group/providers/Microsoft.Cache/Redis/keionned-j1dev-secondary-redis-cache',
      secondaryCacheLocation: 'West US',
      secondaryCacheName: 'keionned-j1dev-secondary-redis-cache',
      type: 'Microsoft.Cache/Redis/linkedServers',
      webLink:
        'https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.Cache/Redis/keionned-j1dev-primary-redis-cache/linkedServers/keionned-j1dev-secondary-redis-cache',
    },
  ]);
});
