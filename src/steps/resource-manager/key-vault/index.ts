import {
  createDirectRelationship,
  RelationshipClass,
  getRawData,
  createMappedRelationship,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, AzureIntegrationStep } from '../../../types';
import { STEP_AD_ACCOUNT } from '../../active-directory/constants';
import { KeyVaultClient } from './client';
import {
  KEY_VAULT_SERVICE_ENTITY_TYPE,
  STEP_RM_KEYVAULT_VAULTS,
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
import { INGESTION_SOURCE_IDS } from '../../../constants';
import { steps as storageSteps } from '../storage/constants';
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

export async function buildDiagosticSettingsRelationships(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState } = executionContext;
  await jobState.iterateEntities(
    { _type: KeyVaultEntities.KEY_VAULT._type },
    async (vaultEntity) => {
      await createDiagnosticSettingsEntitiesAndRelationshipsForResource(
        executionContext,
        vaultEntity,
        KeyVaultEntities.KEY_VAULT,
      );
    },
  );
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
        const _key = `${keyVaultEntity._key}|allows|${accessPolicy.objectId}|application?|${accessPolicy.applicationId}}`;
        await jobState.addRelationship(
          createMappedRelationship({
            source: keyVaultEntity,
            _key,
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

export const keyvaultSteps: AzureIntegrationStep[] = [
  {
    id: STEP_RM_KEYVAULT_VAULTS,
    name: 'Key Vaults',
    entities: [KeyVaultEntities.KEY_VAULT],
    relationships: [
      KeyVaultRelationships.ACCOUNT_HAS_KEY_VAULT,
      createResourceGroupResourceRelationshipMetadata(
        KEY_VAULT_SERVICE_ENTITY_TYPE,
      ),
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchKeyVaults,
    rolePermissions: ['Microsoft.KeyVault/vaults/read'],
    ingestionSourceId: INGESTION_SOURCE_IDS.KEY_VAULT,
  },
  // {
  //   id: KeyVaultStepIds.KEY_VAULT_DIAGNOSTIC_SETTINGS,
  //   name: 'Key Vault Diagnostic Settings',
  //   entities: [...diagnosticSettingsEntitiesForResource],
  //   relationships: [
  //     ...getDiagnosticSettingsRelationshipsForResource(
  //       KeyVaultEntities.KEY_VAULT,
  //     ),
  //   ],
  //   dependsOn: [STEP_RM_KEYVAULT_VAULTS, storageSteps.STORAGE_ACCOUNTS],
  //   rolePermissions: ['Microsoft.Insights/DiagnosticSettings/Read'],
  //   executionHandler: buildDiagosticSettingsRelationships,
  //   ingestionSourceId: INGESTION_SOURCE_IDS.KEY_VAULT,
  // },
  // {
  //   id: KeyVaultStepIds.KEY_VAULT_PRINCIPAL_RELATIONSHIPS,
  //   name: 'Key Vault to AD Principal Relationships',
  //   entities: [],
  //   relationships: [KeyVaultRelationships.KEY_VAULT_ALLOWS_PRINCIPAL],
  //   dependsOn: [STEP_RM_KEYVAULT_VAULTS],
  //   executionHandler: buildKeyVaultAccessPolicyRelationships,
  //   ingestionSourceId: INGESTION_SOURCE_IDS.KEY_VAULT,
  // },
  // {
  //   id: STEP_RM_KEYVAULT_KEYS,
  //   name: 'Key Vault Keys',
  //   entities: [KeyVaultEntities.KEY_VAULT_KEY],
  //   relationships: [KeyVaultRelationships.KEY_VAULT_CONTAINS_KEY],
  //   dependsOn: [STEP_RM_KEYVAULT_VAULTS],
  //   executionHandler: fetchKeyVaultKeys,
  //   rolePermissions: ['Microsoft.KeyVault/vaults/keys/read'],
  //   ingestionSourceId: INGESTION_SOURCE_IDS.KEY_VAULT,
  // },
  {
    id: STEP_RM_KEYVAULT_SECRETS,
    name: 'Key Vault Secrets',
    entities: [KeyVaultEntities.KEY_VAULT_SECRET],
    relationships: [KeyVaultRelationships.KEY_VAULT_CONTAINS_SECRET],
    dependsOn: [STEP_RM_KEYVAULT_VAULTS],
    executionHandler: fetchKeyVaultSecrets,
    rolePermissions: ['Microsoft.KeyVault/vaults/secrets/read'],
    ingestionSourceId: INGESTION_SOURCE_IDS.KEY_VAULT,
  },
];
