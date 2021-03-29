import { AzureWebLinker } from '../../../azure';
import {
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';
import { MonitorEntities } from './constants';
import {
  DiagnosticSettingsResource,
  LogProfileResource,
  LogSettings,
} from '@azure/arm-monitor/esm/models';

export function createMonitorLogProfileEntity(
  webLinker: AzureWebLinker,
  data: LogProfileResource,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id,
        _type: MonitorEntities.MONITOR_LOG_PROFILE._type,
        _class: MonitorEntities.MONITOR_LOG_PROFILE._class,
        id: data.id,
        webLink: webLinker.portalResourceUrl(data.id),
        name: data.name,
        displayName: data.name,
        storageAccountId: data.storageAccountId,
        serviceBusRuleId: data.serviceBusRuleId,
        locations: data.locations,
        categories: data.categories,
        'retentionPolicy.enabled': data.retentionPolicy.enabled,
        'retentionPolicy.days': data.retentionPolicy.days,
      },
    },
  });
}

export function createDiagnosticSettingEntity(
  webLinker: AzureWebLinker,
  data: DiagnosticSettingsResource,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id!,
        _type: MonitorEntities.DIAGNOSTIC_SETTING._type,
        _class: MonitorEntities.DIAGNOSTIC_SETTING._class,
        id: data.id,
        webLink: webLinker.portalResourceUrl(data.id),
        name: data.name,
        storageAccountId: data.storageAccountId,
        eventHubName: data.eventHubName,
        eventHubAuthorizationRuleId: data.eventHubAuthorizationRuleId,
        workspaceId: data.workspaceId,
        logAnalyticsDestinationType: data.logAnalyticsDestinationType,
        serviceBusRuleId: data.serviceBusRuleId,
        type: data.type,
        'log.Administrative.enabled': getLog(data.logs, 'Administrative')
          ?.enabled,
        'log.Alert.enabled': getLog(data.logs, 'Alert')?.enabled,
        'log.Policy.enabled': getLog(data.logs, 'Policy')?.enabled,
        'log.Security.enabled': getLog(data.logs, 'Security')?.enabled,
        'log.AuditEvent.enabled': getLog(data.logs, 'AuditEvent')?.enabled,
        'log.AuditEvent.retentionPolicy.days': getLog(data.logs, 'AuditEvent')
          ?.retentionPolicy.days,
        'log.AuditEvent.retentionPolicy.enabled': getLog(
          data.logs,
          'AuditEvent',
        )?.retentionPolicy.enabled,
      },
    },
  });
}

function getLog(logs: LogSettings[] | undefined, category: string) {
  if (!logs) return;

  const log = logs.find((l) => l.category === category);

  if (log) {
    return {
      enabled: log.enabled,
      retentionPolicy: {
        enabled: log.retentionPolicy?.enabled,
        days: log.retentionPolicy?.days,
      },
    };
  }
}
