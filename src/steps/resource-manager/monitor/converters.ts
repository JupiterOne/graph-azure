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
  MetricSettings,
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

function createSettingEntity(
  webLinker: AzureWebLinker,
  diagnosticSetting: DiagnosticSettingsResource,
  setting: MetricSettings,
  _type: string,
  _class: string | string[],
  id: string,
): Entity {
  const {
    storageAccountId,
    serviceBusRuleId,
    eventHubAuthorizationRuleId,
    eventHubName,
    workspaceId,
    logAnalyticsDestinationType,
  } = diagnosticSetting;

  const { retentionPolicy, enabled, category, timeGrain } = setting;

  return createIntegrationEntity({
    entityData: {
      source: diagnosticSetting,
      assign: {
        _key: id,
        _type,
        _class,
        webLink: webLinker.portalResourceUrl(diagnosticSetting.id),
        storageAccountId,
        serviceBusRuleId,
        eventHubAuthorizationRuleId,
        eventHubName,
        workspaceId,
        logAnalyticsDestinationType,
        category,
        enabled,
        timeGrain,
        'retentionPolicy.days': retentionPolicy?.days,
        'retentionPolicy.enabled': retentionPolicy?.enabled,
        id,
        /**
         * Because we are creating a custom id, and the DiagnosticSettingsResource has its own id,
         * we want to add the id in last, after the properties from the DiagnosticSettingsResource have been spread
         * This way we do not override it with the DiagnosticSettingsResource id
         */
      },
    },
  });
}

export function createDiagnosticLogSettingEntity(
  webLinker: AzureWebLinker,
  diagnosticSetting: DiagnosticSettingsResource,
  setting: LogSettings,
): Entity {
  const { category, enabled, retentionPolicy } = setting;
  const id = `${diagnosticSetting.id}/logs/${category}/${enabled}/${retentionPolicy?.days}/${retentionPolicy?.enabled}`;

  return createSettingEntity(
    webLinker,
    diagnosticSetting,
    setting,
    MonitorEntities.DIAGNOSTIC_LOG_SETTING._type,
    MonitorEntities.DIAGNOSTIC_LOG_SETTING._class,
    id,
  );
}

export function createDiagnosticMetricSettingEntity(
  webLinker: AzureWebLinker,
  diagnosticSetting: DiagnosticSettingsResource,
  setting: MetricSettings,
): Entity {
  const { category, enabled, timeGrain, retentionPolicy } = setting;
  const id = `${diagnosticSetting.id}/metrics/${category}/${enabled}/${timeGrain}/${retentionPolicy?.days}/${retentionPolicy?.enabled}`;

  return createSettingEntity(
    webLinker,
    diagnosticSetting,
    setting,
    MonitorEntities.DIAGNOSTIC_METRIC_SETTING._type,
    MonitorEntities.DIAGNOSTIC_METRIC_SETTING._class,
    id,
  );
}
