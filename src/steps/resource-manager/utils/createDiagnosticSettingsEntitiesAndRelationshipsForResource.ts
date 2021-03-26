import {
  createDirectRelationship,
  Entity,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext } from '../../../types';
import { MonitorClient } from '../monitor/client';
import { MonitorEntities, MonitorRelationships } from '../monitor/constants';
import { createDiagnosticSettingsEntity } from '../monitor/converters';
import { getAccountEntity } from '../../active-directory';

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
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new MonitorClient(instance.config, logger);

  const id = resourceEntity.id as string;

  await client.iterateDiagnosticSettings(id, async (diagnosticSettings) => {
    const diagnosticSettingsEntity = await jobState.addEntity(
      createDiagnosticSettingsEntity(webLinker, diagnosticSettings),
    );

    await jobState.addRelationship(
      createDirectRelationship({
        from: resourceEntity,
        _class: RelationshipClass.HAS,
        to: diagnosticSettingsEntity,
        properties: {
          _type:
            MonitorRelationships.AZURE_RESOURCE_HAS_DIAGNOSTIC_SETTINGS._type,
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
  MonitorEntities.DIAGNOSTIC_SETTINGS,
];

export function getDiagnosticSettingsRelationshipsForResource(
  resourceType: string,
) {
  return [
    MonitorRelationships.DIAGNOSTIC_SETTINGS_USES_STORAGE_ACCOUNT,
    // See `./cli/commands/documentDiagnosticSettings for information
    // about the `resourceType` property and its usage.
    {
      ...MonitorRelationships.AZURE_RESOURCE_HAS_DIAGNOSTIC_SETTINGS,
      resourceType,
    },
  ];
}
