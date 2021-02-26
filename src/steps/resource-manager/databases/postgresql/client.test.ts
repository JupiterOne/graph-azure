import { PostgreSQLClient } from './client';
import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';
import {
  Recording,
  setupAzureRecording,
} from '../../../../../test/helpers/recording';
import { IntegrationConfig } from '../../../../types';
import { Database, Server } from '@azure/arm-postgresql/esm/models';

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
      name: 'iteratePostgreSQLServers',
    });

    const client = new PostgreSQLClient(
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

  it('should fetch Azure PostgreSQL Servers', () => {
    expect(servers).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver`,
        administratorLogin: expect.any(String),
        earliestRestoreDate: expect.any(Date),
        fullyQualifiedDomainName:
          'j1dev-psqlserver.postgres.database.azure.com',
        location: 'eastus',
        masterServerId: '',
        name: 'j1dev-psqlserver',
        replicationRole: '',
        sku: {
          capacity: 4,
          family: 'Gen5',
          name: 'GP_Gen5_4',
          tier: 'GeneralPurpose',
        },
        sslEnforcement: 'Enabled',
        storageProfile: {
          backupRetentionDays: 7,
          geoRedundantBackup: 'Disabled',
          storageAutogrow: 'Disabled',
          storageMB: 640000,
        },
        tags: {},
        type: 'Microsoft.DBforPostgreSQL/servers',
        userVisibleState: 'Ready',
        version: '9.6',
      }),
    );
  });
});

describe('iterateDatabases', () => {
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
      name: 'iteratePostgreSQLDatabases',
    });

    const client = new PostgreSQLClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    databases = [];

    const server: Server = {
      id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver`,
      fullyQualifiedDomainName: 'j1dev-psqlserver.postgres.database.azure.com',
      location: 'eastus',
      masterServerId: '',
      name: 'j1dev-psqlserver',
      replicationRole: '',
      sku: {
        capacity: 4,
        family: 'Gen5',
        name: 'GP_Gen5_4',
        tier: 'GeneralPurpose',
      },
      sslEnforcement: 'Enabled',
      storageProfile: {
        backupRetentionDays: 7,
        geoRedundantBackup: 'Disabled',
        storageAutogrow: 'Disabled',
        storageMB: 640000,
      },
      tags: {},
      type: 'Microsoft.DBforPostgreSQL/servers',
      userVisibleState: 'Ready',
      version: '9.6',
    };

    await client.iterateDatabases(server, (s) => {
      databases.push(s);
    });
  });

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should fetch Azure PostgreSQL Databases', () => {
    expect(databases).toEqual([
      {
        charset: 'UTF8',
        collation: 'English_United States.1252',
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver/databases/postgres`,
        name: 'postgres',
        type: 'Microsoft.DBforPostgreSQL/servers/databases',
      },
      {
        charset: 'UTF8',
        collation: 'English_United States.1252',
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver/databases/azure_maintenance`,
        name: 'azure_maintenance',
        type: 'Microsoft.DBforPostgreSQL/servers/databases',
      },
      {
        charset: 'UTF8',
        collation: 'English_United States.1252',
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver/databases/azure_sys`,
        name: 'azure_sys',
        type: 'Microsoft.DBforPostgreSQL/servers/databases',
      },
    ]);
  });
});
