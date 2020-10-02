import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';
import {
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { IntegrationConfig } from '../../../types';
import { RedisCacheClient } from './client';
import {
  RedisFirewallRule,
  RedisLinkedServerProperties,
  RedisResource,
} from '@azure/arm-rediscache/esm/models';

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

describe('iterate caches', () => {
  test('j1dev - resource group', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateCaches-j1dev',
    });

    const client = new RedisCacheClient(
      config,
      createMockIntegrationLogger(),
      true,
    );
    const resources: RedisResource[] = [];
    const resourceGroupInfo = {
      resourceGroupName: 'j1dev',
    };

    await client.iterateCaches(resourceGroupInfo, (e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        accessKeys: null,
        enableNonSslPort: expect.any(Boolean),
        hostName: 'keionned-j1dev-redis-cache.redis.cache.windows.net',
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/${resourceGroupInfo.resourceGroupName}/providers/Microsoft.Cache/Redis/keionned-j1dev-redis-cache`,
        instances: [
          { isMaster: expect.any(Boolean), sslPort: expect.any(Number) },
          { isMaster: expect.any(Boolean), sslPort: expect.any(Number) },
        ],
        linkedServers: [],
        location: 'East US',
        minimumTlsVersion: expect.any(String),
        name: 'keionned-j1dev-redis-cache',
        port: expect.any(Number),
        provisioningState: 'Succeeded',
        redisConfiguration: {
          maxclients: expect.any(String),
          'maxfragmentationmemory-reserved': expect.any(String),
          'maxmemory-delta': expect.any(String),
          'maxmemory-reserved': expect.any(String),
          'maxmemory-policy': expect.any(String),
        },
        redisVersion: expect.any(String),
        sku: {
          capacity: expect.any(Number),
          family: expect.any(String),
          name: expect.any(String),
        },
        sslPort: expect.any(Number),
        tags: {},
        type: 'Microsoft.Cache/Redis',
      }),
    );

    expect(resources).toContainEqual(
      expect.objectContaining({
        accessKeys: null,
        enableNonSslPort: expect.any(Boolean),
        hostName: 'keionned-j1dev-primary-redis-cache.redis.cache.windows.net',
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/${resourceGroupInfo.resourceGroupName}/providers/Microsoft.Cache/Redis/keionned-j1dev-primary-redis-cache`,
        instances: [
          { isMaster: expect.any(Boolean), sslPort: expect.any(Number) },
          { isMaster: expect.any(Boolean), sslPort: expect.any(Number) },
        ],
        linkedServers: [
          {
            id: `/subscriptions/${config.subscriptionId}/resourceGroups/${resourceGroupInfo.resourceGroupName}/providers/Microsoft.Cache/Redis/keionned-j1dev-primary-redis-cache/linkedServers/keionned-j1dev-secondary-redis-cache`,
          },
        ],
        location: 'East US',
        minimumTlsVersion: expect.any(String),
        name: 'keionned-j1dev-primary-redis-cache',
        port: expect.any(Number),
        provisioningState: 'Succeeded',
        redisConfiguration: {
          maxclients: expect.any(String),
          'maxfragmentationmemory-reserved': expect.any(String),
          'maxmemory-delta': expect.any(String),
          'maxmemory-reserved': expect.any(String),
          'maxmemory-policy': expect.any(String),
        },
        redisVersion: expect.any(String),
        sku: {
          capacity: expect.any(Number),
          family: expect.any(String),
          name: expect.any(String),
        },
        sslPort: expect.any(Number),
        tags: {},
        type: 'Microsoft.Cache/Redis',
      }),
    );
  });

  test('j1dev-secondary-redis-cache-resource-group - resource group', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateCaches-j1dev-secondary-redis-cache-resource-group',
    });

    const client = new RedisCacheClient(
      config,
      createMockIntegrationLogger(),
      true,
    );
    const resources: RedisResource[] = [];
    const resourceGroupInfo = {
      resourceGroupName: 'j1dev-secondary-redis-cache-resource-group',
    };

    await client.iterateCaches(resourceGroupInfo, (e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        accessKeys: null,
        enableNonSslPort: expect.any(Boolean),
        hostName:
          'keionned-j1dev-secondary-redis-cache.redis.cache.windows.net',
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/${resourceGroupInfo.resourceGroupName}/providers/Microsoft.Cache/Redis/keionned-j1dev-secondary-redis-cache`,
        instances: [
          { isMaster: expect.any(Boolean), sslPort: expect.any(Number) },
          { isMaster: expect.any(Boolean), sslPort: expect.any(Number) },
        ],
        linkedServers: [
          {
            id: `/subscriptions/${config.subscriptionId}/resourceGroups/${resourceGroupInfo.resourceGroupName}/providers/Microsoft.Cache/Redis/keionned-j1dev-secondary-redis-cache/linkedServers/keionned-j1dev-primary-redis-cache`,
          },
        ],
        location: 'West US',
        minimumTlsVersion: expect.any(String),
        name: 'keionned-j1dev-secondary-redis-cache',
        port: expect.any(Number),
        provisioningState: 'Succeeded',
        redisConfiguration: {
          maxclients: expect.any(String),
          'maxfragmentationmemory-reserved': expect.any(String),
          'maxmemory-delta': expect.any(String),
          'maxmemory-reserved': expect.any(String),
          'maxmemory-policy': expect.any(String),
        },
        redisVersion: expect.any(String),
        sku: {
          capacity: expect.any(Number),
          family: expect.any(String),
          name: expect.any(String),
        },
        sslPort: expect.any(Number),
        tags: {},
        type: 'Microsoft.Cache/Redis',
      }),
    );
  });
});

describe('iterate firewall rules', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateFirewallRules',
    });

    const client = new RedisCacheClient(
      config,
      createMockIntegrationLogger(),
      true,
    );
    const resources: RedisFirewallRule[] = [];
    const redisCacheInfo = {
      resourceGroupName: 'j1dev',
      redisCacheName: 'keionned-j1dev-redis-cache',
    };

    await client.iterateFirewallRules(redisCacheInfo, (e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/${redisCacheInfo.resourceGroupName}/providers/Microsoft.Cache/Redis/keionned-j1dev-redis-cache/firewallRules/j1dev_redis_cache_firewall_rule`,
        name: 'keionned-j1dev-redis-cache/j1dev_redis_cache_firewall_rule',
        startIP: '1.2.3.4',
        endIP: '2.3.4.5',
        type: 'Microsoft.Cache/Redis/firewallRules',
      }),
    );
  });
});

