import { Vault } from '@azure/arm-keyvault/esm/models';
import { KeyProperties } from '@azure/keyvault-keys';
import {
  createIntegrationEntity,
  Entity,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import { normalizeLocation, resourceGroupName } from '../../../azure/utils';
import { entities } from './constants';

export function createKeyVaultEntity(
  webLinker: AzureWebLinker,
  data: Vault,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id,
        _type: entities.KEY_VAULT._type,
        _class: entities.KEY_VAULT._class,
        webLink: webLinker.portalResourceUrl(data.id),
        region: normalizeLocation(data.location),
        resourceGroup: resourceGroupName(data.id),
        endpoints: data.properties.vaultUri && [data.properties.vaultUri],
        category: ['infrastructure'],
      },
      tagProperties: ['environment'],
    },
  });
}

/**
 * This API does not return an ID, but a KID:
 *
 * {
 *   createdOn: 2021-03-09T14:05:30.000Z,
 *   updatedOn: 2021-03-09T14:05:30.000Z,
 *   vaultUrl: 'https://ndowmon11-j1dev.vault.azure.net',
 *   kid: 'https://ndowmon11-j1dev.vault.azure.net/keys/j1dev',
 *   tags: {},
 *   name: 'j1dev',
 *   version: undefined,
 *   enabled: true,
 *   created: 2021-03-09T14:05:30.000Z,
 *   updated: 2021-03-09T14:05:30.000Z,
 *   recoveryLevel: 'CustomizedRecoverable'
 * }
 */
interface J1KeyProperties extends KeyProperties {
  // id: never,
  kid?: string;
}

export function createKeyEntity(
  webLinker: AzureWebLinker,
  data: J1KeyProperties,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.kid,
        _type: entities.KEY._type,
        _class: entities.KEY._class,
        id: data.kid,
        kid: data.kid,
        name: data.name,
        vaultUrl: data.vaultUrl,
        version: data.version,
        enabled: data.enabled,
        recoveryLevel: data.recoveryLevel,
        notBefore: parseTimePropertyValue(data.notBefore),
        expiresOn: parseTimePropertyValue(data.expiresOn),
        createdOn: parseTimePropertyValue(data.createdOn),
        updatedOn: parseTimePropertyValue(data.updatedOn),
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}
