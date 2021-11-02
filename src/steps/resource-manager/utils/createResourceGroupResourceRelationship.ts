import {
  Entity,
  StepExecutionContext,
  createDirectRelationship,
  IntegrationError,
  RelationshipClass,
  StepRelationshipMetadata,
  generateRelationshipType,
} from '@jupiterone/integration-sdk-core';
import { RESOURCE_GROUP_ENTITY } from '../resources/constants';
import { getResourceGroupId } from './matchers';

export const RESOURCE_GROUP_RESOURCE_RELATIONSHIP_CLASS = RelationshipClass.HAS;

export function createResourceGroupResourceRelationshipMetadata(
  targetEntityType: string,
): StepRelationshipMetadata {
  return {
    _type: generateRelationshipType(
      RESOURCE_GROUP_RESOURCE_RELATIONSHIP_CLASS,
      RESOURCE_GROUP_ENTITY._type,
      targetEntityType,
    ),
    sourceType: RESOURCE_GROUP_ENTITY._type,
    _class: RESOURCE_GROUP_RESOURCE_RELATIONSHIP_CLASS,
    targetType: targetEntityType,
  };
}

export async function createResourceGroupResourceRelationship(
  executionContext: StepExecutionContext,
  resourceEntity: Entity,
): Promise<void> {
  const resourceGroupId = getResourceGroupId(resourceEntity._key);
  if (resourceGroupId === undefined) {
    throw new IntegrationError({
      message: `Could not identify a resource group ID in the entity _key: ${resourceEntity._key}`,
      code: 'UNMATCHED_RESOURCE_GROUP',
    });
  }
  const { jobState, logger } = executionContext;

  const resourceGroupEntity = await jobState.findEntity(resourceGroupId);
  if (resourceGroupEntity) {
    const relationship = createDirectRelationship({
      _class: RESOURCE_GROUP_RESOURCE_RELATIONSHIP_CLASS,
      from: resourceGroupEntity,
      to: resourceEntity,
    });
    await jobState.addRelationship(relationship);
  } else {
    logger.error(
      new IntegrationError({
        message: `Could not find the resource group "${resourceGroupId}" in this subscription.`,
        code: 'MISSING_RESOURCE_GROUP',
      }),
    );
  }
}

export default createResourceGroupResourceRelationship;
