import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { ANY_SCOPE } from '../constants';
import { entities as storageEntities } from '../storage/constants';
import { entities as subscriptionEntities } from '../subscriptions/constants';
import { createResourceGroupResourceRelationshipMetadata } from '../utils/createResourceGroupResourceRelationship';

export const MonitorSteps = {
  MONITOR_LOG_PROFILES: 'rm-monitor-log-profiles',
  MONITOR_ACTIVITY_LOG_ALERTS: 'rm-monitor-activity-log-alerts',
  MONITOR_ACTIVITY_LOG_ALERT_SCOPE_RELATIONSHIPS:
    'rm-monitor-activity-log-alert-scope-relationships',
};

const stringSchema = { type: 'string' };

const arrayOfStringsSchema = { type: 'array', items: stringSchema };

const stringOrArrayOfStringsSchema = {
  anyOf: [stringSchema, arrayOfStringsSchema],
};

export const MonitorEntities = {
  MONITOR_LOG_PROFILE: {
    _type: 'azure_monitor_log_profile',
    _class: ['Configuration'],
    resourceName: '[RM] Monitor Log Profile',
  },
  DIAGNOSTIC_SETTING: {
    _type: 'azure_diagnostic_setting',
    _class: ['Configuration'],
    resourceName: '[RM] Monitor Diagnostic Settings Resource',
  },
  ACTIVITY_LOG_ALERT: {
    _type: 'azure_monitor_activity_log_alert',
    _class: ['Rule'],
    resourceName: '[RM] Monitor Activity Log Alert',
    schema: {
      properties: {
        enabled: { type: 'boolean' },
        scopes: arrayOfStringsSchema,
        'condition.category': stringOrArrayOfStringsSchema,
        'condition.operationName': stringOrArrayOfStringsSchema,
        'condition.level': stringOrArrayOfStringsSchema,
        'condition.status': stringOrArrayOfStringsSchema,
        'condition.caller': stringOrArrayOfStringsSchema,
      },
      required: [
        'enabled',
        'scopes',
        'condition.category',
        'condition.level',
        'condition.status',
        'condition.caller',
      ],
    },
  },
};

export const MonitorRelationships = {
  SUBSCRIPTION_HAS_MONITOR_LOG_PROFILE: {
    _type: 'azure_subscription_has_monitor_log_profile',
    sourceType: subscriptionEntities.SUBSCRIPTION._type,
    _class: RelationshipClass.HAS,
    targetType: MonitorEntities.MONITOR_LOG_PROFILE._type,
  },
  MONITOR_LOG_PROFILE_USES_STORAGE_ACCOUNT: {
    _type: 'azure_monitor_log_profile_uses_storage_account',
    sourceType: MonitorEntities.MONITOR_LOG_PROFILE._type,
    _class: RelationshipClass.USES,
    targetType: storageEntities.STORAGE_ACCOUNT._type,
  },
  AZURE_RESOURCE_HAS_DIAGNOSTIC_SETTING: {
    _type: 'azure_resource_has_diagnostic_setting',
    sourceType: ANY_SCOPE,
    _class: RelationshipClass.HAS,
    targetType: MonitorEntities.DIAGNOSTIC_SETTING._type,
  },
  DIAGNOSTIC_SETTING_USES_STORAGE_ACCOUNT: {
    _type: 'azure_diagnostic_setting_uses_storage_account',
    sourceType: MonitorEntities.DIAGNOSTIC_SETTING._type,
    _class: RelationshipClass.USES,
    targetType: storageEntities.STORAGE_ACCOUNT._type,
  },
  RESOURCE_GROUP_HAS_ACTIVITY_LOG_ALERT: createResourceGroupResourceRelationshipMetadata(
    MonitorEntities.ACTIVITY_LOG_ALERT._type,
  ),
  ACTIVITY_LOG_ALERT_MONITORS_SCOPE: {
    _type: 'azure_monitor_activity_log_alert_monitors_azure_scope',
    sourceType: MonitorEntities.ACTIVITY_LOG_ALERT._type,
    _class: RelationshipClass.MONITORS,
    targetType: ANY_SCOPE,
  },
};
