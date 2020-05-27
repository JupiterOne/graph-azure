import {
  DatabaseAccountGetResults,
  SqlDatabaseGetResults,
} from '@azure/arm-cosmosdb/esm/models';
import {
  createMockIntegrationLogger,
  Recording,
  setupRecording,
} from '@jupiterone/integration-sdk/testing';

import config from '../../../../test/integrationInstanceConfig';
import { CosmosDBClient } from './client';

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

describe('iterateAccounts', () => {
  test('all', async () => {
    recording = setupRecording({
      directory: __dirname,
      name: 'iterateAccounts',
    });

    const client = new CosmosDBClient(
      config,
      createMockIntegrationLogger(),
      true,
    );
    const resources: DatabaseAccountGetResults[] = [];
    await client.iterateAccounts((e) => {
      resources.push(e);
    });

    expect(resources).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: 'j1dev',
        tags: expect.objectContaining({
          environment: 'j1dev',
        }),
      }),
    ]);
  });
});

describe('iterateSQLDatabases', () => {
  test('all', async () => {
    recording = setupRecording({
      directory: __dirname,
      name: 'iterateSQLDatabases',
    });

    const client = new CosmosDBClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const dbAccount: DatabaseAccountGetResults = {
      name: 'j1dev',
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.DocumentDB/databaseAccounts/j1dev',
    };

    const resources: SqlDatabaseGetResults[] = [];
    await client.iterateSQLDatabases(dbAccount, (e) => {
      resources.push(e);
    });

    expect(resources).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: 'j1dev',
        type: 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases',
      }),
    ]);
  });
});
