// Use following commands to run the conditional access policy service steps
// yarn start --step 'fetch-conditional-access,fetch-conditional-access-template,fetch-conditional-access-policy,fetch-conditional-access-named-location,fetch-conditional-access-auth-context,build-conditional-access-has-conditional-access-policy-relationships,build-conditional-access-has-conditional-access-auth-context-relationships,build-conditional-access-has-conditional-access-template-relationships,build-conditional-access-policy-assigned-azure-ad-users-relationships,build-conditional-access-policy-assigned-azure-ad-groups-relationships,build-conditional-access-policy-contains-conditional-access-named-location-relationships' --no-cache

import {
  RelationshipClass,
  StepEntityMetadata,
  StepRelationshipMetadata,
} from '@jupiterone/integration-sdk-core';
import { GROUP_ENTITY_TYPE, USER_ENTITY_TYPE } from '../constants';

export const TIME_OUT = 100_000;

// Steps
export const ConditionalAccessSteps = {
  CONDITIONAL_ACCESS: 'fetch-conditional-access',
  CONDITIONAL_ACCESS_POLICY: 'fetch-conditional-access-policy',
  CONDITIONAL_ACCESS_TEMPLATE: 'fetch-conditional-access-template',
  CONDITIONAL_ACCESS_NAMED_LOCATION: 'fetch-conditional-access-named-location',
  CONDITIONAL_ACCESS_AUTH_CONTEXT: 'fetch-conditional-access-auth-context',
  CONDITIONAL_ACCESS_HAS_CONDITIONAL_ACCESS_POLICY:
    'build-conditional-access-has-conditional-access-policy-relationships',
  CONDITIONAL_ACCESS_HAS_CONDITIONAL_ACCESS_AUTH_CONTEXT:
    'build-conditional-access-has-conditional-access-auth-context-relationships',
  CONDITIONAL_ACCESS_HAS_CONDITIONAL_ACCESS_TEMPLATE:
    'build-conditional-access-has-conditional-access-template-relationships',
  CONDITIONAL_ACCESS_POLICY_CONTAINS_NAMED_LOCATION:
    'build-conditional-access-policy-contains-conditional-access-named-location-relationships',
  CONDITIONAL_ACCESS_POLICY_ASSIGNED_AD_USERS:
    'build-conditional-access-policy-assigned-azure-ad-users-relationships',
  CONDITIONAL_ACCESS_POLICY_ASSIGNED_AD_GROUPS:
    'build-conditional-access-policy-assigned-azure-ad-groups-relationships',
};

// entities
export const ConditionalAccessEntities: Record<
  | 'CONDITIONAL_ACCESS'
  | 'CONDITIONAL_ACCESS_POLICY'
  | 'CONDITIONAL_ACCESS_TEMPLATE'
  | 'CONDITIONAL_ACCESS_NAMED_LOCATION'
  | 'CONDITIONAL_ACCESS_AUTH_CONTEXT',
  StepEntityMetadata
> = {
  CONDITIONAL_ACCESS: {
    _type: 'azure_conditional_access_service',
    _class: ['Service'],
    resourceName: '[AD] Conditional Access',
  },
  CONDITIONAL_ACCESS_POLICY: {
    _type: 'azure_conditional_access_policy',
    _class: ['AccessPolicy'],
    resourceName: '[AD] Conditional Access Policy',
  },
  CONDITIONAL_ACCESS_TEMPLATE: {
    _type: 'azure_conditional_access_template',
    _class: ['AccessPolicy'],
    resourceName: '[AD] Conditional Access Template',
  },
  CONDITIONAL_ACCESS_NAMED_LOCATION: {
    _type: 'azure_conditional_access_named_location',
    _class: ['Network'],
    resourceName: '[AD] Conditional Access Named location',
    schema: {
      properties: {
        CIDR: { exclude: true },
        internal: { exclude: true },
        public: { exclude: true },
      },
    },
  },
  CONDITIONAL_ACCESS_AUTH_CONTEXT: {
    _type: 'azure_conditional_access_authorization_context',
    _class: ['Resource'],
    resourceName: '[AD] Conditional Access Authorization Context',
  },
};

// Relationships
export const ConditionalAccessRelationships: Record<
  | 'CONDITIONAL_ACCESS_HAS_CONDITIONAL_ACCESS_POLICY'
  | 'CONDITIONAL_ACCESS_HAS_CONDITIONAL_ACCESS_AUTH_CONTEXT'
  | 'CONDITIONAL_ACCESS_HAS_CONDITIONAL_ACCESS_TEMPLATE'
  | 'CONDITIONAL_ACCESS_POLICY_CONTAINS_NAMED_LOCATION'
  | 'CONDITIONAL_ACCESS_POLICY_ASSIGNED_AD_USERS'
  | 'CONDITIONAL_ACCESS_POLICY_ASSIGNED_AD_GROUPS',
  StepRelationshipMetadata
> = {
  CONDITIONAL_ACCESS_HAS_CONDITIONAL_ACCESS_POLICY: {
    _type: 'azure_conditional_access_service_has_policy',
    _class: RelationshipClass.HAS,
    sourceType: ConditionalAccessEntities.CONDITIONAL_ACCESS._type,
    targetType: ConditionalAccessEntities.CONDITIONAL_ACCESS_POLICY._type,
  },
  CONDITIONAL_ACCESS_HAS_CONDITIONAL_ACCESS_AUTH_CONTEXT: {
    _type: 'azure_conditional_access_service_has_authorization_context',
    _class: RelationshipClass.HAS,
    sourceType: ConditionalAccessEntities.CONDITIONAL_ACCESS._type,
    targetType: ConditionalAccessEntities.CONDITIONAL_ACCESS_AUTH_CONTEXT._type,
  },
  CONDITIONAL_ACCESS_HAS_CONDITIONAL_ACCESS_TEMPLATE: {
    _type: 'azure_conditional_access_service_has_template',
    _class: RelationshipClass.HAS,
    sourceType: ConditionalAccessEntities.CONDITIONAL_ACCESS._type,
    targetType: ConditionalAccessEntities.CONDITIONAL_ACCESS_TEMPLATE._type,
  },
  CONDITIONAL_ACCESS_POLICY_CONTAINS_NAMED_LOCATION: {
    _type: 'azure_conditional_access_policy_contains_named_location',
    _class: RelationshipClass.CONTAINS,
    sourceType: ConditionalAccessEntities.CONDITIONAL_ACCESS_POLICY._type,
    targetType:
      ConditionalAccessEntities.CONDITIONAL_ACCESS_NAMED_LOCATION._type,
  },
  CONDITIONAL_ACCESS_POLICY_ASSIGNED_AD_USERS: {
    _type: 'azure_conditional_access_policy_assigned_user',
    _class: RelationshipClass.ASSIGNED,
    sourceType: ConditionalAccessEntities.CONDITIONAL_ACCESS_POLICY._type,
    targetType: USER_ENTITY_TYPE,
  },
  CONDITIONAL_ACCESS_POLICY_ASSIGNED_AD_GROUPS: {
    _type: 'azure_conditional_access_policy_assigned_user_group',
    _class: RelationshipClass.ASSIGNED,
    sourceType: ConditionalAccessEntities.CONDITIONAL_ACCESS_POLICY._type,
    targetType: GROUP_ENTITY_TYPE,
  },
};
