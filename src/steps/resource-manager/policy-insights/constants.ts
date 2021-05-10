import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { ANY_SCOPE } from '../constants';

export const PolicyInsightSteps = {
  SUBSCRIPTION_POLICY_STATES: 'rm-policy-states-for-subscription',
};

export const PolicyInsightEntities = {
  POLICY_STATE: {
    _type: 'azure_policy_state',
    _class: ['Review'],
    resourceName: '[RM] Policy State',
  },
};

export const PolicyRelationships = {
  ANY_SCOPE_HAS_POLICY_STATE: {
    _type: 'azure_scope_has_policy_state',
    sourceType: ANY_SCOPE,
    _class: RelationshipClass.HAS,
    targetType: PolicyInsightEntities.POLICY_STATE._type,
  },
};
