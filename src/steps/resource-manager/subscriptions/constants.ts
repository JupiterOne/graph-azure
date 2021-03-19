import {
  RelationshipClass,
  StepEntityMetadata,
} from '@jupiterone/integration-sdk-core';

// Fetch Resource Groups
export const STEP_RM_SUBSCRIPTIONS = 'rm-subscriptions';

export const steps = {
  LOCATIONS: 'rm-subscription-locations',
};

export const entities = {
  LOCATION: {
    _type: 'azure_location',
    _class: ['Site'],
    resourceName: '[RM] Location',
  },
};

export const SUBSCRIPTION_ENTITY_METADATA: StepEntityMetadata = {
  _type: 'azure_subscription',
  _class: ['Account'],
  resourceName: '[RM] Subscription',
};

export const relationships = {
  SUBSCRIPTION_USES_LOCATION: {
    _type: 'azure_subscription_uses_location',
    sourceType: SUBSCRIPTION_ENTITY_METADATA._type,
    _class: RelationshipClass.USES,
    targetType: entities.LOCATION._type,
  },
};
