import { Vault } from '@azure/arm-keyvault/esm/models';
import { KeyProperties } from '@azure/keyvault-keys';
import { SecretProperties } from '@azure/keyvault-secrets';
import {
  createIntegrationEntity,
  Entity,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import { normalizeLocation, resourceGroupName } from '../../../azure/utils';
import {
  KEY_VAULT_SERVICE_ENTITY_TYPE,
  KEY_VAULT_SERVICE_ENTITY_CLASS,
  KEY_VAULT_KEY_ENTITY_CLASS,
  KEY_VAULT_KEY_ENTITY_TYPE,
  KEY_VAULT_SECRET_ENTITY_TYPE,
  KEY_VAULT_SECRET_ENTITY_CLASS,
} from './constants';

export function createKeyVaultEntity(
  webLinker: AzureWebLinker,
  data: Vault,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id,
        _type: KEY_VAULT_SERVICE_ENTITY_TYPE,
        _class: KEY_VAULT_SERVICE_ENTITY_CLASS,
        webLink: webLinker.portalResourceUrl(data.id),
        region: normalizeLocation(data.location),
        resourceGroup: resourceGroupName(data.id),
        vaultUrl: data.properties.vaultUri,
        category: ['infrastructure'],
        function: ['key-vault'],
      },
      tagProperties: ['environment'],
    },
  });
}

export function createKeyVaultKeyEntity({
  webLinker,
  data,
  vaultUrl,
}: {
  webLinker: AzureWebLinker;
  data: KeyProperties;
  vaultUrl: string;
}): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: `${vaultUrl}keys/${data.name}`,
        _type: KEY_VAULT_KEY_ENTITY_TYPE,
        _class: KEY_VAULT_KEY_ENTITY_CLASS,
        vaultUrl: data.vaultUrl,
        recoveryLevel: data.recoveryLevel,
        webLink: webLinker.assetResourceUrl(
          `/Microsoft_Azure_KeyVault/key/${vaultUrl}keys/${data.name}`,
        ),
        name: data.name,
        version: data.version,
        enabled: data.enabled,
        notBefore: parseTimePropertyValue(data.notBefore),
        createdOn: parseTimePropertyValue(data.createdOn),
        updatedOn: parseTimePropertyValue(data.updatedOn),
        // 8.1 Ensure that expiration date is set on all keys (automated)
        expiresOn: parseTimePropertyValue(data.expiresOn),
      },
    },
  });
}

export function createKeyVaultSecretEntity({
  webLinker,
  data,
  vaultUrl,
}: {
  webLinker: AzureWebLinker;
  data: SecretProperties;
  vaultUrl: string;
}): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id,
        _type: KEY_VAULT_SECRET_ENTITY_TYPE,
        _class: KEY_VAULT_SECRET_ENTITY_CLASS,
        vaultUrl: data.vaultUrl,
        contentType: data.contentType,
        certificateKeyId: data.certificateKeyId,
        managed: data.managed,
        recoveryLevel: data.recoveryLevel,
        webLink: webLinker.assetResourceUrl(
          `/Microsoft_Azure_KeyVault/Secret/${vaultUrl}keys/${data.name}`,
        ),
        name: data.name,
        version: data.version,
        enabled: data.enabled,
        notBefore: parseTimePropertyValue(data.notBefore),
        createdOn: parseTimePropertyValue(data.createdOn),
        updatedOn: parseTimePropertyValue(data.updatedOn),
        // 8.2 Ensure that the expiration date is set on all Secrets (Automated)
        expiresOn: parseTimePropertyValue(data.expiresOn),
      },
    },
  });
}
