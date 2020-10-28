import {
  generateRelationshipType,
  RelationshipClass,
  // Entity
} from '@jupiterone/integration-sdk-core';
import { SUBSCRIPTION_ENTITY_METADATA } from '../subscriptions';
import { createResourceGroupResourceRelationshipMetadata } from '../utils/createResourceGroupResourceRelationship';

// TODO: Add a Step for getting Policy Definitions
// TODO: Add a Step for getting Policy Set Definitions

export const STEP_RM_POLICY_ASSIGNMENTS = 'rm-policy-assignments';

export const PolicyEntities = {
  POLICY_ASSIGNMENT: {
    _type: 'azure_policy_assignment',
    _class: ['ControlPolicy'],
    resourceName: '[RM] Policy Assignment',
  },
};

export const PolicyRelationships = {
  RESOURCE_GROUP_HAS_POLICY_ASSIGNMENT: createResourceGroupResourceRelationshipMetadata(
    PolicyEntities.POLICY_ASSIGNMENT._type,
  ),

  SUBSCRIPTION_HAS_POLICY_ASSIGNMENT: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      SUBSCRIPTION_ENTITY_METADATA._type,
      PolicyEntities.POLICY_ASSIGNMENT._type,
    ),
    sourceType: SUBSCRIPTION_ENTITY_METADATA._type,
    _class: RelationshipClass.HAS,
    targetType: PolicyEntities.POLICY_ASSIGNMENT._type,
  },

  // RESOURCE_HAS_POLICY_ASSIGNMENT: {
  //   _type: generateRelationshipType(
  //     RelationshipClass.HAS,
  //     Entity.,
  //     PolicyEntities.POLICY_ASSIGNMENT._type,
  //   ),
  //   sourceType: SUBSCRIPTION_ENTITY_METADATA._type,
  //   _class: RelationshipClass.HAS,
  //   targetType: PolicyEntities.POLICY_ASSIGNMENT._type,
  // },
};
