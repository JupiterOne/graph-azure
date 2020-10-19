import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { SUBSCRIPTION_ENTITY_METADATA } from '../subscriptions';

export const SecuritySteps = {
  ASSESSMENTS: 'rm-security-assessments',
};

export const SecurityEntities = {
  ASSESSMENT: {
    _type: 'azure_security_assessment',
    _class: ['Assessment'],
    resourceName: '[RM] Security Assessment',
  },
};

export const SecurityRelationships = {
  SUBSCRIPTION_PERFORMED_ASSESSMENT: {
    _type: 'azure_subscription_performed_security_assessment',
    sourceType: SUBSCRIPTION_ENTITY_METADATA._type,
    _class: RelationshipClass.PERFORMED,
    targetType: SecurityEntities.ASSESSMENT._type,
  },
};
