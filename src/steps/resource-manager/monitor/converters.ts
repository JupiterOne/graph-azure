import { AzureWebLinker } from '../../../azure';
import {
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';
import { MonitorEntities } from './constants';
import {
  ActivityLogAlertResource,
  ActivityLogAlertAllOfCondition,
  DiagnosticSettingsResource,
  LogProfileResource,
  LogSettings,
  ActivityLogAlertLeafCondition,
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

export function createActivityLogAlertEntity(
  webLinker: AzureWebLinker,
  data: ActivityLogAlertResource,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id,
        _type: MonitorEntities.ACTIVITY_LOG_ALERT._type,
        _class: MonitorEntities.ACTIVITY_LOG_ALERT._class,
        id: data.id,
        name: data.name,
        description: data.description,
        enabled: data.enabled,
        scopes: data.scopes,
        'condition.category': getConditionProperty(data.condition, 'category'),
        'condition.operationName': getConditionProperty(
          data.condition,
          'operationName',
        ),
        'condition.level': getConditionProperty(data.condition, 'level'),
        'condition.status': getConditionProperty(data.condition, 'status'),
        'condition.caller': getConditionProperty(data.condition, 'caller'),
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}

/**
 * Azure SDK for JS typing is missing the `containsAny` property returned from this API:
 *
 * {
 *   "field": "status",
 *   "equals": null,
 *   "containsAny": [ "failed" ],
 *   "odata.type": null
 * }
 */
interface ActivityLogAlertAllOfConditionWithContainsAny
  extends ActivityLogAlertAllOfCondition {
  allOf: (ActivityLogAlertLeafCondition & { containsAny?: string[] | null })[];
}

const defaultConditionValue = 'ANY';

function getConditionProperty(
  condition: ActivityLogAlertAllOfConditionWithContainsAny,
  conditionName: 'category' | 'operationName' | 'level' | 'status' | 'caller',
): string | string[] | null {
  const conditionField = condition.allOf.find((c) => c.field === conditionName);

  if (!conditionField) return defaultConditionValue;
  if (conditionField.equals) return conditionField.equals;
  return conditionField.containsAny as string[];
}

export function createDiagnosticSettingEntity(
  webLinker: AzureWebLinker,
  data: DiagnosticSettingsResource,
  diagnosticLogCategories: string[] | undefined,
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
        ...getPropertiesForDiagnosticLogCategories(
          data.logs,
          diagnosticLogCategories,
        ),
      },
    },
  });
}

/**
 * Azure diagnostic settings contain an arbitrary `category` property, and each
 * individual Azure resource may utilize a unique set of diagnostic log categories.
 */
function getPropertiesForDiagnosticLogCategories(
  logSettings: LogSettings[] | undefined,
  diagnosticLogCategories: string[] = [],
) {
  if (!logSettings) return;

  const diagnosticLogProperties: {
    [key: string]: boolean | number | undefined;
  } = {};
  for (const category of diagnosticLogCategories) {
    const log = getLog(logSettings, category);

    if (log) {
      // Given a `category` of "Administrative":
      //
      // Create the following three properties:
      // {
      //   'log.Administrative.enabled': log.enabled,
      //   'log.Administrative.retentionPolicy.days': log.retentionPolicy.days,
      //   'log.Administrative.retentionPolicy.enabled': log.retentionPolicy.enabled,
      // }
      diagnosticLogProperties[`log.${category}.enabled`] = log.enabled;
      diagnosticLogProperties[`log.${category}.retentionPolicy.days`] =
        log.retentionPolicy.days;
      diagnosticLogProperties[`log.${category}.retentionPolicy.enabled`] =
        log.retentionPolicy.enabled;
    }
  }
  return diagnosticLogProperties;
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
