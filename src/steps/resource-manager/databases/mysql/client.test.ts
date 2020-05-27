import { MySQLManagementModels } from '@azure/arm-mysql';
import { createMockIntegrationLogger } from '@jupiterone/integration-sdk/testing';

import {
  Recording,
  setupAzureRecording,
} from '../../../../../test/helpers/recording';
import config from '../../../../../test/integrationInstanceConfig';
import { MySQLClient } from './client';

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

describe('iterateServers', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateMySqlServers',
    });

    const client = new MySQLClient(config, createMockIntegrationLogger(), true);

    const resources: MySQLManagementModels.Server[] = [];
    await client.iterateServers((e) => {
      resources.push(e);
    });

    expect(resources).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: 'j1dev-mysqlserver',
        tags: expect.objectContaining({
          environment: 'j1dev',
        }),
      }),
    ]);
  }, 10000);
});

describe('iterateDatabases', () => {
  const server: MySQLManagementModels.Server = {
    sku: {
      name: 'B_Gen5_2',
      tier: 'Basic',
      family: 'Gen5',
      capacity: 2,
    },
    location: 'eastus',
    tags: {
      environment: 'j1dev',
    },
    id:
      '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver',
    name: 'j1dev-mysqlserver',
    type: 'Microsoft.DBforMySQL/servers',
    administratorLogin: 'WbybVQKHZg59K',
    storageProfile: {
      storageMB: 5120,
      backupRetentionDays: 7,
      geoRedundantBackup: 'Disabled',
      storageAutogrow: 'Enabled',
    },
    version: '5.7',
    sslEnforcement: 'Enabled',
    userVisibleState: 'Ready',
    fullyQualifiedDomainName: 'j1dev-mysqlserver.mysql.database.azure.com',
    earliestRestoreDate: new Date('2020-04-10T17:51:42.207+00:00'),
    replicationRole: '',
    masterServerId: '',
  };

  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateMySqlDatabases',
    });

    const client = new MySQLClient(config, createMockIntegrationLogger(), true);

    const resources: MySQLManagementModels.Database[] = [];
    await client.iterateDatabases(server, (e) => {
      resources.push(e);
    });

    expect(resources).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: 'information_schema',
      }),

      expect.objectContaining({
        id: expect.any(String),
        name: 'j1dev-mysqldb',
      }),

      expect.objectContaining({
        id: expect.any(String),
        name: 'mysql',
      }),

      expect.objectContaining({
        id: expect.any(String),
        name: 'performance_schema',
      }),

      expect.objectContaining({
        id: expect.any(String),
        name: 'sys',
      }),
    ]);
  });

  test("502 The issue encountered for 'Microsoft.DBforMySQL'; cannot fulfill the request", async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateMySqlDatabasesCannotFulfillRequest',
    });

    const client = new MySQLClient(config, createMockIntegrationLogger(), true);

    recording.server
      .get(
        'https://management.azure.com/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver/databases?api-version=2017-12-01',
      )
      .intercept((req, res) => {
        res.status(502).json({
          error: {
            code: 'BadGateway',
            message:
              "The issue encountered for 'Microsoft.DBforMySQL'; cannot fulfill the request.",
          },
        });
      });

    const iteratee = jest.fn();
    await expect(client.iterateDatabases(server, iteratee)).rejects.toThrow();
  });
});
