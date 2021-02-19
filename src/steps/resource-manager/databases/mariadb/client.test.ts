import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';
import {
  Recording,
  setupAzureRecording,
} from '../../../../../test/helpers/recording';
import { IntegrationConfig } from '../../../../types';
import { MariaDBClient } from './client';
import { Database, Server } from '@azure/arm-mariadb/esm/models';

let recording: Recording;
let config: IntegrationConfig;

describe('iterateServers', () => {
  let servers: Server[];

  beforeAll(async () => {
    config = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: '4a17becb-fb42-4633-b5c8-5ab66f28d195',
      subscriptionId: '87f62f44-9dad-4284-a08f-f2fb3d8b528a',
    };

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateMariaDBServers',
    });

    const client = new MariaDBClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    servers = [];

    await client.iterateServers((s) => {
      servers.push(s);
    });
  });

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should fetch Azure MariaDB Servers', () => {
    expect(servers).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server`,
        administratorLogin: expect.any(String),
        earliestRestoreDate: expect.any(Date),
        fullyQualifiedDomainName:
          'j1dev-mariadb-server.mariadb.database.azure.com',
        location: 'eastus',
        masterServerId: '',
        name: 'j1dev-mariadb-server',
        replicationRole: '',
        sku: { capacity: 2, family: 'Gen5', name: 'B_Gen5_2', tier: 'Basic' },
        sslEnforcement: 'Enabled',
        storageProfile: {
          backupRetentionDays: 7,
          geoRedundantBackup: 'Disabled',
          storageAutogrow: 'Disabled',
          storageMB: 51200,
        },
        tags: {},
        type: 'Microsoft.DBforMariaDB/servers',
        userVisibleState: 'Ready',
        version: '10.2',
      }),
    );
  });
});

describe('iterateDatabase', () => {
  let databases: Database[];

  beforeAll(async () => {
    config = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: '4a17becb-fb42-4633-b5c8-5ab66f28d195',
      subscriptionId: '87f62f44-9dad-4284-a08f-f2fb3d8b528a',
    };

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateMariaDBDatabases',
    });

    const client = new MariaDBClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const server: Server = {
      id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server`,
      fullyQualifiedDomainName:
        'j1dev-mariadb-server.mariadb.database.azure.com',
      location: 'eastus',
      masterServerId: '',
      name: 'j1dev-mariadb-server',
      replicationRole: '',
      sku: { capacity: 2, family: 'Gen5', name: 'B_Gen5_2', tier: 'Basic' },
      sslEnforcement: 'Enabled',
      storageProfile: {
        backupRetentionDays: 7,
        geoRedundantBackup: 'Disabled',
        storageAutogrow: 'Disabled',
        storageMB: 51200,
      },
      tags: {},
      type: 'Microsoft.DBforMariaDB/servers',
      userVisibleState: 'Ready',
    };

    databases = [];

    await client.iterateDatabases(server, (d) => {
      databases.push(d);
    });
  });

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should fetch Azure MariaDB Databases', () => {
    expect(databases).toEqual([
      {
        charset: 'utf8',
        collation: 'utf8_general_ci',
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server/databases/information_schema`,
        name: 'information_schema',
        type: 'Microsoft.DBforMariaDB/servers/databases',
      },
      {
        charset: 'utf8',
        collation: 'utf8_general_ci',
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server/databases/j1dev_mariadb_database`,
        name: 'j1dev_mariadb_database',
        type: 'Microsoft.DBforMariaDB/servers/databases',
      },
      {
        charset: 'latin1',
        collation: 'latin1_swedish_ci',
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server/databases/mysql`,
        name: 'mysql',
        type: 'Microsoft.DBforMariaDB/servers/databases',
      },
      {
        charset: 'utf8',
        collation: 'utf8_general_ci',
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server/databases/performance_schema`,
        name: 'performance_schema',
        type: 'Microsoft.DBforMariaDB/servers/databases',
      },
    ]);
  });
});
