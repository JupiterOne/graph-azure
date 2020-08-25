import { Vault } from '@azure/arm-keyvault/esm/models';
import {
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import { normalizeLocation, resourceGroupName } from '../../../azure/utils';
import {
  KEY_VAULT_SERVICE_ENTITY_TYPE,
  KEY_VAULT_SERVICE_ENTITY_CLASS,
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
        endpoints: data.properties.vaultUri && [data.properties.vaultUri],
        category: ['infrastructure'],
      },
      tagProperties: ['environment'],
    },
  });
}
