import {
  BlobContainer,
  FileShare,
  StorageAccount,
  StorageQueue,
} from '@azure/arm-storage/esm/models';
import { BlobServiceProperties } from '@azure/storage-blob';

import { createAzureWebLinker } from '../../../azure';
import {
  createStorageContainerEntity,
  createStorageFileShareEntity,
  createStorageAccountEntity,
  createStorageQueueEntity,
} from './converters';
import { Entity } from '@jupiterone/integration-sdk-core';
import { entities } from './constants';
import { QueueServiceProperties } from '@azure/storage-queue';

const webLinker = createAzureWebLinker('something.onmicrosoft.com');

describe('createStorageAccountEntity', () => {
  function createMockStorageAccount(
    storageAccount?: Partial<StorageAccount>,
  ): StorageAccount {
    return {
      sku: {
        name: 'Standard_LRS',
        tier: 'Standard',
      },
      kind: 'Storage',
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev',
      name: 'j1dev',
      type: 'Microsoft.Storage/storageAccounts',
      location: 'eastus',
      tags: {
        environment: 'j1dev',
      },
      privateEndpointConnections: [],
      isHnsEnabled: false,
      encryption: {
        services: {
          file: {
            enabled: true,
            lastEnabledTime: new Date('2019-10-09T18:53:02.2416314Z'),
          },
          blob: {
            enabled: true,
            lastEnabledTime: new Date('2019-10-09T18:53:02.2416314Z'),
          },
        },
        keySource: 'Microsoft.Keyvault',
        keyVaultProperties: {
          keyName: 'test',
          keyVersion: 'version',
          keyVaultUri: 'testUri',
        },
      },
      provisioningState: 'Succeeded',
      creationTime: new Date('2020-04-10T15:43:34.2993802Z'),
      primaryEndpoints: {
        blob: 'https://j1dev.blob.core.windows.net/',
        queue: 'https://j1dev.queue.core.windows.net/',
        table: 'https://j1dev.table.core.windows.net/',
        file: 'https://j1dev.file.core.windows.net/',
        microsoftEndpoints: {
          blob: 'https://j1dev.blob.core.windows.net/microsoft-endpoint',
          queue: 'https://j1dev.queue.core.windows.net/microsoft-endpoint',
          table: 'https://j1dev.table.core.windows.net/microsoft-endpoint',
          file: 'https://j1dev.file.core.windows.net/microsoft-endpoint',
        },
      },
      primaryLocation: 'eastus',
      statusOfPrimary: 'available',
      allowBlobPublicAccess: false,
      ...storageAccount,
    };
  }

  function createMockBlobServiceProperties(
    blobServiceProperties?: Partial<BlobServiceProperties>,
  ): BlobServiceProperties {
    return {
      blobAnalyticsLogging: {
        version: '1.0',
        deleteProperty: true,
        read: true,
        write: true,
        retentionPolicy: { enabled: true, days: 7 },
      },
      cors: [],
      deleteRetentionPolicy: { enabled: true, days: 7 },
      ...blobServiceProperties,
    };
  }

  function createMockQueueServiceProperties(
    queueServiceProperties?: Partial<QueueServiceProperties>,
  ): QueueServiceProperties {
    return {
      queueAnalyticsLogging: {
        version: '1.0',
        deleteProperty: true,
        read: true,
        write: true,
        retentionPolicy: { enabled: true, days: 7 },
      },
      cors: [],
      ...queueServiceProperties,
    };
  }

  test('Storage (Classic)', () => {
    const data = createMockStorageAccount();
    const blobServiceProperties = createMockBlobServiceProperties();
    const queueServiceProperties = createMockQueueServiceProperties();
    const entity = {
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev',
      _type: 'azure_storage_account',
      _class: ['Service'],
      _rawData: [
        { name: 'default', rawData: data },
        { name: 'blobServiceProperties', rawData: blobServiceProperties },
        { name: 'queueServiceProperties', rawData: queueServiceProperties },
      ],
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev',
      name: 'j1dev',
      displayName: 'j1dev',
      region: 'eastus',
      environment: 'j1dev',
      encryptedBlob: true,
      encryptedFileShare: true,
      webLink: webLinker.portalResourceUrl(
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev',
      ),
      kind: 'Storage',
      sku: 'Standard_LRS',
      resourceGroup: 'j1dev',
      category: ['infrastructure'],
      endpoints: [
        'https://j1dev.blob.core.windows.net/',
        'https://j1dev.queue.core.windows.net/',
        'https://j1dev.table.core.windows.net/',
        'https://j1dev.file.core.windows.net/',
        'https://j1dev.blob.core.windows.net/microsoft-endpoint',
        'https://j1dev.queue.core.windows.net/microsoft-endpoint',
        'https://j1dev.table.core.windows.net/microsoft-endpoint',
        'https://j1dev.file.core.windows.net/microsoft-endpoint',
      ],
      createdOn: new Date('2020-04-10T15:43:34.2993802Z').getTime(),
      'tag.environment': 'j1dev',
      allowBlobPublicAccess: false,
      'encryption.keySource': 'Microsoft.Keyvault',
      'encryption.keyVaultProperties.keyName': 'test',
      'encryption.keyVaultProperties.keyVaultUri': 'testUri',
      'encryption.keyVaultProperties.keyVersion': 'version',
      blobSoftDeleteEnabled: true,
      blobSoftDeleteRetentionDays: 7,
      blobAnalyticsLoggingReadEnabled: true,
      blobAnalyticsLoggingWriteEnabled: true,
      blobAnalyticsLoggingDeleteEnabled: true,
      queueAnalyticsLoggingReadEnabled: true,
      queueAnalyticsLoggingWriteEnabled: true,
      queueAnalyticsLoggingDeleteEnabled: true,
    };

    const storageAccountEntity = createStorageAccountEntity(webLinker, data, {
      blob: blobServiceProperties,
      queue: queueServiceProperties,
    });
    expect(storageAccountEntity).toMatchGraphObjectSchema({
      _class: entities.STORAGE_ACCOUNT._class,
      schema: {
        additionalProperties: true,
        properties: {
          allowBlobPublicAccess: { type: 'boolean' },
          'encryption.keySource': { type: 'string' },
          'encryption.keyVaultProperties.keyName': { type: 'string' },
          'encryption.keyVaultProperties.keyVersion': { type: 'string' },
          'encryption.keyVaultProperties.keyVaultUri': { type: 'string' },
        },
      },
    });
    expect(storageAccountEntity).toEqual(entity);
  });
});

