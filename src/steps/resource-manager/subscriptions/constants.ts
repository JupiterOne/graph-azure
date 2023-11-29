import {
  RelationshipClass,
  RelationshipDirection,
  StepMappedRelationshipMetadata,
} from '@jupiterone/integration-sdk-core';

export const steps = {
  SUBSCRIPTION: 'rm-subscription',
  SUBSCRIPTION_DIAGNOSTIC_SETTINGS: 'rm-subscription-diagnostic-settings',
  LOCATIONS: 'rm-subscription-locations',
  USAGE_DETAILS: 'rm-subscription-usage-details',
  ALL_SKIPPED_SUBSCRIPTIONS: 'rm-skipped-subscription',
};

export const setDataKeys = {
  locationNameMap: 'DATA_LOCATION_NAME_MAP',
};

export type SetDataTypes = {
  locationNameMap: {
    [name: string]: {
      _key: string;
      _type: string;
      _class: string[];
      id: string | undefined;
      name: string | undefined;
      displayName: string | undefined;
    };
  };
};

export const entities = {
  SUBSCRIPTION: {
    _type: 'azure_subscription',
    _class: ['Account'],
    resourceName: '[RM] Subscription',
    diagnosticLogCategories: ['Administrative', 'Alert', 'Policy', 'Security'],
  },
  LOCATION: {
    _type: 'azure_location',
    _class: ['Site'],
    resourceName: '[RM] Location',
  },
  USAGE: {
    _type: 'azure_usage_details',
    _class: ['Site'],
    resourceName: '[RM] Usage Details',
  },
};

export const relationships = {
  SUBSCRIPTION_USES_LOCATION: {
    _type: 'azure_subscription_uses_location',
    sourceType: entities.SUBSCRIPTION._type,
    _class: RelationshipClass.USES,
    targetType: entities.LOCATION._type,
  },
  SUBSCRIPTION_HAS_USAGE_DETAILS: {
    _type: 'azure_subscription_uses_usage_details',
    sourceType: entities.SUBSCRIPTION._type,
    _class: RelationshipClass.HAS,
    targetType: entities.USAGE._type,
  },
};

export const mappedRelationships: Record<
  'SUBSCRIPTION_USES_LOCATION',
  StepMappedRelationshipMetadata
> = {
  SUBSCRIPTION_USES_LOCATION: {
    _type: 'azure_subscription_uses_location',
    sourceType: entities.SUBSCRIPTION._type,
    _class: RelationshipClass.USES,
    targetType: entities.LOCATION._type,
    direction: RelationshipDirection.FORWARD,
  },
};
