import { RedisManagementClient } from '@azure/arm-rediscache';
import { RedisResource } from '@azure/arm-rediscache/esm/models';
import {
  Client,
  iterateAllResources,
  ListResourcesEndpoint,
} from '../../../azure/resource-manager/client';

export class RedisCacheClient extends Client {
  /**
   * Retrieves all Redis Caches for a Resource Group from an Azure Subscription
   * @param resourceGroupInfo An object containing information about the domain to retrieve like the Resource Group name belonging to an Azure Subscription
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
}
