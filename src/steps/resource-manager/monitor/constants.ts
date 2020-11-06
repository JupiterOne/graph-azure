import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { STORAGE_ACCOUNT_ENTITY_METADATA } from '../storage';
import { SUBSCRIPTION_ENTITY_METADATA } from '../subscriptions';

export const MonitorSteps = {
  MONITOR_LOG_PROFILES: 'rm-monitor-log-profiles',
};

export const MonitorEntities = {
  MONITOR_LOG_PROFILE: {
    _type: 'azure_monitor_log_profile',
    _class: ['Configuration'],
    resourceName: '[RM] Monitor Log Profile',
  },
};

export const MonitorRelationships = {
  SUBSCRIPTION_HAS_MONITOR_LOG_PROFILE: {
    _type: 'azure_subscription_has_monitor_policy_assignment',
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
};
