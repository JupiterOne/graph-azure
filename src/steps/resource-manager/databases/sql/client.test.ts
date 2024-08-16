import { Server } from '@azure/arm-sql/esm/models';
import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';

import {
  Recording,
  setupAzureRecording,
} from '../../../../../test/helpers/recording';
import config from '../../../../../test/integrationInstanceConfig';
import { SQLClient } from './client';
import { IntegrationLogger } from '@jupiterone/integration-sdk-core';

let recording: Recording;

afterEach(async () => {
  await recording.stop();
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
    id: '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Sql/servers/j1dev-sqlserver',
    name: 'j1dev-sqlserver',
    type: 'Microsoft.Sql/servers',
  };

  test('server not found', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateSqlDatabasesServerNotFound',
    });

    const client = new SQLClient(config, createMockIntegrationLogger() as IntegrationLogger, true);

    const iteratee = jest.fn();
    await client.iterateDatabases(
      {
        ...server,
        id: '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Sql/servers/j1dev-sqlserver-notfound',
        name: 'j1dev-sqlserver-notfound',
      },
      iteratee,
    );

    expect(iteratee).not.toHaveBeenCalled();
  });
});