describe('iterate linked servers', () => {
  test('j1dev - resource group', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateLinkedServers-j1dev',
    });

    const client = new RedisCacheClient(
      config,
      createMockIntegrationLogger(),
      true,
    );
    const resources: RedisLinkedServerProperties[] = [];
    const redisCacheInfo = {
      resourceGroupName: 'j1dev',
      redisCacheName: 'keionned-j1dev-primary-redis-cache',
    };

    await client.iterateLinkedServers(redisCacheInfo, (e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/${redisCacheInfo.resourceGroupName}/providers/Microsoft.Cache/Redis/keionned-j1dev-primary-redis-cache/linkedServers/keionned-j1dev-secondary-redis-cache`,
        name: 'keionned-j1dev-secondary-redis-cache',
        linkedRedisCacheId:
          '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev-secondary-redis-cache-resource-group/providers/Microsoft.Cache/Redis/keionned-j1dev-secondary-redis-cache',
        linkedRedisCacheLocation: 'West US',
        provisioningState: 'Succeeded',
        serverRole: 'Secondary',
        type: 'Microsoft.Cache/Redis/linkedServers',
      }),
    );
  });

  test('j1dev-secondary-redis-cache-resource-group - resource group', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateLinkedServers-j1dev-secondary-redis-cache-resource-group',
    });

    const client = new RedisCacheClient(
      config,
      createMockIntegrationLogger(),
      true,
    );
    const resources: RedisLinkedServerProperties[] = [];
    const redisCacheInfo = {
      resourceGroupName: 'j1dev-secondary-redis-cache-resource-group',
      redisCacheName: 'keionned-j1dev-secondary-redis-cache',
    };

    await client.iterateLinkedServers(redisCacheInfo, (e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/${redisCacheInfo.resourceGroupName}/providers/Microsoft.Cache/Redis/keionned-j1dev-secondary-redis-cache/linkedServers/keionned-j1dev-primary-redis-cache`,
        name: 'keionned-j1dev-primary-redis-cache',
        linkedRedisCacheId: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Cache/Redis/keionned-j1dev-primary-redis-cache`,
        linkedRedisCacheLocation: 'East US',
        provisioningState: 'Succeeded',
        serverRole: 'Primary',
        type: 'Microsoft.Cache/Redis/linkedServers',
      }),
    );
  });
});
