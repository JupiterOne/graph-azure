import {
  fetchStorageResources,
  fetchStorageQueues,
  fetchStorageTables,
} from '.';
import { Recording } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import { setupAzureRecording } from '../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';
let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

test('step - storage accounts', async () => {
  const instanceConfig: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: 'bcd90474-9b62-4040-9d7b-8af257b1427d',
    subscriptionId: '40474ebe-55a2-4071-8fa8-b610acdd8e56',
  };

  const devName = 'keionned';

  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-storage-accounts',
  });

  const context = createMockAzureStepExecutionContext({
    instanceConfig,
    entities: [
      {
        _class: ['Service'],
        _type: 'azure_keyvault_service',
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/${devName}-j1dev`,
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/${devName}-j1dev`,
        name: `${devName}-j1dev`,
        _rawData: [
          {
            name: `${devName}-j1dev`,
            rawData: {
              properties: {
                vaultUri: `https://${devName}-j1dev.vault.azure.net`,
              },
            },
          },
        ],
      },
    ],
    setData: {
      [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
    },
  });

  await fetchStorageResources(context);

  const { collectedEntities, collectedRelationships } = context.jobState;
  const storageAccounts = collectedEntities.filter(
    (e) => e._type === 'azure_storage_account',
  );
  const storageContainers = collectedEntities.filter(
    (e) => e._type === 'azure_storage_container',
  );
  const fileShares = collectedEntities.filter(
    (e) => e._type === 'azure_storage_file_share',
  );

  expect(collectedEntities.length).toBeGreaterThan(0);
  expect(storageAccounts).toMatchGraphObjectSchema({
    _class: ['Service'],
    schema: {
      additionalProperties: true,
      properties: {
        resourceGroup: { type: 'string' },
        region: { type: 'string' },
        kind: {
          type: 'string',
          enum: [
            'Storage',
            'StorageV2',
            'BlobStorage',
            'FileStorage',
            'BlockBlobStorage',
          ],
        },
        sku: {
          type: 'string',
          enum: [
            'Standard_LRS',
            'Standard_GRS',
            'Standard_RAGRS',
            'Standard_ZRS',
            'Premium_LRS',
            'Premium_ZRS',
            'Standard_GZRS',
            'Standard_RAGZRS',
          ],
        },
        encryptedFileShare: { type: 'boolean' },
        encryptedBlob: { type: 'boolean' },
        encryptedTable: { type: 'boolean' },
        encryptedQueue: { type: 'boolean' },
        enableHttpsTrafficOnly: { type: 'boolean' },
        endpoints: { type: 'array', items: { type: 'string' } },
        allowBlobPublicAccess: { type: 'boolean' },
        'encryption.keySource': { type: 'string' },
        'encryption.keyVaultProperties.keyName': { type: 'string' },
        'encryption.keyVaultProperties.keyVersion': { type: 'string' },
        'encryption.keyVaultProperties.keyVaultUri': { type: 'string' },
      },
    },
  });
  expect(storageContainers).toMatchGraphObjectSchema({
    _class: ['DataStore'],
    schema: {
      additionalProperties: true,
      properties: {
        public: { type: 'boolean' },
        resourceGroup: { type: 'string' },
        publicAccess: { type: 'string', enum: ['Container', 'Blob', 'None'] },
        encrypted: { type: 'boolean' },
      },
    },
  });
  expect(fileShares).toMatchGraphObjectSchema({
    _class: ['DataStore'],
    schema: {
      additionalProperties: true,
      properties: {
        resourceGroup: { type: 'string' },
        encrypted: { type: 'boolean' },
      },
    },
  });

  /**
   * NOTE: This relationship will not exist if you do not run the terraform to produce a Log Profile (monitor.tf)
   * To ensure this test passes, do not delete the recording, or enable the flag to create a Log Profile in monitor.tf
   */
  expect(collectedRelationships).toContainEqual(
    expect.objectContaining({
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev_log_profile_resource_group/providers/Microsoft.Storage/storageAccounts/j1devlogprofilestrgacct|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev_log_profile_resource_group/providers/Microsoft.Storage/storageAccounts/j1devlogprofilestrgacct/blobServices/default/containers/insights-operational-logs`,
      _type: 'azure_storage_account_has_container',
      _class: 'HAS',
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev_log_profile_resource_group/providers/Microsoft.Storage/storageAccounts/j1devlogprofilestrgacct`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev_log_profile_resource_group/providers/Microsoft.Storage/storageAccounts/j1devlogprofilestrgacct/blobServices/default/containers/insights-operational-logs`,
      displayName: 'HAS',
    }),
  );
  expect(collectedRelationships).toContainEqual(
    expect.objectContaining({
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/keionnedj1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/keionnedj1dev/blobServices/default/containers/j1dev`,
      _type: 'azure_storage_account_has_container',
      _class: 'HAS',
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/keionnedj1dev`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/keionnedj1dev/blobServices/default/containers/j1dev`,
      displayName: 'HAS',
    }),
  );
  expect(collectedRelationships).toContainEqual(
    expect.objectContaining({
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/keionnedj1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/keionnedj1dev/fileServices/default/shares/j1dev`,
      _type: 'azure_storage_account_has_file_share',
      _class: 'HAS',
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/keionnedj1dev`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/keionnedj1dev/fileServices/default/shares/j1dev`,
      displayName: 'HAS',
    }),
  );

  /**
   * NOTE: This test will fail unless it is run against the original recording or you manually setup custom encryption on a Storage Account in the Azure Portal.
   * This is because it is currently not possible to setup custom encryption properties on a Storage Account using terraform.
   * This was done to test CIS Benchmark 5.16 ( Ensure the storage account containing the container with activity logs is encrypted with BYOK (Use Your Own Key))
   * To manually setup custom encryption in the Azure Portal on a Storage Account, Go to Monitor -> {Your Storage Account} -> Encryption -> Customer Managed Keys -> { Select a Key Vault and Key } -> Save
   * Be sure your user has the correct access to Get, List, and Create keys in the Key Vault you select. If your Azure user does not, manage the Access Policies of the Key Vault you want to use.
   */
  expect(collectedRelationships).toContainEqual(
    expect.objectContaining({
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${devName}j1dev|uses|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/${devName}-j1dev`,
      _type: 'azure_storage_account_uses_keyvault_service',
      _class: 'USES',
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${devName}j1dev`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/${devName}-j1dev`,
      displayName: 'USES',
      keyName: 'myKey',
      keyVaultUri: `https://${devName}-j1dev.vault.azure.net`,
      keyVersion: '',
    }),
  );
});

