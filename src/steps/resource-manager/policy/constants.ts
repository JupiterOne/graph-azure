import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { ANY_SCOPE } from '../constants';

export const PolicySteps = {
  POLICY_ASSIGNMENTS: 'rm-policy-assignments',
  POLICY_ASSIGNMENT_SCOPE_RELATIONSHIPS:
    'rm-policy-assignment-scope-relationships',
  POLICY_DEFINITIONS: 'rm-policy-definitions',
};

export const PolicyEntities = {
  POLICY_ASSIGNMENT: {
    _type: 'azure_policy_assignment',
    _class: ['ControlPolicy'],
    resourceName: '[RM] Policy Assignment',
  },
  POLICY_DEFINITION: {
    _type: 'azure_policy_definition',
    _class: ['Rule'],
    resourceName: '[RM] Policy Definition',
  },
  POLICY_SET_DEFINITION: {
    _type: 'azure_policy_set_definition',
    _class: ['Ruleset'],
    resourceName: '[RM] Policy Set Definition',
  },
};

export const PolicyRelationships = {
  /**
   * NOTE: Management Groups, Subscriptions, Resource Groups, and Resources can all have Policy Assignments
   * We currently don't ingest Management Groups, but we do ingest Subscriptions and Resource Groups
   * We've chosen, instead, to represent the relationship as ANY_SCOPE has a Policy Assignment.
   * This is because we want the relationship metadata to line up with the actual ingested relationships.
   * If we say that we expect ANY_SCOPE_had_policy_assignment and instead generate that a azure_storage_account_has_policy_assignment,
   * it might cause issues down the road.
   */
  ANY_RESOURCE_HAS_POLICY_ASSIGNMENT: {
    _type: 'azure_resource_has_policy_assignment',
    sourceType: ANY_SCOPE,
    _class: RelationshipClass.HAS,
    targetType: PolicyEntities.POLICY_ASSIGNMENT._type,
  },
  AZURE_POLICY_ASSIGNMENT_USES_POLICY_DEFINITION: {
    _type: 'azure_policy_assignment_uses_definition',
    sourceType: PolicyEntities.POLICY_ASSIGNMENT._type,
    _class: RelationshipClass.USES,
    targetType: PolicyEntities.POLICY_DEFINITION._type,
  },
  AZURE_POLICY_ASSIGNMENT_USES_POLICY_SET_DEFINITION: {
    _type: 'azure_policy_assignment_uses_set_definition',
    sourceType: PolicyEntities.POLICY_ASSIGNMENT._type,
    _class: RelationshipClass.USES,
    targetType: PolicyEntities.POLICY_SET_DEFINITION._type,
  },
  AZURE_POLICY_SET_DEFINITION_CONTAINS_DEFINITION: {
    _type: 'azure_policy_set_definition_contains_definition',
    sourceType: PolicyEntities.POLICY_SET_DEFINITION._type,
    _class: RelationshipClass.CONTAINS,
    targetType: PolicyEntities.POLICY_DEFINITION._type,
  },
};
