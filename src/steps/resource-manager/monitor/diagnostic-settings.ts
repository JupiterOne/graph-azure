import {
  createDirectRelationship,
  Entity,
  JobState,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { AzureWebLinker, createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext } from '../../../types';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';
import { MonitorClient } from './client';
import { MonitorEntities } from './constants';
import {
  createDiagnosticLogSettingEntity,
  createDiagnosticMetricSettingEntity,
} from './converters';
import {
  DiagnosticSettingsResource,
  LogSettings,
  MetricSettings,
} from '@azure/arm-monitor/esm/models';
import { STORAGE_ACCOUNT_ENTITY_METADATA } from '../storage';

type CreateDiagnosticSettingEntity = (
  webLinker: AzureWebLinker,
  diagnosticSettings: DiagnosticSettingsResource,
  setting: LogSettings | MetricSettings,
) => Entity;

type StorageLocation = {
  getStorageId: (
    diagnosticSettings: DiagnosticSettingsResource,
  ) => string | undefined;
  storageType: string;
};

const DIAGNOSTIC_SETTING_INFO_MAP: {
  [key: string]: CreateDiagnosticSettingEntity;
} = {
  [MonitorEntities.DIAGNOSTIC_LOG_SETTING
    ._type]: createDiagnosticLogSettingEntity,
  [MonitorEntities.DIAGNOSTIC_METRIC_SETTING
    ._type]: createDiagnosticMetricSettingEntity,
};

// TODO: Add the other types of storage when we ingest them. (Azure Log Analytics, Azure Event Hub)
const STORAGE_LOCATION_INFO: StorageLocation[] = [
  {
    getStorageId: (diagnosticSettings: DiagnosticSettingsResource) =>
      diagnosticSettings.storageAccountId,
    storageType: STORAGE_ACCOUNT_ENTITY_METADATA._type,
  },
];

async function createEntitiesAndRelationships(
  jobState: JobState,
  webLinker: AzureWebLinker,
  diagnosticSettings: DiagnosticSettingsResource,
  setting: LogSettings | MetricSettings,
  entityType: string,
  resourceEntity: Entity,
): Promise<void> {
  if (!DIAGNOSTIC_SETTING_INFO_MAP[entityType]) return;

  const createEntity = DIAGNOSTIC_SETTING_INFO_MAP[entityType];

  // Create Azure Diagnostic Log Setting or Azure Diagnostic Metric Setting entity
  const settingEntity = await jobState.addEntity(
    createEntity(webLinker, diagnosticSettings, setting),
  );

  // Create Azure Resource has Azure Diagnostic Log Setting or Azure Diagnostic Metric Setting relationship
  await jobState.addRelationship(
    createDirectRelationship({
      _class: RelationshipClass.HAS,
      fromType: resourceEntity._type,
      fromKey: resourceEntity._key,
      toType: settingEntity._type,
      toKey: settingEntity._key,
    }),
  );

  // Create Azure Diagnostic Log Setting or Azure Diagnostic Metric Setting uses Azure Storage Resource (Event Hub, Log Analytics, or Storage Account)
  for (const storageLocation of STORAGE_LOCATION_INFO) {
    const { getStorageId, storageType } = storageLocation;

    const storageId = getStorageId(diagnosticSettings);
    if (!storageId) continue;

    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.USES,
        fromType: settingEntity._type,
        fromKey: settingEntity._key,
        toType: storageType,
        toKey: storageId,
      }),
    );
  }
}

export async function fetchDiagnosticSettings(
  executionContext: IntegrationStepContext,
  resourceEntity: Entity,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new MonitorClient(instance.config, logger);

  const { id } = resourceEntity;
  if (id && typeof id === 'string') {
    await client.iterateDiagnosticSettings(id, async (diagnosticSettings) => {
      const { logs, metrics } = diagnosticSettings;

      await Promise.all([
        ...(logs
          ? logs.map(
              async (log) =>
                await createEntitiesAndRelationships(
                  jobState,
                  webLinker,
                  diagnosticSettings,
                  log,
                  MonitorEntities.DIAGNOSTIC_LOG_SETTING._type,
                  resourceEntity,
                ),
            )
          : []),
        ...(metrics
          ? metrics.map(
              async (metric) =>
                await createEntitiesAndRelationships(
                  jobState,
                  webLinker,
                  diagnosticSettings,
                  metric,
                  MonitorEntities.DIAGNOSTIC_METRIC_SETTING._type,
                  resourceEntity,
                ),
            )
          : []),
      ]);
    });
  }
}
