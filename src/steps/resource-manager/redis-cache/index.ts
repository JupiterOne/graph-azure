import {
  Entity,
  Step,
  IntegrationStepExecutionContext,
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
import { createRedisCacheEntity } from './converters';
import {
  RedisCacheEntities,
  RedisCacheRelationships,
  STEP_RM_REDIS_CACHES,
} from './constants';
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
];
