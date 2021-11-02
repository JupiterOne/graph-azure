import { Vault } from '@azure/arm-keyvault/esm/models';
import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';

import {
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import config from '../../../../test/integrationInstanceConfig';
import { KeyVaultClient } from './client';

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

describe('iterateKeyVaults', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateKeyVaults',
    });

    const client = new KeyVaultClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const resources: Vault[] = [];
    await client.iterateKeyVaults((e) => {
      resources.push(e);
    });

    expect(resources).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: 'j1dev',
        tags: expect.objectContaining({
          environment: 'j1dev',
        }),
      }),
    ]);
  });
});

describe('iterateKeys', () => {
  test('listing forbidden does not invoke the callback', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateKeysListForbidden',
      options: {
        recordFailedRequests: true,
      },
    });

    const vault = {
      properties: {
        vaultUri: 'https://j1dev.vault.azure.net/',
      },
    } as Vault;
    const client = new KeyVaultClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const callback = jest.fn();
    await client.iterateKeys(vault.properties.vaultUri as string, callback);

    expect(callback).not.toHaveBeenCalled();
  });
});
