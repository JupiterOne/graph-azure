import { Vault } from '@azure/arm-keyvault/esm/models';
import { createIntegrationEntity, Entity } from '@jupiterone/integration-sdk';

import { AzureWebLinker } from '../../../azure';
import { normalizeLocation, resourceGroupName } from '../../../azure/utils';

export function createKeyVaultEntity(
  webLinker: AzureWebLinker,
  data: Vault,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id,
        _type: 'azure_keyvault_service',
        _class: ['Service'],
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
