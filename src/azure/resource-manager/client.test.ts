import { NetworkManagementClient } from '@azure/arm-network';
import { SqlManagementClient } from '@azure/arm-sql';
import {
  createMockIntegrationLogger,
  Recording,
  setupRecording,
} from '@jupiterone/integration-sdk-testing';

import config from '../../../test/integrationInstanceConfig';
import { Client } from './client';

class SomeClient extends Client {}

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

test('client accessToken fetched once and used across resources', async () => {
  let requests = 0;

  recording = setupRecording({
    directory: __dirname,
    name: 'accessTokenCaching',
  });
  recording.server.any().on('request', (_req) => {
    requests++;
  });

  const client = new SomeClient(config, createMockIntegrationLogger());

  await expect(
    client.getAuthenticatedServiceClient(NetworkManagementClient),
  ).resolves.toBeInstanceOf(NetworkManagementClient);
  expect(requests).toEqual(2);

  await expect(
    client.getAuthenticatedServiceClient(NetworkManagementClient),
  ).resolves.toBeInstanceOf(NetworkManagementClient);
  expect(requests).toEqual(2);

  await expect(
    client.getAuthenticatedServiceClient(SqlManagementClient),
  ).resolves.toBeInstanceOf(SqlManagementClient);
  expect(requests).toEqual(2);
});
