import {
  BlobContainer,
  FileShare,
  StorageAccount,
  StorageQueue,
} from '@azure/arm-storage/esm/models';

import { createAzureWebLinker } from '../../../azure';
import {
  createStorageContainerEntity,
  createStorageFileShareEntity,
  createStorageAccountEntity,
  createStorageQueueEntity,
} from './converters';
import { Entity } from '@jupiterone/integration-sdk-core';
import {
  STORAGE_ACCOUNT_ENTITY_METADATA,
  STORAGE_CONTAINER_ENTITY_METADATA,
  STORAGE_FILE_SHARE_ENTITY_METADATA,
  STORAGE_QUEUE_ENTITY_METADATA,
} from './constants';

const webLinker = createAzureWebLinker('something.onmicrosoft.com');

describe('createStorageAccountEntity Storage (Classic)', () => {
  const data: StorageAccount = {
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
      microsoftEndpoints: {
        blob: 'https://j1dev.blob.core.windows.net/microsoft-endpoint',
        queue: 'https://j1dev.queue.core.windows.net/microsoft-endpoint',
        table: 'https://j1dev.table.core.windows.net/microsoft-endpoint',
        file: 'https://j1dev.file.core.windows.net/microsoft-endpoint',
      },
    },
    primaryLocation: 'eastus',
    statusOfPrimary: 'available',
  };

  test('properties transferred', () => {
    const entity = {
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev',
      _type: 'azure_storage_account',
      _class: ['Service'],
      _rawData: [{ name: 'default', rawData: data }],
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
    };

    const storageAccountEntity = createStorageAccountEntity(webLinker, data);
    expect(storageAccountEntity).toMatchGraphObjectSchema({
      _class: STORAGE_ACCOUNT_ENTITY_METADATA._class,
    });
    expect(storageAccountEntity).toEqual(entity);
  });
});

describe('createStorageAccountEntity StorageV2', () => {
  const data: StorageAccount = {
    sku: {
      name: 'Standard_LRS',
      tier: 'Standard',
    },
    kind: 'StorageV2',
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
    // networkAcls: {
    //   bypass: "AzureServices",
    //   virtualNetworkRules: [],
    //   ipRules: [],
    //   defaultAction: "Allow",
    // },
    // supportsHttpsTrafficOnly: true,
    encryption: {
      services: {
        file: {
          keyType: 'Account',
          enabled: true,
          lastEnabledTime: new Date('2020-04-10T15:43:34.3618861Z'),
        },
        blob: {
          keyType: 'Account',
          enabled: true,
          lastEnabledTime: new Date('2020-04-10T15:43:34.3618861Z'),
        },
      },
      keySource: 'Microsoft.Storage',
    },
    accessTier: 'Hot',
    provisioningState: 'Succeeded',
    creationTime: new Date('2020-04-10T15:43:34.2993802Z'),
    primaryEndpoints: {
      dfs: 'https://j1dev.dfs.core.windows.net/',
      web: 'https://j1dev.z13.web.core.windows.net/',
      blob: 'https://j1dev.blob.core.windows.net/',
      queue: 'https://j1dev.queue.core.windows.net/',
      table: 'https://j1dev.table.core.windows.net/',
      file: 'https://j1dev.file.core.windows.net/',
      microsoftEndpoints: {
        dfs: 'https://j1dev.dfs.core.windows.net/microsoft-endpoint',
        web: 'https://j1dev.z13.web.core.windows.net/microsoft-endpoint',
        blob: 'https://j1dev.blob.core.windows.net/microsoft-endpoint',
        queue: 'https://j1dev.queue.core.windows.net/microsoft-endpoint',
        table: 'https://j1dev.table.core.windows.net/microsoft-endpoint',
        file: 'https://j1dev.file.core.windows.net/microsoft-endpoint',
      },
    },
    primaryLocation: 'eastus',
    statusOfPrimary: 'available',
  };

  test('properties transferred', () => {
    const entity = {
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev',
      _type: 'azure_storage_account',
      _class: ['Service'],
      _rawData: [{ name: 'default', rawData: data }],
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
      kind: 'StorageV2',
      sku: 'Standard_LRS',
      resourceGroup: 'j1dev',
      category: ['infrastructure'],
      endpoints: [
        'https://j1dev.blob.core.windows.net/',
        'https://j1dev.queue.core.windows.net/',
        'https://j1dev.table.core.windows.net/',
        'https://j1dev.file.core.windows.net/',
        'https://j1dev.z13.web.core.windows.net/',
        'https://j1dev.dfs.core.windows.net/',
        'https://j1dev.blob.core.windows.net/microsoft-endpoint',
        'https://j1dev.queue.core.windows.net/microsoft-endpoint',
        'https://j1dev.table.core.windows.net/microsoft-endpoint',
        'https://j1dev.file.core.windows.net/microsoft-endpoint',
        'https://j1dev.z13.web.core.windows.net/microsoft-endpoint',
        'https://j1dev.dfs.core.windows.net/microsoft-endpoint',
      ],
      createdOn: new Date('2020-04-10T15:43:34.2993802Z').getTime(),
      'tag.environment': 'j1dev',
    };

    const storageAccountEntity = createStorageAccountEntity(webLinker, data);
    expect(storageAccountEntity).toMatchGraphObjectSchema({
      _class: STORAGE_ACCOUNT_ENTITY_METADATA._class,
    });
    expect(storageAccountEntity).toEqual(entity);
  });
});

