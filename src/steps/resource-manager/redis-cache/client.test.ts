import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';
import {
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { IntegrationConfig } from '../../../types';
import { RedisCacheClient } from './client';
import { RedisResource } from '@azure/arm-rediscache/esm/models';

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
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateCaches',
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