describe('createStorageBlobContainerEntity', () => {
  const storageAccount: StorageAccount = {
    sku: {
      name: 'Standard_LRS',
      tier: 'Standard',
    },
    kind: 'Storage',
    id:
      '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev',
    name: 'j1dev',
    type: 'Microsoft.Storage/storageAccounts',
    location: 'eastus',
    tags: {
      environment: 'j1dev',
    },
    privateEndpointConnections: [],
    isHnsEnabled: false,
    encryption: {
      services: {
        file: {
          enabled: true,
          lastEnabledTime: new Date('2019-10-09T18:53:02.2416314Z'),
        },
        blob: {
          enabled: true,
          lastEnabledTime: new Date('2019-10-09T18:53:02.2416314Z'),
        },
      },
      keySource: 'Microsoft.Storage',
    },
    provisioningState: 'Succeeded',
    creationTime: new Date('2020-04-10T15:43:34.2993802Z'),
    primaryEndpoints: {
      blob: 'https://j1dev.blob.core.windows.net/',
      queue: 'https://j1dev.queue.core.windows.net/',
      table: 'https://j1dev.table.core.windows.net/',
      file: 'https://j1dev.file.core.windows.net/',
    },
    primaryLocation: 'eastus',
    statusOfPrimary: 'available',
  };

  const data: BlobContainer = {
    id:
      '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev/blobServices/default/containers/bootdiagnostics-j1dev-58e204bf-f42b-4fdf-ac34-37409045a752',
    name: 'bootdiagnostics-j1dev-58e204bf-f42b-4fdf-ac34-37409045a752',
    type: 'Microsoft.Storage/storageAccounts/blobServices/containers',
    etag: '"0x8D76DE4341D7231"',
    publicAccess: 'None',
    leaseStatus: 'Unlocked',
    leaseState: 'Available',
    lastModifiedTime: new Date('2019-11-20T18:05:19.0000000Z'),
    hasImmutabilityPolicy: false,
    hasLegalHold: false,
  };

  const entity = {
    _key:
      '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev/blobServices/default/containers/bootdiagnostics-j1dev-58e204bf-f42b-4fdf-ac34-37409045a752',
    _type: 'azure_storage_container',
    _class: ['DataStore'],
    _rawData: [{ name: 'default', rawData: data }],
    createdOn: undefined,
    id:
      '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev/blobServices/default/containers/bootdiagnostics-j1dev-58e204bf-f42b-4fdf-ac34-37409045a752',
    name: 'bootdiagnostics-j1dev-58e204bf-f42b-4fdf-ac34-37409045a752',
    displayName: 'bootdiagnostics-j1dev-58e204bf-f42b-4fdf-ac34-37409045a752',
    webLink: webLinker.portalResourceUrl(
      '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev/blobServices/default/containers/bootdiagnostics-j1dev-58e204bf-f42b-4fdf-ac34-37409045a752',
    ),
    resourceGroup: 'j1dev',
    public: false,
    publicAccess: 'None',
    classification: null,
    encrypted: true,
  };

  test('properties transferred', () => {
    const storageAccountEntity = createStorageAccountEntity(
      webLinker,
      storageAccount,
      { blob: {}, queue: {} },
    );
    const storageContainerEntity = createStorageContainerEntity(
      webLinker,
      storageAccountEntity,
      data,
    );
    expect(storageContainerEntity).toMatchGraphObjectSchema({
      _class: entities.STORAGE_CONTAINER._class,
    });
    expect(storageContainerEntity).toEqual(entity);
  });

  test('public container', () => {
    const storageAccountEntity = createStorageAccountEntity(
      webLinker,
      storageAccount,
      { blob: {}, queue: {} },
    );
    const storageContainerEntity = createStorageContainerEntity(
      webLinker,
      storageAccountEntity,
      {
        ...data,
        publicAccess: 'Container',
      },
    );
    expect(storageContainerEntity).toMatchGraphObjectSchema({
      _class: entities.STORAGE_CONTAINER._class,
    });
    expect(storageContainerEntity).toEqual({
      ...entity,
      _rawData: [
        { name: 'default', rawData: { ...data, publicAccess: 'Container' } },
      ],
      public: true,
      publicAccess: 'Container',
    });
  });

  test('public blob', () => {
    const storageAccountEntity = createStorageAccountEntity(
      webLinker,
      storageAccount,
      { blob: {}, queue: {} },
    );
    const storageContainerEntity = createStorageContainerEntity(
      webLinker,
      storageAccountEntity,
      {
        ...data,
        publicAccess: 'Blob',
      },
    );
    expect(storageContainerEntity).toMatchGraphObjectSchema({
      _class: entities.STORAGE_CONTAINER._class,
    });
    expect(storageContainerEntity).toEqual({
      ...entity,
      _rawData: [
        { name: 'default', rawData: { ...data, publicAccess: 'Blob' } },
      ],
      public: true,
      publicAccess: 'Blob',
    });
  });

  test('encryption enabled', () => {
    const storageAccountEntity = createStorageAccountEntity(
      webLinker,
      {
        ...storageAccount,
        encryption: {
          keySource: 'Microsoft.Storage',
          services: {
            ...storageAccount.encryption?.services,
            blob: { enabled: true },
          },
        },
      },
      { blob: {}, queue: {} },
    );

    const storageContainerEntity = createStorageContainerEntity(
      webLinker,
      storageAccountEntity,
      data,
    );
    expect(storageContainerEntity).toMatchGraphObjectSchema({
      _class: entities.STORAGE_CONTAINER._class,
    });

    expect(storageContainerEntity).toEqual({
      ...entity,
      encrypted: true,
    });
  });

  test('encryption not enabled', () => {
    const storageAccountEntity = createStorageAccountEntity(
      webLinker,
      {
        ...storageAccount,
        encryption: {
          keySource: 'Microsoft.Storage',
          services: {
            ...storageAccount.encryption?.services,
            blob: { enabled: false },
          },
        },
      },
      { blob: {}, queue: {} },
    );

    const storageContainerEntity = createStorageContainerEntity(
      webLinker,
      storageAccountEntity,
      data,
    );
    expect(storageContainerEntity).toMatchGraphObjectSchema({
      _class: entities.STORAGE_CONTAINER._class,
    });

    expect(storageContainerEntity).toEqual({
      ...entity,
      encrypted: false,
    });
  });

  test('encryption service not provided', () => {
    const storageAccountEntity = createStorageAccountEntity(
      webLinker,
      {
        ...storageAccount,
        encryption: { keySource: 'Microsoft.Storage', services: {} },
      },
      { blob: {}, queue: {} },
    );
    const storageContainerEntity = createStorageContainerEntity(
      webLinker,
      storageAccountEntity,
      data,
    );
    expect(storageContainerEntity).toMatchGraphObjectSchema({
      _class: entities.STORAGE_CONTAINER._class,
    });

    expect(storageContainerEntity).toEqual({
      ...entity,
      encrypted: false,
    });
  });
});

