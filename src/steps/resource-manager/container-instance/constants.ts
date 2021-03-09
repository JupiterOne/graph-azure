import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { entities as storageEntities } from '../storage';
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

  CONTAINER_VOLUME: {
    _type: 'azure_container_volume',
    _class: ['Disk'],
    resourceName: '[RM] Container Volume',
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

  CONTAINER_GROUP_HAS_CONTAINER_VOLUME: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      ContainerInstanceEntities.CONTAINER_GROUP,
      ContainerInstanceEntities.CONTAINER_VOLUME,
    ),
    sourceType: ContainerInstanceEntities.CONTAINER_GROUP._type,
    _class: RelationshipClass.HAS,
    targetType: ContainerInstanceEntities.CONTAINER_VOLUME._type,
  },

  CONTAINER_USES_CONTAINER_VOLUME: {
    _type: generateRelationshipType(
      RelationshipClass.USES,
      ContainerInstanceEntities.CONTAINER,
      ContainerInstanceEntities.CONTAINER_VOLUME,
    ),
    sourceType: ContainerInstanceEntities.CONTAINER._type,
    _class: RelationshipClass.USES,
    targetType: ContainerInstanceEntities.CONTAINER_VOLUME._type,
  },

  CONTAINER_VOLUME_USES_STORAGE_FILE_SHARE: {
    _type: generateRelationshipType(
      RelationshipClass.USES,
      ContainerInstanceEntities.CONTAINER_VOLUME,
      storageEntities.STORAGE_FILE_SHARE,
    ),
    sourceType: ContainerInstanceEntities.CONTAINER_VOLUME._type,
    _class: RelationshipClass.USES,
    targetType: storageEntities.STORAGE_FILE_SHARE._type,
  },
};
