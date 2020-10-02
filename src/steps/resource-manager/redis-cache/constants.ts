import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createResourceGroupResourceRelationshipMetadata } from '../utils/createResourceGroupResourceRelationship';

export const STEP_RM_REDIS_CACHES = 'rm-redis-caches';
export const STEP_RM_REDIS_FIREWALL_RULES = 'rm-redis-firewall-rules';
export const STEP_RM_REDIS_LINKED_SERVERS = 'rm-redis-linked-servers';

export const RedisCacheEntities = {
  CACHE: {
    _type: 'azure_redis_cache',
    _class: ['Database', 'DataStore', 'Cluster'],
    resourceName: '[RM] Redis Cache',
  },

  FIREWALL_RULE: {
    _type: 'azure_firewall_rule',
    _class: ['Rule'],
    resourceName: '[RM] Redis Firewall Rule',
  },
};

export const RedisCacheRelationships = {
  RESOURCE_GROUP_HAS_REDIS_CACHE: createResourceGroupResourceRelationshipMetadata(
    RedisCacheEntities.CACHE._type,
  ),

  REDIS_CACHE_HAS_FIREWALL_RULE: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      RedisCacheEntities.CACHE,
      RedisCacheEntities.FIREWALL_RULE,
    ),
    sourceType: RedisCacheEntities.CACHE._type,
    _class: RelationshipClass.HAS,
    targetType: RedisCacheEntities.FIREWALL_RULE._type,
  },

  REDIS_CACHE_IS_LINKED_TO_REDIS_CACHE: {
    _type: generateRelationshipType(
      RelationshipClass.CONNECTS,
      RedisCacheEntities.CACHE._type,
      RedisCacheEntities.CACHE._type,
    ),
    sourceType: RedisCacheEntities.CACHE._type,
    _class: RelationshipClass.CONNECTS,
    targetType: RedisCacheEntities.CACHE._type,
  },
};
