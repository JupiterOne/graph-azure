import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createResourceGroupResourceRelationshipMetadata } from '../utils/createResourceGroupResourceRelationship';

export const STEP_RM_CONTAINER_GROUPS = 'rm-container-groups';

export const ContainerInstanceEntities = {
  CONTAINER_GROUP: {
    _type: 'azure_container_group',
    _class: ['Group'],
    resourceName: '[RM] Container Group',
  },

  CONTAINER: {
    _type: 'azure_container',
    _class: ['Container'],
    resourceName: '[RM] Container',
  },

  VOLUME: {
    _type: 'azure_volume',
    _class: ['Disk'],
    resourceName: '[RM] Volume',
  },
};

export const ContainerInstanceRelationships = {
  RESOURCE_GROUP_HAS_CONTAINER_GROUP: createResourceGroupResourceRelationshipMetadata(
    ContainerInstanceEntities.CONTAINER_GROUP._type,
  ),

  CONTAINER_GROUP_HAS_CONTAINER: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      ContainerInstanceEntities.CONTAINER_GROUP,
      ContainerInstanceEntities.CONTAINER,
    ),
    sourceType: ContainerInstanceEntities.CONTAINER_GROUP._type,
    _class: RelationshipClass.HAS,
    targetType: ContainerInstanceEntities.CONTAINER._type,
  },

  CONTAINER_GROUP_HAS_VOLUME: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      ContainerInstanceEntities.CONTAINER_GROUP,
      ContainerInstanceEntities.VOLUME,
    ),
    sourceType: ContainerInstanceEntities.CONTAINER_GROUP._type,
    _class: RelationshipClass.HAS,
    targetType: ContainerInstanceEntities.VOLUME._type,
  },

  CONTAINER_CONNECTS_VOLUME: {
    _type: generateRelationshipType(
      RelationshipClass.CONNECTS,
      ContainerInstanceEntities.CONTAINER,
      ContainerInstanceEntities.VOLUME,
    ),
    sourceType: ContainerInstanceEntities.CONTAINER._type,
    _class: RelationshipClass.CONNECTS,
    targetType: ContainerInstanceEntities.VOLUME._type,
  },
};
