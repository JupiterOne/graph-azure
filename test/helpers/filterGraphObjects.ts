import { Entity, Relationship } from '@jupiterone/integration-sdk-core';
import {
  MonitorEntities,
  MonitorRelationships,
} from '../../src/steps/resource-manager/monitor/constants';

export function filterGraphObjects<T = Entity | Relationship>(
  graphObjects: T[],
  filter: (graphObject: T) => boolean,
): { targets: T[]; rest: T[] } {
  const targets: T[] = [];
  const rest: T[] = [];

  for (const graphObject of graphObjects) {
    if (filter(graphObject)) {
      targets.push(graphObject);
    } else {
      rest.push(graphObject);
    }
  }
  return { targets, rest };
}

export function separateDiagnosticSettingsEntities(entities: Entity[]) {
  const {
    targets: diagnosticLogEntities,
    rest: restAfterDiagnosticLog,
  } = filterGraphObjects(
    entities,
    (e) => e._type === MonitorEntities.DIAGNOSTIC_LOG_SETTING._type,
  );
  const {
    targets: diagnosticMetricEntities,
    rest: restAfterDiagnosticMetric,
  } = filterGraphObjects(
    restAfterDiagnosticLog,
    (e) => e._type === MonitorEntities.DIAGNOSTIC_METRIC_SETTING._type,
  );

  return {
    diagnosticLogEntities,
    diagnosticMetricEntities,
    rest: restAfterDiagnosticMetric,
  };
}

export function separateDiagnosticSettingsRelationships(
  relationships: Relationship[],
) {
  const {
    targets: diagnosticLogRelationships,
    rest: restAfterDiagnosticLog,
  } = filterGraphObjects(
    relationships,
    (e) =>
      e._type ===
      MonitorRelationships.AZURE_RESOURCE_HAS_MONITOR_DIAGNOSTIC_LOG_SETTING
        ._type,
  );
  const {
    targets: diagnosticMetricRelationships,
    rest: restAfterDiagnosticMetric,
  } = filterGraphObjects(
    restAfterDiagnosticLog,
    (e) =>
      e._type ===
      MonitorRelationships.AZURE_RESOURCE_HAS_MONITOR_DIAGNOSTIC_METRIC_SETTING
        ._type,
  );
  const {
    targets: diagnosticLogStorageRelationships,
    rest: restAfterDiagnosticLogStorage,
  } = filterGraphObjects(
    restAfterDiagnosticMetric,
    (e) =>
      e._type ===
      MonitorRelationships.DIAGNOSTIC_LOG_SETTING_USES_STORAGE_ACCOUNT._type,
  );
  const {
    targets: diagnosticMetricStorageRelationships,
    rest: restAfterDiagnosticMetricStorage,
  } = filterGraphObjects(
    restAfterDiagnosticLogStorage,
    (e) =>
      e._type ===
      MonitorRelationships.DIAGNOSTIC_METRIC_SETTING_USES_STORAGE_ACCOUNT._type,
  );

  return {
    diagnosticLogRelationships,
    diagnosticMetricRelationships,
    diagnosticLogStorageRelationships,
    diagnosticMetricStorageRelationships,
    rest: restAfterDiagnosticMetricStorage,
  };
}
