import { createResourceGroupResourceRelationshipMetadata } from '../utils/createResourceGroupResourceRelationship';

export const STEP_RM_REDIS_CACHES = 'rm-redis-caches';

export const RedisCacheEntities = {
  CACHE: {
    _type: 'azure_redis_cache',
    _class: ['Database', 'DataStore', 'Cluster'],
    resourceName: '[RM] Redis Cache',
  },
};

export const RedisCacheRelationships = {
  RESOURCE_GROUP_HAS_REDIS_CACHE: createResourceGroupResourceRelationshipMetadata(
    RedisCacheEntities.CACHE._type,
  ),
};
