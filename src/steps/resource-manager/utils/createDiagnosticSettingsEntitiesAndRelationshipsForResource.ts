import {
  createDirectRelationship,
  Entity,
  RelationshipClass,
  StepEntityMetadata,
} from '@jupiterone/integration-sdk-core';
import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext } from '../../../types';
import { MonitorClient } from '../monitor/client';
import { MonitorEntities, MonitorRelationships } from '../monitor/constants';
import { createDiagnosticSettingEntity } from '../monitor/converters';
import { getAccountEntity } from '../../active-directory';

export interface DiagnosticSettingsEntityMetadata extends StepEntityMetadata {
  diagnosticLogCategories?: string[];
}

/**
 * Creates and persists the Azure Diagnostic Settings graph objects (entities and relationships) for an Azure Resource
 * @param executionContext The execution context of an integration step
 * @param resourceEntity The Azure resource entity who's Diagnostic Settings should be retrieved
 */
export async function createDiagnosticSettingsEntitiesAndRelationshipsForResource(
  executionContext: IntegrationStepContext,
  resourceEntity: Entity,
  resourceMetadata?: DiagnosticSettingsEntityMetadata,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new MonitorClient(instance.config, logger);

  const id = resourceEntity.id as string;

  await client.iterateDiagnosticSettings(id, async (diagnosticSettings) => {
    const diagnosticSettingsEntity = await jobState.addEntity(
      createDiagnosticSettingEntity(
        webLinker,
        diagnosticSettings,
        resourceMetadata?.diagnosticLogCategories,
      ),
    );

    await jobState.addRelationship(
      createDirectRelationship({
        from: resourceEntity,
        _class: RelationshipClass.HAS,
        to: diagnosticSettingsEntity,
        properties: {
          _type:
            MonitorRelationships.AZURE_RESOURCE_HAS_DIAGNOSTIC_SETTING._type,
        },
      }),
    );

    if (diagnosticSettings.storageAccountId) {
      const storageAccountEntity = await jobState.findEntity(
        diagnosticSettings.storageAccountId,
      );
      if (storageAccountEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            from: diagnosticSettingsEntity,
            to: storageAccountEntity,
          }),
        );
      }
    }
  });
}

export const diagnosticSettingsEntitiesForResource = [
  MonitorEntities.DIAGNOSTIC_SETTING,
];

export function getDiagnosticSettingsRelationshipsForResource(
  resourceMetadata: DiagnosticSettingsEntityMetadata,
) {
  return [
    MonitorRelationships.DIAGNOSTIC_SETTING_USES_STORAGE_ACCOUNT,
    // See `./cli/commands/documentDiagnosticSettings for information
    // about the `resourceType` property and its usage.
    {
      ...MonitorRelationships.AZURE_RESOURCE_HAS_DIAGNOSTIC_SETTING,
      resourceType: resourceMetadata._type,
      logCategories: resourceMetadata.diagnosticLogCategories,
    },
  ];
}
