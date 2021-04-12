import {
  createDirectRelationship,
  RelationshipClass,
  Step,
  IntegrationStepExecutionContext,
  getRawData,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { STEP_AD_ACCOUNT } from '../../active-directory/constants';
import { KeyVaultClient } from './client';
import { entities, steps, relationships } from './constants';
import { createKeyEntity, createKeyVaultEntity } from './converters';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources/constants';
import createResourceGroupResourceRelationship, {
  createResourceGroupResourceRelationshipMetadata,
} from '../utils/createResourceGroupResourceRelationship';
import {
  createDiagnosticSettingsEntitiesAndRelationshipsForResource,
  diagnosticSettingsEntitiesForResource,
  getDiagnosticSettingsRelationshipsForResource,
} from '../utils/createDiagnosticSettingsEntitiesAndRelationshipsForResource';
import { getAccountEntity } from '../../active-directory';
import { Vault } from '@azure/arm-keyvault/esm/models';

export async function fetchKeyVaults(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new KeyVaultClient(instance.config, logger);

  await client.iterateKeyVaults(async (vault) => {
    const vaultEntity = createKeyVaultEntity(webLinker, vault);
    await jobState.addEntity(vaultEntity);
    await createResourceGroupResourceRelationship(
      executionContext,
      vaultEntity,
    );
    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: accountEntity,
        to: vaultEntity,
      }),
    );
  });
}

export async function fetchKeyVaultDiagnosticSettings(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: entities.KEY_VAULT._type },
    async (keyVaultEntity) => {
      await createDiagnosticSettingsEntitiesAndRelationshipsForResource(
        executionContext,
        keyVaultEntity,
      );
    },
  );
}

export async function fetchKeys(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new KeyVaultClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: entities.KEY_VAULT._type },
    async (keyVaultEntity) => {
      const keyVault = getRawData<Vault>(keyVaultEntity);
      if (!keyVault) return;

      await client.iterateKeys(keyVault, async (keyProperties) => {
        const keyEntity = await jobState.addEntity(
          createKeyEntity(webLinker, keyProperties),
        );
        await jobState.addRelationship(
          createDirectRelationship({
            from: keyVaultEntity,
            _class: RelationshipClass.HAS,
            to: keyEntity,
          }),
        );
      });
    },
  );
}

export const keyvaultSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: steps.VAULTS,
    name: 'Key Vaults',
    entities: [entities.KEY_VAULT],
    relationships: [
      relationships.ACCOUNT_HAS_KEY_VAULT,
      createResourceGroupResourceRelationshipMetadata(entities.KEY_VAULT._type),
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchKeyVaults,
  },
  {
    id: steps.VAULT_DIAGNOSTIC_SETTINGS,
    name: 'Key Vault Diagnostic Settings',
    entities: [...diagnosticSettingsEntitiesForResource],
    relationships: [
      ...getDiagnosticSettingsRelationshipsForResource(entities.KEY_VAULT),
    ],
    dependsOn: [STEP_AD_ACCOUNT, steps.VAULTS],
    executionHandler: fetchKeyVaults,
  },
  {
    id: steps.KEYS,
    name: 'Key Vault Keys',
    entities: [entities.KEY],
    relationships: [relationships.KEY_VAULT_HAS_KEY],
    dependsOn: [STEP_AD_ACCOUNT, steps.VAULTS],
    executionHandler: fetchKeys,
  },
];
