import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { ANY_RESOURCE } from '../constants';
import { STORAGE_ACCOUNT_ENTITY_METADATA } from '../storage/constants';
import { SUBSCRIPTION_ENTITY_METADATA } from '../subscriptions/constants';

export const MonitorSteps = {
  MONITOR_LOG_PROFILES: 'rm-monitor-log-profiles',
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

  AZURE_RESOURCE_HAS_MONITOR_DIAGNOSTIC_LOG_SETTING: {
    _type: 'azure_resource_has_diagnostic_log_setting',
    sourceType: ANY_RESOURCE,
    _class: RelationshipClass.HAS,
    targetType: MonitorEntities.DIAGNOSTIC_LOG_SETTING._type,
  },

  AZURE_RESOURCE_HAS_MONITOR_DIAGNOSTIC_METRIC_SETTING: {
    _type: 'azure_resource_has_diagnostic_metric_setting',
    sourceType: ANY_RESOURCE,
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
