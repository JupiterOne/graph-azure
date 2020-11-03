import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { SUBSCRIPTION_ENTITY_METADATA } from '../subscriptions/constants';

export const SecuritySteps = {
  ASSESSMENTS: 'rm-security-assessments',
  SECURITY_CONTACTS: 'rm-security-contacts',
};

export const SecurityEntities = {
  ASSESSMENT: {
    _type: 'azure_security_assessment',
    _class: ['Assessment'],
    resourceName: '[RM] Security Assessment',
  },
  SECURITY_CONTACT: {
    _type: 'azure_security_center_contact',
    _class: ['Resource'],
    resourceName: '[RM] Security Contact',
  },
};

export const SecurityRelationships = {
  SUBSCRIPTION_PERFORMED_ASSESSMENT: {
    _type: 'azure_subscription_performed_security_assessment',
    sourceType: SUBSCRIPTION_ENTITY_METADATA._type,
    _class: RelationshipClass.PERFORMED,
    targetType: SecurityEntities.ASSESSMENT._type,
  },

  SUBSCRIPTION_HAS_SECURITY_CONTACT: {
    _type: 'azure_subscription_has_security_center_contact',
    sourceType: SUBSCRIPTION_ENTITY_METADATA._type,
    _class: RelationshipClass.HAS,
    targetType: SecurityEntities.SECURITY_CONTACT._type,
  },
};
