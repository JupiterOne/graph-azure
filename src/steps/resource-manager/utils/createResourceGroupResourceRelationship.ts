import {
  Entity,
  StepExecutionContext,
  createDirectRelationship,
  IntegrationError,
  RelationshipClass,
  StepRelationshipMetadata,
  generateRelationshipType,
  ExplicitRelationship,
} from '@jupiterone/integration-sdk-core';
import { RESOURCE_GROUP_ENTITY } from '../resources';
import { RESOURCE_GROUP_MATCHER } from './matchers';

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

const resourceRegex = new RegExp(RESOURCE_GROUP_MATCHER);

export async function createResourceGroupResourceRelationship(
  executionContext: StepExecutionContext,
  resourceEntity: Entity,
): Promise<ExplicitRelationship> {
  const resourceGroupIdMatch = resourceEntity._key.match(resourceRegex);
  if (!resourceGroupIdMatch) {
    throw new IntegrationError({
      message: `Could not identify a resource group ID in the entity _key: ${resourceEntity._key}`,
      code: 'UNMATCHED_RESOURCE_GROUP',
    });
  }
  const { jobState } = executionContext;
  const resourceGroupId = resourceGroupIdMatch[0];

  const resourceGroupEntity = await jobState.findEntity(resourceGroupId);
  if (resourceGroupEntity) {
    return createDirectRelationship({
      _class: RESOURCE_GROUP_RESOURCE_RELATIONSHIP_CLASS,
      from: resourceGroupEntity,
      to: resourceEntity,
    });
  } else {
    throw new IntegrationError({
      message: `Could not find the resource group "${resourceGroupId}" in this subscription.`,
      code: 'MISSING_RESOURCE_GROUP',
    });
  }
}

export default createResourceGroupResourceRelationship;