describe('createStorageFileShareEntity', () => {
  const storageAccount: StorageAccount = {
    sku: {
      name: 'Standard_LRS',
      tier: 'Standard',
    },
    kind: 'Storage',
    id:
      '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev',
    name: 'j1dev',
    type: 'Microsoft.Storage/storageAccounts',
    location: 'eastus',
    tags: {
      environment: 'j1dev',
    },
    privateEndpointConnections: [],
    isHnsEnabled: false,
    encryption: {
      services: {
        file: {
          enabled: true,
          lastEnabledTime: new Date('2019-10-09T18:53:02.2416314Z'),
        },
        blob: {
          enabled: true,
          lastEnabledTime: new Date('2019-10-09T18:53:02.2416314Z'),
        },
      },
      keySource: 'Microsoft.Storage',
    },
    provisioningState: 'Succeeded',
    creationTime: new Date('2020-04-10T15:43:34.2993802Z'),
    primaryEndpoints: {
      blob: 'https://j1dev.blob.core.windows.net/',
      queue: 'https://j1dev.queue.core.windows.net/',
      table: 'https://j1dev.table.core.windows.net/',
      file: 'https://j1dev.file.core.windows.net/',
    },
    primaryLocation: 'eastus',
    statusOfPrimary: 'available',
  };

  const data: FileShare = {
    id:
      '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev/fileServices/default/shares/j1dev',
    name: 'j1dev',
    type: 'Microsoft.Storage/storageAccounts/fileServices/shares',
    etag: '"0x8D7E204B44F2A95"',
    lastModifiedTime: new Date('2020-04-16T12:50:12.0000000Z'),
    shareQuota: 1,
    // enabledProtocols: "SMB",
  };

  const entity = {
    _key:
      '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev/fileServices/default/shares/j1dev',
    _type: 'azure_storage_file_share',
    _class: ['DataStore'],
    _rawData: [{ name: 'default', rawData: data }],
    createdOn: undefined,
    id:
      '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev/fileServices/default/shares/j1dev',
    name: 'j1dev',
    displayName: 'j1dev',
    webLink: webLinker.portalResourceUrl(
      '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev/fileServices/default/shares/j1dev',
    ),
    resourceGroup: 'j1dev',
    classification: null,
    encrypted: true,
  };

  test('properties transferred', () => {
    const storageAccountEntity = createStorageAccountEntity(
      webLinker,
      storageAccount,
      { blob: {}, queue: {} },
    );
    const storageShareEntity = createStorageFileShareEntity(
      webLinker,
      storageAccountEntity,
      data,
    );
    expect(storageShareEntity).toMatchGraphObjectSchema({
      _class: entities.STORAGE_FILE_SHARE._class,
    });
    expect(storageShareEntity).toEqual(entity);
  });

  test('encryption not enabled', () => {
    const storageAccountEntity = createStorageAccountEntity(
      webLinker,
      {
        ...storageAccount,
        encryption: {
          keySource: 'Microsoft.Storage',
          services: {
            ...storageAccount.encryption?.services,
            file: { enabled: false },
          },
        },
      },
      {
        blob: {},
        queue: {},
      },
    );
    const storageShareEntity = createStorageFileShareEntity(
      webLinker,
      storageAccountEntity,
      data,
    );
    expect(storageShareEntity).toMatchGraphObjectSchema({
      _class: entities.STORAGE_FILE_SHARE._class,
    });
    expect(storageShareEntity).toEqual({
      ...entity,
      encrypted: false,
    });
  });

  test('encryption service not provided', () => {
    const storageAccountEntity = createStorageAccountEntity(
      webLinker,
      {
        ...storageAccount,
        encryption: { keySource: 'Microsoft.Storage', services: {} },
      },
      { blob: {}, queue: {} },
    );
    const storageShareEntity = createStorageFileShareEntity(
      webLinker,
      storageAccountEntity,
      data,
    );
    expect(storageShareEntity).toMatchGraphObjectSchema({
      _class: entities.STORAGE_FILE_SHARE._class,
    });
    expect(storageShareEntity).toEqual({
      ...entity,
      encrypted: false,
    });
  });
});

