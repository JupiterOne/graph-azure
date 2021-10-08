import {
  Entity,
  Step,
  IntegrationStepExecutionContext,
  ExplicitRelationship,
  createDirectRelationship,
  RelationshipClass,
  IntegrationError,
  createMappedRelationship,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { getAccountEntity, STEP_AD_ACCOUNT } from '../../active-directory';
import { ResourcesClient } from './client';
import {
  STEP_RM_RESOURCES_RESOURCE_GROUPS,
  STEP_RM_RESOURCES_RESOURCE_LOCKS,
  RESOURCE_GROUP_ENTITY,
  RESOURCE_LOCK_ENTITY,
  STEP_RM_RESOURCES_RESOURCE_HAS_LOCK,
  SUBSCRIPTION_RESOURCE_GROUP_RELATIONSHIP_METADATA,
  relationships,
} from './constants';
import {
  createResourceGroupEntity,
  createResourceLockEntitiy,
} from './converters';
import { SUBSCRIPTION_MATCHER } from '../utils/matchers';
import { steps as subscriptionSteps } from '../subscriptions/constants';
import { getResourceManagerSteps } from '../../../getStepStartStates';
import { ANY_SCOPE } from '../constants';

const subscriptionRegex = new RegExp(SUBSCRIPTION_MATCHER);

export async function createSubscriptionResourceGroupRelationship(
  executionContext: IntegrationStepContext,
  resourceGroupEntity: Entity,
): Promise<ExplicitRelationship> {
  const subscriptionIdMatch = resourceGroupEntity._key.match(subscriptionRegex);
  if (!subscriptionIdMatch) {
    throw new IntegrationError({
      message: `Could not identify a subscription ID in the resource group _key: ${resourceGroupEntity._key}`,
      code: 'UNMATCHED_SUBSCRIPTION',
    });
  }
  const { jobState } = executionContext;
  const subscriptionId = subscriptionIdMatch[0];

  const subscriptionEntity = await jobState.findEntity(subscriptionId);
  if (subscriptionEntity) {
    return createDirectRelationship({
      _class: RelationshipClass.HAS,
      from: subscriptionEntity,
      to: resourceGroupEntity,
    });
  } else {
    throw new IntegrationError({
      message: `Could not find the subscription "${subscriptionId}" in this integration.`,
      code: 'MISSING_SUBSCRIPTION',
    });
  }
}

export async function fetchResourceGroups(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ResourcesClient(instance.config, logger);

  await client.iterateResourceGroups(async (resourceGroup) => {
    const resourceGroupEntity = createResourceGroupEntity(
      webLinker,
      resourceGroup,
    );
    await jobState.addEntity(resourceGroupEntity);
    await jobState.addRelationship(
      await createSubscriptionResourceGroupRelationship(
        executionContext,
        resourceGroupEntity,
      ),
    );
  });
}

export async function fetchResourceGroupLocks(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ResourcesClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: RESOURCE_GROUP_ENTITY._type },
    async (resourceGroupEntity) => {
      await client.iterateLocks(
        resourceGroupEntity.name as string,
        async (lock) => {
          const lockEntity = createResourceLockEntitiy(webLinker, lock);
          await jobState.addEntity(lockEntity);
        },
      );
    },
  );
}

export async function buildResourceHasResourceLockRelationships(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: RESOURCE_LOCK_ENTITY._type },
    async (resourceLockEntity) => {
      const targetEntityId = (resourceLockEntity.id as string).split(
        '/providers/Microsoft.Authorization',
      )[0];

      const targetEntity = await jobState.findEntity(targetEntityId);

      if (targetEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            from: targetEntity,
            _class: RelationshipClass.HAS,
            to: resourceLockEntity,
          }),
        );
        return;
      }

      await jobState.addRelationship(
        createMappedRelationship({
          _class: RelationshipClass.HAS,
          source: resourceLockEntity,
          targetFilterKeys: [['id']],
          target: {
            id: targetEntityId,
            _type: ANY_SCOPE,
            _key: targetEntityId,
          },
        }),
      );
    },
  );
}

export const resourcesSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: STEP_RM_RESOURCES_RESOURCE_GROUPS,
    name: 'Resource Groups',
    entities: [RESOURCE_GROUP_ENTITY],
    relationships: [SUBSCRIPTION_RESOURCE_GROUP_RELATIONSHIP_METADATA],
    dependsOn: [STEP_AD_ACCOUNT, subscriptionSteps.SUBSCRIPTION],
    executionHandler: fetchResourceGroups,
  },
  {
    id: STEP_RM_RESOURCES_RESOURCE_LOCKS,
    name: 'Resource Locks',
    entities: [RESOURCE_LOCK_ENTITY],
    relationships: [],
    dependsOn: [STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchResourceGroupLocks,
  },
  {
    id: STEP_RM_RESOURCES_RESOURCE_HAS_LOCK,
    name: 'Resource HAS Resource Lock Relationships',
    entities: [],
    relationships: [relationships.RESOURCE_LOCK_HAS_ANY_SCOPE],
    dependsOn: [
      STEP_RM_RESOURCES_RESOURCE_LOCKS,
      ...getResourceManagerSteps().executeFirstSteps,
    ],
    executionHandler: buildResourceHasResourceLockRelationships,
  },
];
