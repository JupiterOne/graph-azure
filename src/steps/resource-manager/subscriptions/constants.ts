import { Entity, RelationshipClass } from '@jupiterone/integration-sdk-core';

export const steps = {
  SUBSCRIPTIONS: 'rm-subscriptions',
  LOCATIONS: 'rm-subscription-locations',
};

export const setDataKeys = {
  locationNameMap: 'DATA_LOCATION_NAME_MAP',
};

export type SetDataTypes = {
  locationNameMap: { [name: string]: Entity };
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
};

export const relationships = {
  SUBSCRIPTION_USES_LOCATION: {
    _type: 'azure_subscription_uses_location',
    sourceType: entities.SUBSCRIPTION._type,
    _class: RelationshipClass.USES,
    targetType: entities.LOCATION._type,
  },
};
