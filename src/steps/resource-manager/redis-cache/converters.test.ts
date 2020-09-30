import { createAzureWebLinker } from '../../../azure';
import { createRedisCacheEntity } from './converters';
import { RedisResource } from '@azure/arm-rediscache/esm/models';
const webLinker = createAzureWebLinker('something.onmicrosoft.com');

describe('createRedisCacheEntity', () => {
  test('properties transferred', () => {
    const data: RedisResource = {
      accessKeys: undefined,
      enableNonSslPort: false,
      hostName: 'keionned-j1dev-redis-cache.redis.cache.windows.net',
      id:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.Cache/Redis/keionned-j1dev-redis-cache',
      instances: [
        { isMaster: true, sslPort: 15000 },
        { isMaster: false, sslPort: 15001 },
      ],
      linkedServers: [],
      location: 'East US',
      minimumTlsVersion: '1.2',
      name: 'keionned-j1dev-redis-cache',
      port: 6379,
      provisioningState: 'Succeeded',
      redisConfiguration: {
        maxclients: '2000',
        'maxfragmentationmemory-reserved': '125',
        'maxmemory-delta': '100',
        'maxmemory-reserved': '100',
      },
      redisVersion: '4.0.14',
      sku: {
        capacity: 2,
        family: 'C',
        name: 'Standard',
      },
      sslPort: 6380,
      tags: {},
      type: 'Microsoft.Cache/Redis',
    };

    const redisCacheEntity = createRedisCacheEntity(webLinker, data);

    expect(redisCacheEntity).toMatchSnapshot();
    expect(redisCacheEntity).toMatchGraphObjectSchema({
      _class: ['Database', 'DataStore', 'Cluster'],
      schema: {},
    });
  });
});
