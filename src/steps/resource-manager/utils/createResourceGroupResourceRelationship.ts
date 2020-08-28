import {
  Entity,
  StepExecutionContext,
  createDirectRelationship,
  createMappedRelationship,
  Relationship,
  RelationshipDirection,
  IntegrationError,
  RelationshipClass,
  StepRelationshipMetadata,
  generateRelationshipType,
  generateRelationshipKey,
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
): Promise<Relationship> {
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
    const relationshipMetadata = createResourceGroupResourceRelationshipMetadata(
      resourceEntity._type,
    );
    return createMappedRelationship({
      _key: generateRelationshipKey(
        relationshipMetadata._class,
        resourceGroupId,
        resourceEntity._key,
      ),
      _type: relationshipMetadata._type,
      _class: relationshipMetadata._class,
      relationshipDirection: RelationshipDirection.REVERSE,
      source: resourceEntity,
      target: {
        _type: RESOURCE_GROUP_ENTITY._type,
        _key: resourceGroupId,
      },
      targetFilterKeys: [['_type', '_key']],
    });
  }
}

export default createResourceGroupResourceRelationship;
