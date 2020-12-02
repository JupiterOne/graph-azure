import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { ANY_SCOPE } from '../constants';
import { STORAGE_ACCOUNT_ENTITY_METADATA } from '../storage';
import { SUBSCRIPTION_ENTITY_METADATA } from '../subscriptions';

export const MonitorSteps = {
  MONITOR_LOG_PROFILES: 'rm-monitor-log-profiles',
  MONITOR_DIAGNOSTIC_SETTINGS: 'rm-monitor-diagnostic-settings',
};

export const MonitorEntities = {
  MONITOR_LOG_PROFILE: {
    _type: 'azure_monitor_log_profile',
    _class: ['Configuration'],
    resourceName: '[RM] Monitor Log Profile',
  },

  DIAGNOSTIC_LOG_SETTING: {
    _type: 'azure_diagnostic_log_setting',
    _class: ['Configuration'],
    resourceName: '[RM] Monitor Diagnostic Log Setting',
  },

  DIAGNOSTIC_METRIC_SETTING: {
    _type: 'azure_diagnostic_metric_setting',
    _class: ['Configuration'],
    resourceName: '[RM] Monitor Diagnostic Metric Setting',
  },
};

export const MonitorRelationships = {
  SUBSCRIPTION_HAS_MONITOR_LOG_PROFILE: {
    _type: 'azure_subscription_has_monitor_log_profile',
    sourceType: SUBSCRIPTION_ENTITY_METADATA._type,
    _class: RelationshipClass.HAS,
    targetType: MonitorEntities.MONITOR_LOG_PROFILE._type,
  },

  MONITOR_LOG_PROFILE_USES_STORAGE_ACCOUNT: {
    _type: 'azure_monitor_log_profile_uses_storage_account',
    sourceType: MonitorEntities.MONITOR_LOG_PROFILE._type,
    _class: RelationshipClass.USES,
    targetType: STORAGE_ACCOUNT_ENTITY_METADATA._type,
  },

  ANY_RESOURCE_HAS_DIAGNOSTIC_LOG_SETTING: {
    _type: 'azure_resource_has_diagnostic_log_setting',
    sourceType: ANY_SCOPE,
    _class: RelationshipClass.HAS,
    targetType: MonitorEntities.DIAGNOSTIC_LOG_SETTING._type,
  },

  ANY_RESOURCE_HAS_DIAGNOSTIC_METRIC_SETTING: {
    _type: 'azure_resource_has_diagnostic_metric_setting',
    sourceType: ANY_SCOPE,
    _class: RelationshipClass.HAS,
    targetType: MonitorEntities.DIAGNOSTIC_METRIC_SETTING._type,
  },

  DIAGNOSTIC_LOG_SETTING_USES_STORAGE_ACCOUNT: {
    _type: 'azure_diagnostic_log_setting_uses_storage_account',
    sourceType: MonitorEntities.DIAGNOSTIC_LOG_SETTING._type,
    _class: RelationshipClass.USES,
    targetType: STORAGE_ACCOUNT_ENTITY_METADATA._type,
  },

  DIAGNOSTIC_METRIC_SETTING_USES_STORAGE_ACCOUNT: {
    _type: 'azure_diagnostic_metric_setting_uses_storage_account',
    sourceType: MonitorEntities.DIAGNOSTIC_METRIC_SETTING._type,
    _class: RelationshipClass.USES,
    targetType: STORAGE_ACCOUNT_ENTITY_METADATA._type,
  },
};
