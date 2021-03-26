import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { ANY_SCOPE } from '../constants';
import { entities as storageEntities } from '../storage/constants';
import { entities as subscriptionEntities } from '../subscriptions/constants';

export const MonitorSteps = {
  MONITOR_LOG_PROFILES: 'rm-monitor-log-profiles',
};

export const MonitorEntities = {
  MONITOR_LOG_PROFILE: {
    _type: 'azure_monitor_log_profile',
    _class: ['Configuration'],
    resourceName: '[RM] Monitor Log Profile',
  },
  DIAGNOSTIC_SETTINGS: {
    _type: 'azure_diagnostic_settings',
    _class: ['Configuration'],
    resourceName: '[RM] Monitor Diagnostic Settings Resource',
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
  AZURE_RESOURCE_HAS_DIAGNOSTIC_SETTINGS: {
    _type: 'azure_resource_has_diagnostic_settings',
    sourceType: ANY_SCOPE,
    _class: RelationshipClass.HAS,
    targetType: MonitorEntities.DIAGNOSTIC_SETTINGS._type,
  },
  DIAGNOSTIC_SETTINGS_USES_STORAGE_ACCOUNT: {
    _type: 'azure_diagnostic_settings_uses_storage_account',
    sourceType: MonitorEntities.DIAGNOSTIC_SETTINGS._type,
    _class: RelationshipClass.USES,
    targetType: storageEntities.STORAGE_ACCOUNT._type,
  },
};
