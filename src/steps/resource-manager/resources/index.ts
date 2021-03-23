import {
  Entity,
  Step,
  IntegrationStepExecutionContext,
  ExplicitRelationship,
  createDirectRelationship,
  RelationshipClass,
  IntegrationError,
  StepRelationshipMetadata,
  generateRelationshipType,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { getAccountEntity, STEP_AD_ACCOUNT } from '../../active-directory';
import { ResourcesClient } from './client';
import {
  STEP_RM_RESOURCES_RESOURCE_GROUPS,
  RESOURCE_GROUP_ENTITY,
} from './constants';
import { createResourceGroupEntity } from './converters';
import { SUBSCRIPTION_MATCHER } from '../utils/matchers';
import {
  entities as subscriptionEntities,
  steps as subscriptionSteps,
} from '../subscriptions/constants';
export * from './constants';

const subscriptionRegex = new RegExp(SUBSCRIPTION_MATCHER);

const SUBSCRIPTION_RESOURCE_GROUP_RELATIONSHIP_CLASS = RelationshipClass.HAS;
const SUBSCRIPTION_RESOURCE_GROUP_RELATIONSHIP_METADATA: StepRelationshipMetadata = {
  _class: SUBSCRIPTION_RESOURCE_GROUP_RELATIONSHIP_CLASS,
  sourceType: subscriptionEntities.SUBSCRIPTION._type,
  _type: generateRelationshipType(
    SUBSCRIPTION_RESOURCE_GROUP_RELATIONSHIP_CLASS,
    subscriptionEntities.SUBSCRIPTION._type,
    RESOURCE_GROUP_ENTITY._type,
  ),
  targetType: RESOURCE_GROUP_ENTITY._type,
};

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

export const resourcesSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: STEP_RM_RESOURCES_RESOURCE_GROUPS,
    name: 'Resource Groups',
    entities: [RESOURCE_GROUP_ENTITY],
    relationships: [SUBSCRIPTION_RESOURCE_GROUP_RELATIONSHIP_METADATA],
    dependsOn: [STEP_AD_ACCOUNT, subscriptionSteps.SUBSCRIPTIONS],
    executionHandler: fetchResourceGroups,
  },
];
