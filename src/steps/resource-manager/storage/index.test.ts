import {
  fetchStorageAccounts,
  fetchStorageQueues,
  fetchStorageTables,
  fetchStorageContainers,
  fetchStorageFileShares,
} from '.';
import { Recording } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import {
  setupAzureRecording,
  getMatchRequestsBy,
} from '../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { ACCOUNT_ENTITY_TYPE, fetchAccount } from '../../active-directory';
import { configFromEnv } from '../../../../test/integrationInstanceConfig';
import { fetchKeyVaults, KEY_VAULT_SERVICE_ENTITY_TYPE } from '../key-vault';
import { entities } from './constants';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

describe('rm-storage-accounts', () => {
  async function getSetupEntities() {
    const setupContext = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
    });

    await fetchAccount(setupContext);
    const accountEntities = setupContext.jobState.collectedEntities.filter(
      (e) => e._type === ACCOUNT_ENTITY_TYPE,
    );
    expect(accountEntities.length).toBe(1);
    const accountEntity = accountEntities[0];

    await fetchKeyVaults(setupContext);
    const j1devKeyVaultEntities = setupContext.jobState.collectedEntities.filter(
      (e) =>
        e._type === KEY_VAULT_SERVICE_ENTITY_TYPE &&
        e.displayName?.endsWith('j1dev'),
    );
    expect(j1devKeyVaultEntities.length).toBe(1);
    const keyVaultEntity = j1devKeyVaultEntities[0];

    return { accountEntity, keyVaultEntity };
  }

  test('step', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'resource-manager-step-storage-accounts',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const { accountEntity, keyVaultEntity } = await getSetupEntities();

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [keyVaultEntity],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchStorageAccounts(context);

    const storageAccountEntities = context.jobState.collectedEntities;

    expect(storageAccountEntities.length).toBeGreaterThan(0);
    expect(storageAccountEntities).toMatchGraphObjectSchema({
      _class: entities.STORAGE_ACCOUNT._class,
    });

    const storageAccountKeyVaultRelationships =
      context.jobState.collectedRelationships;

    expect(storageAccountKeyVaultRelationships.length).toBeGreaterThan(0);
    expect(storageAccountKeyVaultRelationships).toMatchDirectRelationshipSchema(
      {},
    );
  });
});

describe('rm-storage-containers', () => {
  async function getSetupEntities() {
    const setupContext = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
    });

    await fetchAccount(setupContext);
    const accountEntities = setupContext.jobState.collectedEntities.filter(
      (e) => e._type === ACCOUNT_ENTITY_TYPE,
    );
    expect(accountEntities.length).toBe(1);
    const accountEntity = accountEntities[0];

    await fetchStorageAccounts(setupContext);
    const j1devStorageAccountEntities = setupContext.jobState.collectedEntities.filter(
      (e) =>
        e._type === entities.STORAGE_ACCOUNT._type &&
        e.displayName?.endsWith('j1dev'),
    );
    expect(j1devStorageAccountEntities.length).toBe(1);
    const storageAccountEntity = j1devStorageAccountEntities[0];

    return { accountEntity, storageAccountEntity };
  }

  test('step', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'resource-manager-step-storage-containers',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const { accountEntity, storageAccountEntity } = await getSetupEntities();

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [storageAccountEntity],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchStorageContainers(context);

    const storageContainerEntities = context.jobState.collectedEntities;

    expect(storageContainerEntities.length).toBeGreaterThan(0);
    expect(storageContainerEntities).toMatchGraphObjectSchema({
      _class: entities.STORAGE_CONTAINER._class,
    });

    const storageAccountContainerRelationships =
      context.jobState.collectedRelationships;

    expect(storageAccountContainerRelationships.length).toBeGreaterThan(0);
    expect(
      storageAccountContainerRelationships,
    ).toMatchDirectRelationshipSchema({});
  });
});

describe('rm-storage-file-shares', () => {
  async function getSetupEntities() {
    const setupContext = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
    });

    await fetchAccount(setupContext);
    const accountEntities = setupContext.jobState.collectedEntities.filter(
      (e) => e._type === ACCOUNT_ENTITY_TYPE,
    );
    expect(accountEntities.length).toBe(1);
    const accountEntity = accountEntities[0];

    await fetchStorageAccounts(setupContext);
    const j1devStorageAccountEntities = setupContext.jobState.collectedEntities.filter(
      (e) =>
        e._type === entities.STORAGE_ACCOUNT._type &&
        e.displayName?.endsWith('j1dev'),
    );
    expect(j1devStorageAccountEntities.length).toBe(1);
    const storageAccountEntity = j1devStorageAccountEntities[0];

    return { accountEntity, storageAccountEntity };
  }

  test('step', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'resource-manager-step-storage-file-shares',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const { accountEntity, storageAccountEntity } = await getSetupEntities();

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [storageAccountEntity],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchStorageFileShares(context);

    const storageFileShareEntities = context.jobState.collectedEntities;

    expect(storageFileShareEntities.length).toBeGreaterThan(0);
    expect(storageFileShareEntities).toMatchGraphObjectSchema({
      _class: entities.STORAGE_FILE_SHARE._class,
    });

    const storageAccountFileShareRelationships =
      context.jobState.collectedRelationships;

    expect(storageAccountFileShareRelationships.length).toBeGreaterThan(0);
    expect(
      storageAccountFileShareRelationships,
    ).toMatchDirectRelationshipSchema({});
  });
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
