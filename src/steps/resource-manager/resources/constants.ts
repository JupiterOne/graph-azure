import {
  generateRelationshipType,
  RelationshipClass,
  StepEntityMetadata,
  StepRelationshipMetadata,
} from '@jupiterone/integration-sdk-core';
import { ANY_SCOPE } from '../constants';
import { entities as subscriptionEntities } from '../subscriptions/constants';

// Fetch Resource Groups
export const STEP_RM_RESOURCES_RESOURCE_GROUPS = 'rm-resources-resource-groups';
export const STEP_RM_RESOURCES_RESOURCE_LOCKS = 'rm-resources-resource-locks';
export const STEP_RM_RESOURCES_RESOURCE_HAS_LOCK =
  'rm-resources-resource-has-resource-lock-relationships';

export const RESOURCE_GROUP_ENTITY: StepEntityMetadata = {
  _type: 'azure_resource_group',
  _class: ['Group'],
  resourceName: '[RM] Resource Group',
};

const SUBSCRIPTION_RESOURCE_GROUP_RELATIONSHIP_CLASS = RelationshipClass.HAS;
export const SUBSCRIPTION_RESOURCE_GROUP_RELATIONSHIP_METADATA: StepRelationshipMetadata = {
  _class: SUBSCRIPTION_RESOURCE_GROUP_RELATIONSHIP_CLASS,
  sourceType: subscriptionEntities.SUBSCRIPTION._type,
  _type: generateRelationshipType(
    SUBSCRIPTION_RESOURCE_GROUP_RELATIONSHIP_CLASS,
    subscriptionEntities.SUBSCRIPTION._type,
    RESOURCE_GROUP_ENTITY._type,
  ),
  targetType: RESOURCE_GROUP_ENTITY._type,
};

export const RESOURCE_LOCK_ENTITY: StepEntityMetadata = {
  _type: 'azure_resource_lock',
  _class: ['Rule'],
  resourceName: '[RM] Resource Lock',
};

export const relationships = {
  RESOURCE_LOCK_HAS_ANY_SCOPE: {
    _type: 'azure_resource_lock_has_any_resource',
    sourceType: RESOURCE_LOCK_ENTITY._type,
    _class: RelationshipClass.HAS,
    targetType: ANY_SCOPE,
  },
};
