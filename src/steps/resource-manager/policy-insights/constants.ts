import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { PolicyEntities } from '../policy/constants';

export const PolicyInsightSteps = {
  SUBSCRIPTION_POLICY_STATES: 'rm-policy-states-for-subscription',
  POLICY_STATE_TO_ASSIGNMENT_RELATIONSHIPS:
    'rm-policy-state-to-policy-assignment-relationships',
  POLICY_STATE_TO_DEFINITION_RELATIONSHIPS:
    'rm-policy-state-to-policy-definition-relationships',
};

export const PolicyInsightEntities = {
  POLICY_STATE: {
    _type: 'azure_policy_state',
    _class: ['Review'],
    resourceName: '[RM] Policy State',
  },
};

export const PolicyInsightRelationships = {
  POLICY_ASSIGNMENT_HAS_POLICY_STATE: {
    _type: 'azure_policy_assignment_has_state',
    sourceType: PolicyEntities.POLICY_ASSIGNMENT._type,
    _class: RelationshipClass.HAS,
    targetType: PolicyInsightEntities.POLICY_STATE._type,
  },
  POLICY_DEFINITION_DEFINES_POLICY_STATE: {
    _type: 'azure_policy_definition_defines_state',
    sourceType: PolicyEntities.POLICY_DEFINITION._type,
    _class: RelationshipClass.DEFINES,
    targetType: PolicyInsightEntities.POLICY_STATE._type,
  },
};
