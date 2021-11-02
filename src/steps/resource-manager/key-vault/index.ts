import {
  createDirectRelationship,
  RelationshipClass,
  Step,
  IntegrationStepExecutionContext,
  getRawData,
  createMappedRelationship,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import {
  ACCOUNT_ENTITY_TYPE,
  STEP_AD_ACCOUNT,
} from '../../active-directory/constants';
import { KeyVaultClient } from './client';
import {
  ACCOUNT_KEY_VAULT_RELATIONSHIP_TYPE,
  KEY_VAULT_SERVICE_ENTITY_TYPE,
  STEP_RM_KEYVAULT_VAULTS,
  ACCOUNT_KEY_VAULT_RELATIONSHIP_CLASS,
  KeyVaultEntities,
  KeyVaultRelationships,
  KeyVaultStepIds,
  STEP_RM_KEYVAULT_KEYS,
  STEP_RM_KEYVAULT_SECRETS,
} from './constants';
import {
  createKeyVaultEntity,
  createKeyVaultKeyEntity,
  createKeyVaultSecretEntity,
} from './converters';
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

export * from './constants';

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

    await createDiagnosticSettingsEntitiesAndRelationshipsForResource(
      executionContext,
      vaultEntity,
      KeyVaultEntities.KEY_VAULT,
    );
  });
}

export async function fetchKeyVaultKeys(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new KeyVaultClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: KEY_VAULT_SERVICE_ENTITY_TYPE },
    async (vaultEntity) => {
      if (vaultEntity.vaultUrl) {
        await client.iterateKeys(
          vaultEntity.vaultUrl as string,
          async (key) => {
            const keyEntity = createKeyVaultKeyEntity({
              webLinker,
              data: key,
              vaultUrl: vaultEntity.vaultUrl as string,
            });
            await jobState.addEntity(keyEntity);

            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.CONTAINS,
                from: vaultEntity,
                to: keyEntity,
              }),
            );
          },
        );
      }
    },
  );
}

export async function buildKeyVaultAccessPolicyRelationships(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: KeyVaultEntities.KEY_VAULT._type },
    async (keyVaultEntity) => {
      const keyVault = getRawData<Vault>(keyVaultEntity);

      if (!keyVault) return;

      for (const accessPolicy of keyVault.properties.accessPolicies || []) {
        const permissions = accessPolicy.permissions;
        await jobState.addRelationship(
          createMappedRelationship({
            source: keyVaultEntity,
            _class: RelationshipClass.ALLOWS,
            target: {
              _type: 'azure_principal',
              _key: accessPolicy.objectId,
            },
            targetFilterKeys: [['_key']],
            properties: {
              'permissions.keys': permissions.keys?.join(','),
              'permissions.secrets': permissions.secrets?.join(','),
              'permissions.storage': permissions.storage?.join(','),
              'permissions.certificates': permissions.certificates?.join(','),
            },
          }),
        );
      }
    },
  );
}

export async function fetchKeyVaultSecrets(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new KeyVaultClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: KEY_VAULT_SERVICE_ENTITY_TYPE },
    async (vaultEntity) => {
      if (vaultEntity.vaultUrl) {
        await client.iterateSecrets(
          vaultEntity.vaultUrl as string,
          async (secret) => {
            const secretEntity = createKeyVaultSecretEntity({
              webLinker,
              data: secret,
              vaultUrl: vaultEntity.vaultUrl as string,
            });
            await jobState.addEntity(secretEntity);

            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.CONTAINS,
                from: vaultEntity,
                to: secretEntity,
              }),
            );
          },
        );
      }
    },
  );
}

export const keyvaultSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: STEP_RM_KEYVAULT_VAULTS,
    name: 'Key Vaults',
    entities: [
      KeyVaultEntities.KEY_VAULT,
      ...diagnosticSettingsEntitiesForResource,
    ],
    relationships: [
      {
        _type: ACCOUNT_KEY_VAULT_RELATIONSHIP_TYPE,
        sourceType: ACCOUNT_ENTITY_TYPE,
        _class: ACCOUNT_KEY_VAULT_RELATIONSHIP_CLASS,
        targetType: KEY_VAULT_SERVICE_ENTITY_TYPE,
      },
      createResourceGroupResourceRelationshipMetadata(
        KEY_VAULT_SERVICE_ENTITY_TYPE,
      ),
      ...getDiagnosticSettingsRelationshipsForResource(
        KeyVaultEntities.KEY_VAULT,
      ),
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchKeyVaults,
  },
  {
    id: KeyVaultStepIds.KEY_VAULT_PRINCIPAL_RELATIONSHIPS,
    name: 'Key Vault to AD Principal Relationships',
    entities: [],
    relationships: [KeyVaultRelationships.KEY_VAULT_ALLOWS_PRINCIPAL],
    dependsOn: [STEP_RM_KEYVAULT_VAULTS],
    executionHandler: buildKeyVaultAccessPolicyRelationships,
  },
  {
    id: STEP_RM_KEYVAULT_KEYS,
    name: 'Key Vault Keys',
    entities: [KeyVaultEntities.KEY_VAULT_KEY],
    relationships: [KeyVaultRelationships.KEY_VAULT_CONTAINS_KEY],
    dependsOn: [STEP_RM_KEYVAULT_VAULTS],
    executionHandler: fetchKeyVaultKeys,
  },
  {
    id: STEP_RM_KEYVAULT_SECRETS,
    name: 'Key Vault Secrets',
    entities: [KeyVaultEntities.KEY_VAULT_SECRET],
    relationships: [KeyVaultRelationships.KEY_VAULT_CONTAINS_SECRET],
    dependsOn: [STEP_RM_KEYVAULT_VAULTS],
    executionHandler: fetchKeyVaultSecrets,
  },
];
