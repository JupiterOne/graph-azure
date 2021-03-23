import {
  createDirectRelationship,
  Entity,
  ExplicitRelationship,
  RelationshipClass,
  StepEntityMetadata,
  StepRelationshipMetadata,
} from '@jupiterone/integration-sdk-core';
import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext } from '../../../types';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory/constants';
import { MonitorClient } from '../monitor/client';
import { MonitorEntities, MonitorRelationships } from '../monitor/constants';
import {
  createDiagnosticLogSettingEntity,
  createDiagnosticMetricSettingEntity,
} from '../monitor/converters';
import { DiagnosticSettingsResource } from '@azure/arm-monitor/esm/models';
import { entities as storageEntities } from '../storage/constants';
import { ANY_SCOPE } from '../constants';

/**
 * Creates a direct/explicit relationship between an Azure Scope and an Azure Diagnostic Log Setting or Azure Diagnostic Metric Setting
 * @param resourceEntity The Azure scope that has an Azure Diagnostic Log or Metric Setting
 * @param settingEntity The Azure Diagnostic Log or Metric Setting Entity
 * @param relationshipType The type of relationship between the Azure Scope and Azure Diagnostic Log or Metric Setting (e.g azure_resource_has_diagnostic_log_setting)
 */
function createResourceHasSettingRelationship(
  resourceEntity: Entity,
  settingEntity: Entity,
  relationshipType: string,
): ExplicitRelationship {
  return createDirectRelationship({
    _class: RelationshipClass.HAS,
    fromType: ANY_SCOPE,
    fromKey: resourceEntity._key,
    toType: settingEntity._type,
    toKey: settingEntity._key,
    properties: {
      _type: relationshipType,
    },
  });
}

/**
 * Create a direct/explicit relationship between an Azure Diagnostic Log Setting or Azure Diagnostic Metric Setting and an Azure Storage Account
 * @param settingEntity The Azure Diagnostic Log or Metric Setting Entity
 * @param storageAccountId The Azure resource URI of the Azure Storage Account that the Azure resource will use to store metrics and/or logs
 */
function createSettingUsesStorageAccountRelationship(
  settingEntity: Entity,
  storageAccountId: string,
): ExplicitRelationship {
  return createDirectRelationship({
    _class: RelationshipClass.USES,
    fromType: settingEntity._type,
    fromKey: settingEntity._key,
    toType: storageEntities.STORAGE_ACCOUNT._type,
    toKey: storageAccountId,
  });
}

/**
 * Creates direct/explicit relationships between an Azure Diagnostic Log Setting or Azure Diagnostic Metric Setting and the Azure Storage Resource(s) (Event Hub, Log Analytics, or Storage Account) that it uses.
 * @param diagnosticSettings The Azure Diagnostic Settings that contains the storage locations of the log and metrics
 * @param settingEntity The Azure Diagnostic Log or Metric Setting Entity
 */
function createSettingUsesStorageRelationships(
  diagnosticSettings: DiagnosticSettingsResource,
  settingEntity: Entity,
): ExplicitRelationship[] {
  const relationships: ExplicitRelationship[] = [];
  const { storageAccountId } = diagnosticSettings;

  if (storageAccountId) {
    relationships.push(
      createSettingUsesStorageAccountRelationship(
        settingEntity,
        storageAccountId,
      ),
    );
  }

  // TODO: Add the other types of storage when we ingest them. (Azure Log Analytics, Azure Event Hub)

  return relationships;
}

/**
 * Creates and persists the Azure Diagnostic Settings graph objects (entities and relationships) for an Azure Resource
 * @param executionContext The execution context of an integration step
 * @param resourceEntity The Azure resource entity who's Diagnostic Settings should be retrieved
 */
export async function createDiagnosticSettingsEntitiesAndRelationshipsForResource(
  executionContext: IntegrationStepContext,
  resourceEntity: Entity,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = (await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE))!;
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new MonitorClient(instance.config, logger);

  const { id } = resourceEntity;

  await client.iterateDiagnosticSettings(
    id as string,
    async (diagnosticSettings) => {
      const { logs, metrics } = diagnosticSettings;

      await Promise.all([
        ...(logs
          ? logs.map(async (log) => {
              const logSettingEntity = createDiagnosticLogSettingEntity(
                webLinker,
                diagnosticSettings,
                log,
              );
              const resourceHasLogSettingRelationship = createResourceHasSettingRelationship(
                resourceEntity,
                logSettingEntity,
                MonitorRelationships
                  .AZURE_RESOURCE_HAS_MONITOR_DIAGNOSTIC_LOG_SETTING._type,
              );
              const logSettingUsesStorageRelationships = createSettingUsesStorageRelationships(
                diagnosticSettings,
                logSettingEntity,
              );

              await Promise.all([
                jobState.addEntity(logSettingEntity),
                jobState.addRelationships([
                  resourceHasLogSettingRelationship,
                  ...logSettingUsesStorageRelationships,
                ]),
              ]);
            })
          : []),
        ...(metrics
          ? metrics.map(async (metric) => {
              const metricSettingEntity = createDiagnosticMetricSettingEntity(
                webLinker,
                diagnosticSettings,
                metric,
              );
              const resourceHasMetricSettingRelationship = createResourceHasSettingRelationship(
                resourceEntity,
                metricSettingEntity,
                MonitorRelationships
                  .AZURE_RESOURCE_HAS_MONITOR_DIAGNOSTIC_METRIC_SETTING._type,
              );
              const metricSettingUsesStorageRelationships = createSettingUsesStorageRelationships(
                diagnosticSettings,
                metricSettingEntity,
              );

              await Promise.all([
                jobState.addEntity(metricSettingEntity),
                jobState.addRelationships([
                  resourceHasMetricSettingRelationship,
                  ...metricSettingUsesStorageRelationships,
                ]),
              ]);
            })
          : []),
      ]);
    },
  );
}

export const diagnosticSettingsEntitiesForResource: StepEntityMetadata[] = [
  MonitorEntities.DIAGNOSTIC_LOG_SETTING,
  MonitorEntities.DIAGNOSTIC_METRIC_SETTING,
];

export const diagnosticSettingsRelationshipsForResource: StepRelationshipMetadata[] = [
  MonitorRelationships.AZURE_RESOURCE_HAS_MONITOR_DIAGNOSTIC_LOG_SETTING,
  MonitorRelationships.AZURE_RESOURCE_HAS_MONITOR_DIAGNOSTIC_METRIC_SETTING,
  MonitorRelationships.DIAGNOSTIC_LOG_SETTING_USES_STORAGE_ACCOUNT,
  MonitorRelationships.DIAGNOSTIC_METRIC_SETTING_USES_STORAGE_ACCOUNT,
];
