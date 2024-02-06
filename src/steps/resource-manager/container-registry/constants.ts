import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createResourceGroupResourceRelationshipMetadata } from '../utils/createResourceGroupResourceRelationship';

export const STEP_RM_CONTAINER_REGISTRIES = 'rm-container-registries';
export const STEP_RM_CONTAINER_REGISTRIES_DIAGNOSTIC_SETTINGS =
  'rm-container-registries-diagnostic-settings';
export const STEP_RM_CONTAINER_REGISTRY_WEBHOOKS =
  'rm-container-registry-webhooks';

export const ContainerRegistryEntities = {
  REGISTRY: {
    _type: 'azure_container_registry',
    _class: ['DataStore'],
    resourceName: '[RM] Container Registry',
  },
  WEBHOOK: {
    _type: 'azure_container_registry_webhook',
    _class: ['ApplicationEndpoint'],
    resourceName: '[RM] Container Registry Webhook',
  },
};

export const ContainerRegistryRelationships = {
  RESOURCE_GROUP_HAS_ZONE: createResourceGroupResourceRelationshipMetadata(
    ContainerRegistryEntities.REGISTRY._type,
  ),
  REGISTRY_HAS_WEBHOOK: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      ContainerRegistryEntities.REGISTRY,
      ContainerRegistryEntities.WEBHOOK,
    ),
    sourceType: ContainerRegistryEntities.REGISTRY._type,
    _class: RelationshipClass.HAS,
    targetType: ContainerRegistryEntities.WEBHOOK._type,
  },
};
