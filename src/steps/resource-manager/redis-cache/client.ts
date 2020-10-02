import { RedisManagementClient } from '@azure/arm-rediscache';
import {
  RedisResource,
  RedisFirewallRule,
  RedisLinkedServerWithProperties,
} from '@azure/arm-rediscache/esm/models';
import {
  Client,
  iterateAllResources,
  ListResourcesEndpoint,
} from '../../../azure/resource-manager/client';

export class RedisCacheClient extends Client {
  /**
   * Retrieves all Redis Caches in a Resource Group for an Azure Subscription
   * @param resourceGroupInfo An object containing information about the Resource Group that the Redis Cache is in. This information should contain the name of Resource Group.
   * @param callback  A callback function to be called after retrieving a Redis Cache
   */
  public async iterateCaches(
    resourceGroupInfo: { resourceGroupName: string },
    callback: (s: RedisResource) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      RedisManagementClient,
    );
    const { resourceGroupName } = resourceGroupInfo;
    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () =>
          serviceClient.redis.listByResourceGroup(resourceGroupName),
        listNext: serviceClient.redis.listByResourceGroupNext,
      } as ListResourcesEndpoint,
      resourceDescription: 'redisCache.cache',
      callback,
    });
  }

  /**
   * Retrieves all Redis Firewall Rules for a Redis Cache in a Resource Group for an Azure Subscription
   * @param redisCacheInfo An object containing information about the Redis Cache needed to retrieve the Redis Firewall Rules. This should include the Resource Group name that the Redis Cache belongs to and the name of the Redis Cache.
   * @param callback A callback function to be called after retrieving Redis Firewall Rules
   */
  public async iterateFirewallRules(
    redisCacheInfo: { resourceGroupName: string; redisCacheName: string },
    callback: (s: RedisFirewallRule) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      RedisManagementClient,
    );

    const { resourceGroupName, redisCacheName } = redisCacheInfo;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () =>
          serviceClient.firewallRules.listByRedisResource(
            resourceGroupName,
            redisCacheName,
          ),
        listNext: serviceClient.firewallRules.listByRedisResourceNext,
      } as ListResourcesEndpoint,
      resourceDescription: 'redisCache.firewallRule',
      callback,
    });
  }

  /**
   * Retrieves all Redis Linked Servers for a Redis Cache in a Resource Group for an Azure Subscription
   * @param redisCacheInfo An object containing information about the Redis Cache needed to retrieve the Redis Linked Server. This should include the Resource Group name that the Redis Cache belongs to and the name of the Redis Cache.
   * @param callback A callback function to be called after retrieving the Redis Linked Server
   */
  public async iterateLinkedServers(
    redisCacheInfo: { resourceGroupName: string; redisCacheName: string },
    callback: (s: RedisLinkedServerWithProperties) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      RedisManagementClient,
    );

    const { resourceGroupName, redisCacheName } = redisCacheInfo;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () =>
          serviceClient.linkedServer.list(resourceGroupName, redisCacheName),
        listNext: serviceClient.linkedServer.listNext,
      } as ListResourcesEndpoint,
      resourceDescription: 'redisCache.linkedServer',
      callback,
    });
  }
}
