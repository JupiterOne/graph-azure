import {
  createDirectRelationship,
  Entity,
  ExplicitRelationship,
  JobState,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createAzureWebLinker } from '../azure';
import { IntegrationStepContext } from '../types';
import { ACCOUNT_ENTITY_TYPE } from '../steps/active-directory/constants';
import { MonitorClient } from '../steps/resource-manager/monitor/client';
import { MonitorRelationships } from '../steps/resource-manager/monitor/constants';
import {
  createDiagnosticLogSettingEntity,
  createDiagnosticMetricSettingEntity,
} from '../steps/resource-manager/monitor/converters';
import { DiagnosticSettingsResource } from '@azure/arm-monitor/esm/models';
import { STORAGE_ACCOUNT_ENTITY_METADATA } from '../steps/resource-manager/storage/constants';
import { ANY_SCOPE } from '../steps/resource-manager/constants';

type StorageLocation = {
  getStorageId: (
    diagnosticSettings: DiagnosticSettingsResource,
  ) => string | undefined;
  storageType: string;
};

// TODO: Add the other types of storage when we ingest them. (Azure Log Analytics, Azure Event Hub)
const STORAGE_LOCATIONS: StorageLocation[] = [
  {
    getStorageId: (diagnosticSettings: DiagnosticSettingsResource) =>
      diagnosticSettings.storageAccountId,
    storageType: STORAGE_ACCOUNT_ENTITY_METADATA._type,
  },
];

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
 * Creates direct/explicit relationships between an Azure Diagnostic Log Setting or Azure Diagnostic Metric Setting and the Azure Storage Resource(s) (Event Hub, Log Analytics, or Storage Account) that it uses.
 * @param diagnosticSettings The Azure Diagnostic Settings that contains the storage locations of the log and metrics
 * @param settingEntity The Azure Diagnostic Log or Metric Setting Entity
 */
function createSettingUsesStorageRelationships(
  diagnosticSettings: DiagnosticSettingsResource,
  settingEntity: Entity,
): ExplicitRelationship[] {
  return STORAGE_LOCATIONS.reduce<ExplicitRelationship[]>(
    (relationships, storageLocation) => {
      const { getStorageId, storageType } = storageLocation;
      const storageId = getStorageId(diagnosticSettings);

      if (storageId) {
        relationships.push(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            fromType: settingEntity._type,
            fromKey: settingEntity._key,
            toType: storageType,
            toKey: storageId,
          }),
        );
      }

      return relationships;
    },
    [],
  );
}

function persistDiagnosticSettingsGraphObjects(
  jobState: JobState,
  settingEntity: Entity,
  relationships: ExplicitRelationship[],
) {
  return Promise.all([
    jobState.addEntity(settingEntity),
    jobState.addRelationships(relationships),
  ]);
}

export async function createDiagnosticSettingsEntitiesAndRelationshipsForResource(
  executionContext: IntegrationStepContext,
  resourceEntity: Entity,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);
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

              await persistDiagnosticSettingsGraphObjects(
                jobState,
                logSettingEntity,
                [
                  resourceHasLogSettingRelationship,
                  ...(logSettingUsesStorageRelationships || []),
                ],
              );
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

              await persistDiagnosticSettingsGraphObjects(
                jobState,
                metricSettingEntity,
                [
                  resourceHasMetricSettingRelationship,
                  ...(metricSettingUsesStorageRelationships || []),
                ],
              );
            })
          : []),
      ]);
    },
  );
}
