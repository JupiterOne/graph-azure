import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { entities as subscriptionEntities } from '../subscriptions/constants';

export const SecuritySteps = {
  ASSESSMENTS: 'rm-security-assessments',
  SECURITY_CENTER_CONTACTS: 'rm-security-center-contacts',
  PRICING_CONFIGURATIONS: 'rm-security-center-pricing-configs',
};

export const SecurityEntities = {
  ASSESSMENT: {
    _type: 'azure_security_assessment',
    _class: ['Assessment'],
    resourceName: '[RM] Security Assessment',
  },
  SECURITY_CENTER_CONTACT: {
    _type: 'azure_security_center_contact',
    _class: ['Resource'],
    resourceName: '[RM] Security Contact',
  },
  SUBSCRIPTION_PRICING: {
    _type: 'azure_security_center_subscription_pricing',
    _class: ['Configuration'],
    resourceName: '[RM] Security Center Subscription Pricing',
  },
};

export const SecurityRelationships = {
  SUBSCRIPTION_PERFORMED_ASSESSMENT: {
    _type: 'azure_subscription_performed_security_assessment',
    sourceType: subscriptionEntities.SUBSCRIPTION._type,
    _class: RelationshipClass.PERFORMED,
    targetType: SecurityEntities.ASSESSMENT._type,
  },

  SUBSCRIPTION_HAS_SECURITY_CENTER_CONTACT: {
    _type: 'azure_subscription_has_security_center_contact',
    sourceType: subscriptionEntities.SUBSCRIPTION._type,
    _class: RelationshipClass.HAS,
    targetType: SecurityEntities.SECURITY_CENTER_CONTACT._type,
  },
  SUBSCRIPTION_HAS_PRICING_CONFIG: {
    _type: 'azure_subscription_has_security_center_subscription_pricing',
    sourceType: subscriptionEntities.SUBSCRIPTION._type,
    _class: RelationshipClass.HAS,
    targetType: SecurityEntities.SUBSCRIPTION_PRICING._type,
  },
};
