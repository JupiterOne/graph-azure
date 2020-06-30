import { KeyVaultManagementClient } from '@azure/arm-keyvault';
import { Vault } from '@azure/arm-keyvault/esm/models';
import { KeyClient, KeyProperties } from '@azure/keyvault-keys';

import {
  Client,
  iterateAllResources,
} from '../../../azure/resource-manager/client';
import { resourceGroupName, resourceName } from '../../../azure/utils';

export class KeyVaultClient extends Client {
  public async iterateKeyVaults(
    callback: (
      resource: Vault,
      serviceClient: KeyVaultManagementClient,
    ) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      KeyVaultManagementClient,
    );

    await iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.vaults,
      resourceDescription: 'keyvault.vaults',
      callback: async (vault: Vault, client) => {
        const vaultWithProperties = await client.vaults.get(
          resourceGroupName(vault.id, true),
          resourceName(vault),
        );
        await callback(vaultWithProperties, client);
      },
    });
  }

  public async iterateKeys(
    vault: Vault,
    callback: (resource: KeyProperties) => void | Promise<void>,
  ): Promise<void> {
    const vaultUri = vault.properties.vaultUri;
    if (!vaultUri) {
      throw new Error('Vault does not include vaultUri, cannot iterate keys');
    } else {
      const client = new KeyClient(vaultUri, this.getClientSecretCredentials());
      try {
        for await (const properties of client.listPropertiesOfKeys()) {
          await callback(properties);
        }
      } catch (err) {
        if (err.statusCode !== 403) {
          throw err;
        }
      }
    }
  }
}
