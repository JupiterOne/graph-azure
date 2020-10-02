import {
  Entity,
  Step,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { ACCOUNT_ENTITY_TYPE, STEP_AD_ACCOUNT } from '../../active-directory';
import { RedisCacheClient } from './client';
import { createAzureWebLinker } from '../../../azure';
import {
  RESOURCE_GROUP_ENTITY,
  STEP_RM_RESOURCES_RESOURCE_GROUPS,
} from '../resources';
import createResourceGroupResourceRelationship from '../utils/createResourceGroupResourceRelationship';
import {
  createRedisCacheEntity,
  createRedisFirewallRuleEntity,
  createRedisLinkedServerRelationshipProperties,
} from './converters';
import {
  RedisCacheEntities,
  RedisCacheRelationships,
  STEP_RM_REDIS_CACHES,
  STEP_RM_REDIS_FIREWALL_RULES,
  STEP_RM_REDIS_LINKED_SERVERS,
} from './constants';
import { resourceGroupName } from '../../../azure/utils';
import { RedisLinkedServerWithProperties } from '@azure/arm-rediscache/esm/models';
const SECONDARY_SERVER_ROLE = 'Secondary';
export * from './constants';

export async function fetchRedisCaches(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new RedisCacheClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: RESOURCE_GROUP_ENTITY._type },
    async (resourceGroupEntity) => {
      const { name } = resourceGroupEntity;
      await client.iterateCaches(
        { resourceGroupName: name as string },
        async (redisCache) => {
          const redisCacheEntity = createRedisCacheEntity(
            webLinker,
            redisCache,
          );
          await jobState.addEntity(redisCacheEntity);
          await jobState.addRelationship(
            await createResourceGroupResourceRelationship(
              executionContext,
              redisCacheEntity,
            ),
          );
        },
      );
    },
  );
}

export async function fetchRedisFirewallRules(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new RedisCacheClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: RedisCacheEntities.CACHE._type },
    async (redisCacheEntity) => {
      const { id, name } = redisCacheEntity;
      const resourceGroup = resourceGroupName(id, true)!;

      await client.iterateFirewallRules(
        { resourceGroupName: resourceGroup, redisCacheName: name as string },
        async (redisFirewallRule) => {
          const redisFirewallRuleEntity = createRedisFirewallRuleEntity(
            webLinker,
            redisFirewallRule,
          );
          await jobState.addEntity(redisFirewallRuleEntity);
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: redisCacheEntity,
              to: redisFirewallRuleEntity,
            }),
          );
        },
      );
    },
  );
}

const cacheIsLinkedToSecondaryCache = (
  linkedServer: RedisLinkedServerWithProperties,
): Boolean => linkedServer.serverRole === SECONDARY_SERVER_ROLE;

export async function fetchRedisLinkedServers(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new RedisCacheClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: RedisCacheEntities.CACHE._type },
    async (redisCacheEntity) => {
      const { id, name } = redisCacheEntity;
      const resourceGroup = resourceGroupName(id, true)!;

      await client.iterateLinkedServers(
        { resourceGroupName: resourceGroup, redisCacheName: name as string },
        async (linkedServer) => {
          const { linkedRedisCacheId } = linkedServer;
          if (cacheIsLinkedToSecondaryCache(linkedServer)) {
            const secondaryCacheEntity = await jobState.findEntity(
              linkedRedisCacheId,
            );

            if (secondaryCacheEntity) {
              await jobState.addRelationship(
                createDirectRelationship({
                  _class: RelationshipClass.CONNECTS,
                  from: redisCacheEntity,
                  to: secondaryCacheEntity,
                  properties: createRedisLinkedServerRelationshipProperties(
                    webLinker,
                    redisCacheEntity,
                    linkedServer,
                  ),
                }),
              );
            }
          }
        },
      );
    },
  );
}

export const redisCacheSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: STEP_RM_REDIS_CACHES,
    name: 'Redis Caches',
    entities: [RedisCacheEntities.CACHE],
    relationships: [RedisCacheRelationships.RESOURCE_GROUP_HAS_REDIS_CACHE],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchRedisCaches,
  },
  {
    id: STEP_RM_REDIS_FIREWALL_RULES,
    name: 'Redis Firewall Rules',
    entities: [RedisCacheEntities.FIREWALL_RULE],
    relationships: [RedisCacheRelationships.REDIS_CACHE_HAS_FIREWALL_RULE],
    dependsOn: [
      STEP_AD_ACCOUNT,
      STEP_RM_RESOURCES_RESOURCE_GROUPS,
      STEP_RM_REDIS_CACHES,
    ],
    executionHandler: fetchRedisFirewallRules,
  },
  {
    id: STEP_RM_REDIS_LINKED_SERVERS,
    name: 'Redis Linked Servers',
    entities: [],
    relationships: [
      RedisCacheRelationships.REDIS_CACHE_IS_LINKED_TO_REDIS_CACHE,
    ],
    dependsOn: [
      STEP_AD_ACCOUNT,
      STEP_RM_RESOURCES_RESOURCE_GROUPS,
      STEP_RM_REDIS_CACHES,
    ],
    executionHandler: fetchRedisLinkedServers,
  },
];
