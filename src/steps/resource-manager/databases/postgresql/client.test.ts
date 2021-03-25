import { PostgreSQLClient } from './client';
import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';
import {
  getMatchRequestsBy,
  Recording,
  setupAzureRecording,
} from '../../../../../test/helpers/recording';
import { IntegrationConfig } from '../../../../types';
import {
  Database,
  FirewallRule,
  Server,
} from '@azure/arm-postgresql/esm/models';
import { configFromEnv } from '../../../../../test/integrationInstanceConfig';

let recording: Recording;
let config: IntegrationConfig;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

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

describe('getServerParameters', () => {
  async function getSetupData(client: PostgreSQLClient) {
    const postgreSqlServers: Server[] = [];
    await client.iterateServers((s) => {
      postgreSqlServers.push(s);
    });

    const j1devPostgreSqlServers = postgreSqlServers.filter(
      (s) => s.name === 'j1dev-psqlserver',
    );
    expect(j1devPostgreSqlServers).toHaveLength(1);

    return { postgreSqlServer: j1devPostgreSqlServers[0] };
  }

  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'getServerParameters',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const client = new PostgreSQLClient(
      configFromEnv,
      createMockIntegrationLogger(),
    );

    const { postgreSqlServer } = await getSetupData(client);

    const serverParameters = await client.getServerConfigurations({
      name: postgreSqlServer.name!,
      id: postgreSqlServer.id!,
    });

    expect(serverParameters).not.toBeUndefined();
    expect(serverParameters?.length).toBeGreaterThan(0);
  });
});

describe('iterateFirewallRules', () => {
  async function getSetupData(client: PostgreSQLClient) {
    const sqlServers: Server[] = [];

    await client.iterateServers((s) => {
      sqlServers.push(s);
    });

    const j1devPostgreSqlServers = sqlServers.filter(
      (s) => s.name === 'j1dev-psqlserver',
    );
    expect(j1devPostgreSqlServers.length).toBe(1);

    return {
      postgreSqlServer: j1devPostgreSqlServers[0],
    };
  }

  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateFirewallRules',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const client = new PostgreSQLClient(
      configFromEnv,
      createMockIntegrationLogger(),
    );
    const { postgreSqlServer } = await getSetupData(client);

    const firewallRules: FirewallRule[] = [];
    await client.iterateServerFirewallRules(postgreSqlServer, (f) => {
      firewallRules.push(f);
    });

    expect(firewallRules.length).toBeGreaterThan(0);
  });
});
