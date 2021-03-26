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
  const { targets: diagnosticSettingsEntities, rest } = filterGraphObjects(
    entities,
    (e) => e._type === MonitorEntities.DIAGNOSTIC_SETTINGS._type,
  );

  return {
    diagnosticSettingsEntities,
    rest,
  };
}

export function separateDiagnosticSettingsRelationships(
  relationships: Relationship[],
) {
  const {
    targets: diagnosticSettingsRelationships,
    rest: restAfterDiagnosticSettings,
  } = filterGraphObjects(
    relationships,
    (e) =>
      e._type ===
      MonitorRelationships.AZURE_RESOURCE_HAS_DIAGNOSTIC_SETTINGS._type,
  );
  const {
    targets: diagnosticSettingsStorageRelationships,
    rest: restAFterDiagnosticSettingsStorage,
  } = filterGraphObjects(
    restAfterDiagnosticSettings,
    (e) =>
      e._type ===
      MonitorRelationships.DIAGNOSTIC_SETTINGS_USES_STORAGE_ACCOUNT._type,
  );

  return {
    diagnosticSettingsRelationships: diagnosticSettingsRelationships,
    diagnosticSettingsStorageRelationships: diagnosticSettingsStorageRelationships,
    rest: restAFterDiagnosticSettingsStorage,
  };
}
