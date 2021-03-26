import { Recording } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import { setupAzureRecording } from '../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';
import { createDiagnosticSettingsEntitiesAndRelationshipsForResource } from './createDiagnosticSettingsEntitiesAndRelationshipsForResource';
import {
  KEY_VAULT_SERVICE_ENTITY_CLASS,
  KEY_VAULT_SERVICE_ENTITY_TYPE,
} from '../key-vault';
import { Entity } from '@jupiterone/integration-sdk-core';
import { MonitorEntities, MonitorRelationships } from '../monitor/constants';
import { separateDiagnosticSettingsRelationships } from '../../../../test/helpers/filterGraphObjects';
import { getMockAccountEntity } from '../../../../test/helpers/getMockAccountEntity';

let recording: Recording;

afterAll(async () => {
  if (recording) {
    await recording.stop();
  }
});

describe('createDiagnosticSettingsEntitiesAndRelationshipsForResource', () => {
  function getSetupEntities(instanceConfig: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(instanceConfig);

    /**
     * NOTE:
     * The function used to create entities lowercases the id and _key.
     * This means that the id and _key of Azure Diagnostic Log Setting and Azure Diagnostic Metric Setting entities are the lowercased version of the resource URI.
     * The id/URI of the storage account these entities use are returned by the endpoint in camel case.
     * When creating relationships between these entities and others, all other references to Azure Diagnostic Log Setting and Azure Diagnostic Metric Setting _keys or ids will be lowercased, but all other references to _keys or id are in the casing returned by the client.
     */
    const keyVaultId = `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.keyvault/vaults/${instanceConfig.developerId}1-j1dev`;

    const keyVaultEntity: Entity = {
      id: keyVaultId,
      _class: KEY_VAULT_SERVICE_ENTITY_CLASS,
      _type: KEY_VAULT_SERVICE_ENTITY_TYPE,
      _key: keyVaultId,
    };

    return { accountEntity, keyVaultEntity };
  }

  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'create-diagnostic-settings-entities-and-relationships',
    });

    const instanceConfig = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: 'bcd90474-9b62-4040-9d7b-8af257b1427d',
      subscriptionId: '40474ebe-55a2-4071-8fa8-b610acdd8e56',
      developerId: 'keionned',
    };

    const { accountEntity, keyVaultEntity } = getSetupEntities(instanceConfig);

    const context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [keyVaultEntity],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await createDiagnosticSettingsEntitiesAndRelationshipsForResource(
      context,
      keyVaultEntity,
    );

    const diagnosticSettingsEntities = context.jobState.collectedEntities;

    expect(diagnosticSettingsEntities.length).toBeGreaterThan(0);
    expect(diagnosticSettingsEntities).toMatchGraphObjectSchema({
      _class: MonitorEntities.DIAGNOSTIC_SETTINGS._class,
    });

    const {
      diagnosticSettingsRelationships,
      diagnosticSettingsStorageRelationships,
      rest: restRelationships,
    } = separateDiagnosticSettingsRelationships(
      context.jobState.collectedRelationships,
    );

    expect(diagnosticSettingsRelationships).toHaveLength(
      diagnosticSettingsEntities.length,
    );
    expect(diagnosticSettingsRelationships).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: {
            const:
              MonitorRelationships.AZURE_RESOURCE_HAS_DIAGNOSTIC_SETTINGS._type,
          },
        },
      },
    });

    expect(diagnosticSettingsStorageRelationships).toHaveLength(
      diagnosticSettingsStorageRelationships.length,
    );
    expect(
      diagnosticSettingsStorageRelationships,
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: {
            const:
              MonitorRelationships.DIAGNOSTIC_SETTINGS_USES_STORAGE_ACCOUNT
                ._type,
          },
        },
      },
    });

    expect(restRelationships).toHaveLength(0);
  });
});
