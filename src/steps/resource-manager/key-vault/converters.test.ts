import { createAzureWebLinker } from '../../../azure';
import {
  createKeyVaultEntity,
  createKeyVaultKeyEntity,
  createKeyVaultSecretEntity,
} from './converters';
import { Vault } from '@azure/arm-keyvault/esm/models';
import { KeyProperties } from '@azure/keyvault-keys';
import { SecretProperties } from '@azure/keyvault-secrets';
import { parseTimePropertyValue } from '@jupiterone/integration-sdk-core';

const webLinker = createAzureWebLinker('something.onmicrosoft.com');

describe('createKeyVaultEntity', () => {
  const data: Vault = {
    id:
      '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/j1dev',
    name: 'j1dev',
    type: 'Microsoft.KeyVault/vaults',
    location: 'eastus',
    tags: {
      environment: 'j1dev',
      classification: 'production',
    },
    properties: {
      sku: {
        // family: "A",
        name: 'standard',
      },
      tenantId: 'a76fc728-0cba-45f0-a9eb-d45207e14513',
      networkAcls: {
        bypass: 'AzureServices',
        defaultAction: 'Deny',
        ipRules: [],
        virtualNetworkRules: [],
      },
      accessPolicies: [
        {
          tenantId: 'a76fc728-0cba-45f0-a9eb-d45207e14513',
          objectId: 'f3978934-b53d-4d34-bc11-afc1bb409cd8',
          permissions: {
            keys: ['get'],
            secrets: ['get'],
            certificates: [],
            storage: [],
          },
        },
      ],
      enabledForDeployment: false,
      enabledForDiskEncryption: true,
      enabledForTemplateDeployment: false,
      vaultUri: 'https://j1dev.vault.azure.net/',
      // provisioningState: "Succeeded",
      enablePurgeProtection: true,
      enableSoftDelete: true,
    },
  };

  test('properties', () => {
    expect(createKeyVaultEntity(webLinker, data)).toEqual({
      _class: ['Service'],
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/j1dev',
      _rawData: [
        {
          name: 'default',
          rawData: data,
        },
      ],
      _type: 'azure_keyvault_service',
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/j1dev',
      createdOn: undefined,
      displayName: 'j1dev',
      name: 'j1dev',
      region: 'eastus',
      resourceGroup: 'j1dev',
      'tag.environment': 'j1dev',
      'tag.classification': 'production',
      environment: 'j1dev',
      function: ['key-vault'],
      classification: 'production',
      enablePurgeProtection: true,
      enableSoftDelete: true,
      webLink:
        'https://portal.azure.com/#@something.onmicrosoft.com/resource/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/j1dev',
      category: ['infrastructure'],
      vaultUrl: 'https://j1dev.vault.azure.net/',
    });
  });
});

describe('createKeyVaultKeyEntity', () => {
  const data: KeyProperties = {
    name: 'j1-key',
    vaultUrl: 'https://j1dev.vault.azure.net/',
    enabled: true,
    expiresOn: new Date('2021-09-20T08:57:43.971Z'),
  };

  test('properties', () => {
    const date = new Date('2021-09-20T08:57:43.971Z');

    expect(
      createKeyVaultKeyEntity({
        webLinker,
        data,
        vaultUrl: 'https://j1dev.vault.azure.net/',
      }),
    ).toEqual({
      _class: ['Key'],
      _key: 'https://j1dev.vault.azure.net/keys/j1-key',
      _rawData: [
        {
          name: 'default',
          rawData: data,
        },
      ],
      _type: 'azure_keyvault_key',
      webLink:
        'https://portal.azure.com/#@something.onmicrosoft.com/asset/Microsoft_Azure_KeyVault/key/https://j1dev.vault.azure.net/keys/j1-key',
      name: 'j1-key',
      enabled: true,
      expiresOn: parseTimePropertyValue(date),
      notBefore: undefined,
      recoveryLevel: undefined,
      updatedOn: undefined,
      createdOn: undefined,
      displayName: 'j1-key',
      vaultUrl: 'https://j1dev.vault.azure.net/',
      version: undefined,
    });
  });
});

describe('createKeyVaultSecretEntity', () => {
  const data: SecretProperties = {
    id:
      '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/j1dev/secrets/j1-secret',
    name: 'j1-secret',
    vaultUrl: 'https://j1dev.vault.azure.net/',
    enabled: true,
    expiresOn: new Date('2021-09-20T08:57:43.971Z'),
  };

  test('properties', () => {
    const date = new Date('2021-09-20T08:57:43.971Z');

    expect(
      createKeyVaultSecretEntity({
        webLinker,
        data,
        vaultUrl: 'https://j1dev.vault.azure.net/',
      }),
    ).toEqual({
      _class: ['Secret'],
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/j1dev/secrets/j1-secret',
      _rawData: [
        {
          name: 'default',
          rawData: data,
        },
      ],
      _type: 'azure_keyvault_secret',
      webLink:
        'https://portal.azure.com/#@something.onmicrosoft.com/asset/Microsoft_Azure_KeyVault/Secret/https://j1dev.vault.azure.net/keys/j1-secret',
      name: 'j1-secret',
      certificateKeyId: undefined,
      contentType: undefined,
      enabled: true,
      expiresOn: parseTimePropertyValue(date),
      createdOn: undefined,
      updatedOn: undefined,
      managed: undefined,
      notBefore: undefined,
      recoveryLevel: undefined,
      vaultUrl: 'https://j1dev.vault.azure.net/',
      displayName: 'j1-secret',
      version: undefined,
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/j1dev/secrets/j1-secret',
    });
  });
});