describe('createStorageQueueEntity', () => {
  const storageAccountEntity: Entity = {
    id:
      '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/ndowmon1j1dev',
    name: 'ndowmon1j1dev',
    _key:
      '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/ndowmon1j1dev',
    _type: 'azure_storage_account',
    _class: ['Service'],
    displayName: 'ndowmon1j1dev',
    region: 'eastus',
    resourceGroup: 'j1dev',
    kind: 'StorageV2',
    encryptedFileShare: true,
    encryptedBlob: true,
  };

  const data: StorageQueue = {
    id:
      '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev/queueServices/default/queues/j1dev',
    name: 'j1dev',
    type: 'Microsoft.Storage/storageAccounts/queueServices/queues',
  };

  test('properties transferred', () => {
    const storageQueueEntity = createStorageQueueEntity(
      webLinker,
      storageAccountEntity,
      data,
    );
    expect(storageQueueEntity).toMatchGraphObjectSchema({
      _class: entities.STORAGE_QUEUE._class,
    });
    expect(storageQueueEntity).toEqual({
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev/queueServices/default/queues/j1dev',
      _type: 'azure_storage_queue',
      _class: ['Queue'],
      _rawData: [{ name: 'default', rawData: data }],
      createdOn: undefined,
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev/queueServices/default/queues/j1dev',
      name: 'j1dev',
      displayName: 'j1dev',
      webLink: webLinker.portalResourceUrl(
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev/queueServices/default/queues/j1dev',
      ),
      resourceGroup: 'j1dev',
      type: 'Microsoft.Storage/storageAccounts/queueServices/queues',
    });
  });
});