test('step - storage queues', async () => {
  const instanceConfig: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
    subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
  };

  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-storage-queues',
  });

  const context = createMockAzureStepExecutionContext({
    instanceConfig,
    entities: [
      {
        _class: ['Service'],
        _type: 'azure_storage_account',
        _key: `/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/ndowmon1j1dev`,
        id: `/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/ndowmon1j1dev`,
        name: `ndowmon1j1dev`,
        kind: 'StorageV2',
      },
      {
        _class: ['Service'],
        _type: 'azure_storage_account',
        _key: `/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/ndowmon1j1devblobstorage`,
        id: `/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/ndowmon1j1devblobstorage`,
        name: `ndowmon1j1devblobstorage`,
        kind: 'BlockBlobStorage',
      },
    ],
    setData: {
      [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
    },
  });

  await fetchStorageQueues(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: 'Queue',
    schema: {
      additionalProperties: false,
      properties: {
        _type: { const: 'azure_storage_queue' },
        _key: { type: 'string' },
        _class: { type: 'array', items: { const: 'Queue' } },
        id: { type: 'string' },
        name: { type: 'string' },
        displayName: { type: 'string' },
        type: { type: 'string' },
        resourceGroup: { type: 'string' },
        encrypted: { type: 'boolean' },
        _rawData: { type: 'array', items: { type: 'object' } },
      },
    },
  });
  expect(context.jobState.collectedRelationships.length).toEqual(1);
  expect(context.jobState.collectedRelationships).toEqual([
    {
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/ndowmon1j1dev|has|/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/ndowmon1j1dev/queueServices/default/queues/j1dev',
      _type: 'azure_storage_account_has_queue',
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/ndowmon1j1dev',
      _toEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/ndowmon1j1dev/queueServices/default/queues/j1dev',
      displayName: 'HAS',
    },
  ]);
});

test('step - storage tables', async () => {
  const instanceConfig: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
    subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
  };

  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-storage-tables',
    options: {
      recordFailedRequests: true,
    },
  });

  const context = createMockAzureStepExecutionContext({
    instanceConfig,
    entities: [
      {
        _class: ['Service'],
        _type: 'azure_storage_account',
        _key: `/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/ndowmon1j1dev`,
        id: `/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/ndowmon1j1dev`,
        name: `ndowmon1j1dev`,
        kind: 'StorageV2',
      },
      {
        _class: ['Service'],
        _type: 'azure_storage_account',
        _key: `/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/ndowmon1j1devblobstorage`,
        id: `/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/ndowmon1j1devblobstorage`,
        name: `ndowmon1j1devblobstorage`,
        kind: 'BlockBlobStorage',
      },
    ],
    setData: {
      [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
    },
  });

  await fetchStorageTables(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: ['DataStore', 'Database'],
    schema: {
      additionalProperties: false,
      properties: {
        _type: { const: 'azure_storage_table' },
        _key: { type: 'string' },
        _class: { type: 'array', items: { const: ['DataStore', 'Database'] } },
        id: { type: 'string' },
        name: { type: 'string' },
        displayName: { type: 'string' },
        tableName: { type: 'string' },
        type: { type: 'string' },
        resourceGroup: { type: 'string' },
        classification: { type: 'null' },
        encrypted: { type: 'boolean' },
        _rawData: { type: 'array', items: { type: 'object' } },
      },
    },
  });
  expect(context.jobState.collectedRelationships.length).toEqual(1);
  expect(context.jobState.collectedRelationships).toEqual([
    {
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/ndowmon1j1dev|has|/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/ndowmon1j1dev/tableServices/default/tables/j1dev',
      _type: 'azure_storage_account_has_table',
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/ndowmon1j1dev',
      _toEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/ndowmon1j1dev/tableServices/default/tables/j1dev',
      displayName: 'HAS',
    },
  ]);
});