describe('createStorageAccountEntity BlobStorage', () => {
  const data: StorageAccount = {
    accessTier: 'Hot',
    creationTime: new Date('2020-04-17T13:22:05.030Z'),
    enableHttpsTrafficOnly: true,
    encryption: {
      keySource: 'Microsoft.Storage',
      services: {
        blob: {
          enabled: true,
          keyType: 'Account',
          lastEnabledTime: new Date('2020-04-17T13:22:05.092Z'),
        },
        file: {
          enabled: true,
          keyType: 'Account',
          lastEnabledTime: new Date('2020-04-17T13:22:05.092Z'),
        },
      },
    },
    id:
      '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1devblobstorage',
    isHnsEnabled: false,
    kind: 'BlobStorage',
    location: 'eastus',
    name: 'j1devblobstorage',
    networkRuleSet: {
      bypass: 'AzureServices',
      defaultAction: 'Allow',
      ipRules: [],
      virtualNetworkRules: [],
    },
    primaryEndpoints: {
      blob: 'https://j1devblobstorage.blob.core.windows.net/',
      dfs: 'https://j1devblobstorage.dfs.core.windows.net/',
      table: 'https://j1devblobstorage.table.core.windows.net/',
      microsoftEndpoints: {
        blob:
          'https://j1devblobstorage.blob.core.windows.net/microsoft-endpoint',
        dfs: 'https://j1devblobstorage.dfs.core.windows.net/microsoft-endpoint',
        table:
          'https://j1devblobstorage.table.core.windows.net/microsoft-endpoint',
      },
    },
    primaryLocation: 'eastus',
    privateEndpointConnections: [],
    provisioningState: 'Succeeded',
    sku: {
      name: 'Standard_LRS',
      tier: 'Standard',
    },
    statusOfPrimary: 'available',
    tags: {
      environment: 'j1dev',
    },
    type: 'Microsoft.Storage/storageAccounts',
  };

  test('properties transferred', () => {
    const entity = {
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1devblobstorage',
      _type: 'azure_storage_account',
      _class: ['Service'],
      _rawData: [{ name: 'default', rawData: data }],
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1devblobstorage',
      name: 'j1devblobstorage',
      displayName: 'j1devblobstorage',
      region: 'eastus',
      environment: 'j1dev',
      encryptedBlob: true,
      encryptedFileShare: true,
      webLink: webLinker.portalResourceUrl(
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1devblobstorage',
      ),
      kind: 'BlobStorage',
      sku: 'Standard_LRS',
      resourceGroup: 'j1dev',
      category: ['infrastructure'],
      endpoints: [
        'https://j1devblobstorage.blob.core.windows.net/',
        'https://j1devblobstorage.table.core.windows.net/',
        'https://j1devblobstorage.dfs.core.windows.net/',
        'https://j1devblobstorage.blob.core.windows.net/microsoft-endpoint',
        'https://j1devblobstorage.table.core.windows.net/microsoft-endpoint',
        'https://j1devblobstorage.dfs.core.windows.net/microsoft-endpoint',
      ],
      createdOn: new Date('2020-04-17T13:22:05.030Z').getTime(),
      enableHttpsTrafficOnly: true,
      'tag.environment': 'j1dev',
    };

    const storageAccountEntity = createStorageAccountEntity(webLinker, data);
    expect(storageAccountEntity).toMatchGraphObjectSchema({
      _class: STORAGE_ACCOUNT_ENTITY_METADATA._class,
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
    const storageContainerEntity = createStorageContainerEntity(
      webLinker,
      storageAccount,
      data,
    );
    expect(storageContainerEntity).toMatchGraphObjectSchema({
      _class: STORAGE_CONTAINER_ENTITY_METADATA._class,
    });
    expect(storageContainerEntity).toEqual(entity);
  });

  test('public container', () => {
    const storageContainerEntity = createStorageContainerEntity(
      webLinker,
      storageAccount,
      {
        ...data,
        publicAccess: 'Container',
      },
    );
    expect(storageContainerEntity).toMatchGraphObjectSchema({
      _class: STORAGE_CONTAINER_ENTITY_METADATA._class,
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
    const storageContainerEntity = createStorageContainerEntity(
      webLinker,
      storageAccount,
      {
        ...data,
        publicAccess: 'Blob',
      },
    );
    expect(storageContainerEntity).toMatchGraphObjectSchema({
      _class: STORAGE_CONTAINER_ENTITY_METADATA._class,
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

  test('encryption not enabled', () => {
    const storageContainerEntity = createStorageContainerEntity(
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
      data,
    );
    expect(storageContainerEntity).toMatchGraphObjectSchema({
      _class: STORAGE_CONTAINER_ENTITY_METADATA._class,
    });

    expect(storageContainerEntity).toEqual({
      ...entity,
      encrypted: false,
    });
  });

  test('encryption service not provided', () => {
    const storageContainerEntity = createStorageContainerEntity(
      webLinker,
      {
        ...storageAccount,
        encryption: {
          keySource: 'Microsoft.Storage',
          services: {},
        },
      },
      data,
    );
    expect(storageContainerEntity).toMatchGraphObjectSchema({
      _class: STORAGE_CONTAINER_ENTITY_METADATA._class,
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
    const storageShareEntity = createStorageFileShareEntity(
      webLinker,
      storageAccount,
      data,
    );
    expect(storageShareEntity).toMatchGraphObjectSchema({
      _class: STORAGE_FILE_SHARE_ENTITY_METADATA._class,
    });
    expect(storageShareEntity).toEqual(entity);
  });

  test('encryption not enabled', () => {
    const storageShareEntity = createStorageFileShareEntity(
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
      data,
    );
    expect(storageShareEntity).toMatchGraphObjectSchema({
      _class: STORAGE_FILE_SHARE_ENTITY_METADATA._class,
    });
    expect(storageShareEntity).toEqual({
      ...entity,
      encrypted: false,
    });
  });

  test('encryption service not provided', () => {
    const storageShareEntity = createStorageFileShareEntity(
      webLinker,
      {
        ...storageAccount,
        encryption: {
          keySource: 'Microsoft.Storage',
          services: {},
        },
      },
      data,
    );
    expect(storageShareEntity).toMatchGraphObjectSchema({
      _class: STORAGE_FILE_SHARE_ENTITY_METADATA._class,
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
      _class: STORAGE_QUEUE_ENTITY_METADATA._class,
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
