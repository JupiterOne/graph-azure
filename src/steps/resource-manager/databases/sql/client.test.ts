import {
  Database,
  FirewallRule,
  Server,
  ServerAzureADAdministrator,
} from '@azure/arm-sql/esm/models';
import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';

import {
  getMatchRequestsBy,
  Recording,
  setupAzureRecording,
} from '../../../../../test/helpers/recording';
import config, {
  configFromEnv,
} from '../../../../../test/integrationInstanceConfig';
import { SQLClient } from './client';

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

describe('iterateServers', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateSqlServers',
    });

    const client = new SQLClient(config, createMockIntegrationLogger(), true);

    const resources: Server[] = [];
    await client.iterateServers((e) => {
      resources.push(e);
    });

    expect(resources).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: 'j1dev-sqlserver',
        tags: expect.objectContaining({
          environment: 'j1dev',
        }),
      }),
    ]);
  }, 10000);
});

describe('iterateDatabases', () => {
  const server: Server = {
    kind: 'v12.0',
    administratorLogin: '?wJ@=_6Yxt#&Y',
    version: '12.0',
    state: 'Ready',
    fullyQualifiedDomainName: 'j1dev-sqlserver.database.windows.net',
    location: 'eastus',
    tags: { environment: 'j1dev' },
    id:
      '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Sql/servers/j1dev-sqlserver',
    name: 'j1dev-sqlserver',
    type: 'Microsoft.Sql/servers',
  };

  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateSqlDatabases',
    });

    const client = new SQLClient(config, createMockIntegrationLogger(), true);

    const resources: Database[] = [];
    await client.iterateDatabases(server, (e) => {
      resources.push(e);
    });

    expect(resources).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: 'j1dev-sqldatabase',
        tags: expect.objectContaining({
          environment: 'j1dev',
        }),
      }),
      expect.objectContaining({
        id: expect.any(String),
        name: 'master',
      }),
    ]);
  });

  test('server not found', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateSqlDatabasesServerNotFound',
    });

    const client = new SQLClient(config, createMockIntegrationLogger(), true);

    const iteratee = jest.fn();
    await client.iterateDatabases(
      {
        ...server,
        id:
          '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Sql/servers/j1dev-sqlserver-notfound',
        name: 'j1dev-sqlserver-notfound',
      },
      iteratee,
    );

    expect(iteratee).not.toHaveBeenCalled();
  });
});

describe('iterateFirewallRules', () => {
  async function getSetupData() {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateFirewallRules-getSetupData',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const client = new SQLClient(configFromEnv, createMockIntegrationLogger());

    const sqlServers: Server[] = [];

    await client.iterateServers((s) => {
      sqlServers.push(s);
    });

    const j1devSqlServers = sqlServers.filter(
      (s) => s.name === 'j1dev-sqlserver',
    );
    expect(j1devSqlServers.length).toBe(1);
    const sqlServer = j1devSqlServers[0];

    await recording.stop();

    return {
      sqlServer,
    };
  }

  test('success', async () => {
    const { sqlServer } = await getSetupData();

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateFirewallRules-success',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const client = new SQLClient(configFromEnv, createMockIntegrationLogger());

    const firewallRules: FirewallRule[] = [];
    await client.iterateServerFirewallRules(sqlServer, (f) => {
      firewallRules.push(f);
    });

    expect(firewallRules.length).toBeGreaterThan(0);
  });
});

describe('iterateServerActiveDirectoryAdministrators', () => {
  async function getSetupData() {
    const client = new SQLClient(configFromEnv, createMockIntegrationLogger());

    const sqlServers: Server[] = [];

    await client.iterateServers((s) => {
      sqlServers.push(s);
    });

    const j1devSqlServers = sqlServers.filter(
      (s) => s.name === 'j1dev-sqlserver',
    );
    expect(j1devSqlServers.length).toBe(1);
    const sqlServer = j1devSqlServers[0];

    return {
      sqlServer,
    };
  }

  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateServerActiveDirectoryAdministrators',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const { sqlServer } = await getSetupData();

    const client = new SQLClient(configFromEnv, createMockIntegrationLogger());

    const activeDirectoryAdmins: ServerAzureADAdministrator[] = [];
    await client.iterateServerActiveDirectoryAdministrators(
      { name: sqlServer.name!, id: sqlServer.id! },
      (admin) => {
        activeDirectoryAdmins.push(admin);
      },
    );

    expect(activeDirectoryAdmins.length).toBeGreaterThan(0);
  });
});

describe('fetchServerEncryptionProtector', () => {
  async function getSetupData(client: SQLClient) {
    const sqlServers: Server[] = [];
    await client.iterateServers((s) => {
      sqlServers.push(s);
    });

    const j1devSqlServers = sqlServers.filter(
      (s) => s.name === 'j1dev-sqlserver',
    );
    expect(j1devSqlServers.length).toBe(1);
    const sqlServer = j1devSqlServers[0];

    return {
      sqlServer,
    };
  }

  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'fetchServerEncryptionProtector',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const client = new SQLClient(configFromEnv, createMockIntegrationLogger());

    const { sqlServer } = await getSetupData(client);

    const response = await client.fetchServerEncryptionProtector({
      name: sqlServer.name!,
      id: sqlServer.id!,
    });

    expect(response).toMatchObject({
      serverKeyType: expect.stringMatching(/ServiceManaged|AzureKeyVault/),
    });
  });
});
