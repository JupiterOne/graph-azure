import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { ANY_SCOPE } from '../constants';

// TODO: Add a Step for getting Policy Definitions
// TODO: Add a Step for getting Policy Set Definitions

export const PolicySteps = {
  POLICY_ASSIGNMENTS: 'rm-policy-assignments',
};

export const PolicyEntities = {
  POLICY_ASSIGNMENT: {
    _type: 'azure_policy_assignment',
    _class: ['ControlPolicy'],
    resourceName: '[RM] Policy Assignment',
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
  ANY_RESOURCE_POLICY_ASSIGNMENT: {
    _type: 'ANY_SCOPE_has_policy_assignment',
    sourceType: ANY_SCOPE,
    _class: RelationshipClass.HAS,
    targetType: PolicyEntities.POLICY_ASSIGNMENT._type,
  },
};
