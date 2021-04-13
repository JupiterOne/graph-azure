import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { entities as subscriptionEntities } from '../subscriptions/constants';

export const SecuritySteps = {
  ASSESSMENTS: 'rm-security-assessments',
  SECURITY_CENTER_CONTACTS: 'rm-security-center-contacts',
  PRICING_CONFIGURATIONS: 'rm-security-center-pricing-configs',
  SETTINGS: 'rm-security-center-settings',
  AUTO_PROVISIONING_SETTINGS: 'rm-security-center-auto-provisioning-settings',
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
  SETTING: {
    _type: 'azure_security_center_setting',
    _class: ['Configuration'],
    resourceName: '[RM] Security Center Setting',
    schema: {
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        type: { type: 'string' },
        kind: { type: 'string' },
        enabled: { type: 'boolean' },
      },
      required: ['id', 'name', 'type', 'kind', 'enabled'],
    },
  },
  AUTO_PROVISIONING_SETTING: {
    _type: 'azure_security_center_auto_provisioning_setting',
    _class: ['Configuration'],
    resourceName: '[RM] Security Center Auto Provisioning Setting',
    schema: {
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        type: { type: 'string' },
        autoProvision: { type: 'string' },
      },
      required: ['id', 'name', 'type', 'autoProvision'],
    },
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
  SUBSCRIPTION_HAS_SETTING: {
    _type: 'azure_subscription_has_security_center_setting',
    sourceType: subscriptionEntities.SUBSCRIPTION._type,
    _class: RelationshipClass.HAS,
    targetType: SecurityEntities.SETTING._type,
  },
  SUBSCRIPTION_HAS_AUTO_PROVISIONING_SETTING: {
    _type: 'azure_subscription_has_security_center_auto_provisioning_setting',
    sourceType: subscriptionEntities.SUBSCRIPTION._type,
    _class: RelationshipClass.HAS,
    targetType: SecurityEntities.AUTO_PROVISIONING_SETTING._type,
  },
};
