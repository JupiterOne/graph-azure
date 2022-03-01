import {
  DatabaseAccountGetResults,
  SqlDatabaseGetResults,
} from '@azure/arm-cosmosdb/esm/models';

import { createAzureWebLinker } from '../../../azure';
import { createAccountEntity, createSQLDatabaseEntity } from './converters';

const webLinker = createAzureWebLinker('something.onmicrosoft.com');

const dbAccount: DatabaseAccountGetResults = {
  id:
    '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.DocumentDB/databaseAccounts/j1dev',
  name: 'j1dev',
  location: 'East US',
  type: 'Microsoft.DocumentDB/databaseAccounts',
  kind: 'GlobalDocumentDB',
  tags: {
    environment: 'j1dev',
    classification: 'production',
  },
  provisioningState: 'Succeeded',
  documentEndpoint: 'https://j1dev.documents.azure.com:443/',
  ipRangeFilter: '',
  // publicNetworkAccess: "Enabled",
  enableAutomaticFailover: false,
  enableMultipleWriteLocations: false,
  // enablePartitionKeyMonitor: false,
  isVirtualNetworkFilterEnabled: false,
  virtualNetworkRules: [],
  // EnabledApiTypes: "Sql",
  disableKeyBasedMetadataWriteAccess: false,
  // enableFreeTier: false,
  // apiProperties: null,
  databaseAccountOfferType: 'Standard',
  consistencyPolicy: {
    defaultConsistencyLevel: 'BoundedStaleness',
    maxIntervalInSeconds: 10,
    maxStalenessPrefix: 200,
  },
  // configurationOverrides: {},
  writeLocations: [
    {
      id: 'j1dev-eastus',
      locationName: 'East US',
      documentEndpoint: 'https://j1dev-eastus.documents.azure.com:443/',
      provisioningState: 'Succeeded',
      failoverPriority: 0,
      isZoneRedundant: false,
    },
  ],
  readLocations: [
    {
      id: 'j1dev-eastus',
      locationName: 'East US',
      documentEndpoint: 'https://j1dev-eastus.documents.azure.com:443/',
      provisioningState: 'Succeeded',
      failoverPriority: 0,
      isZoneRedundant: false,
    },
  ],
  locations: [
    {
      id: 'j1dev-eastus',
      locationName: 'East US',
      documentEndpoint: 'https://j1dev-eastus.documents.azure.com:443/',
      provisioningState: 'Succeeded',
      failoverPriority: 0,
      isZoneRedundant: false,
    },
  ],
  failoverPolicies: [
    {
      id: 'j1dev-eastus',
      locationName: 'East US',
      failoverPriority: 0,
    },
  ],
  // cors: [],
  capabilities: [],
};

describe('createAccountEntity', () => {
  test('properties', () => {
    expect(createAccountEntity(webLinker, dbAccount)).toEqual({
      _class: ['Account', 'Service'],
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.DocumentDB/databaseAccounts/j1dev',
      _rawData: [
        {
          name: 'default',
          rawData: dbAccount,
        },
      ],
      _type: 'azure_cosmosdb_account',
      function: ['database'],
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.DocumentDB/databaseAccounts/j1dev',
      createdOn: undefined,
      displayName: 'j1dev',
      name: 'j1dev',
      region: 'eastus',
      resourceGroup: 'j1dev',
      'tag.environment': 'j1dev',
      'tag.classification': 'production',
      environment: 'j1dev',
      classification: 'production',
      webLink:
        'https://portal.azure.com/#@something.onmicrosoft.com/resource/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.DocumentDB/databaseAccounts/j1dev',
      enableAutomaticFailover: false,
      enableMultipleWriteLocations: false,
      isVirtualNetworkFilterEnabled: false,
      ipRangeFilter: '',
      category: ['infrastructure'],
      endpoints: ['https://j1dev-eastus.documents.azure.com:443/'],
    });
  });
});

describe('createSQLDatabaseEntity', () => {
  const database: SqlDatabaseGetResults = {
    id:
      '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.DocumentDB/databaseAccounts/j1dev/sqlDatabases/j1dev',
    type: 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases',
    name: 'j1dev',
    resource: {
      id: 'j1dev',
      _rid: 'IptqAA==',
      // _self: "dbs/IptqAA==/",
      _etag: '"0000cc08-0000-0100-0000-5e94ac280000"',
      _colls: 'colls/',
      _users: 'users/',
      _ts: 1586801704,
    },
  };

  test('properties', () => {
    expect(createSQLDatabaseEntity(webLinker, dbAccount, database)).toEqual({
      _class: ['Database', 'DataStore'],
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.DocumentDB/databaseAccounts/j1dev/sqlDatabases/j1dev',
      _rawData: [
        {
          name: 'default',
          rawData: { ...database, tags: dbAccount.tags },
        },
      ],
      _type: 'azure_cosmosdb_sql_database',
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.DocumentDB/databaseAccounts/j1dev/sqlDatabases/j1dev',
      createdOn: undefined,
      dbAccountId:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.DocumentDB/databaseAccounts/j1dev',
      displayName: 'j1dev',
      encrypted: true,
      name: 'j1dev',
      region: 'eastus',
      resourceGroup: 'j1dev',
      'tag.environment': 'j1dev',
      'tag.classification': 'production',
      environment: 'j1dev',
      classification: 'production',
      webLink:
        'https://portal.azure.com/#@something.onmicrosoft.com/resource/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.DocumentDB/databaseAccounts/j1dev/sqlDatabases/j1dev',
    });
  });

  test('no classification', () => {
    expect(
      createSQLDatabaseEntity(webLinker, { ...dbAccount, tags: {} }, database),
    ).toMatchObject({
      classification: null,
    });
  });
});
