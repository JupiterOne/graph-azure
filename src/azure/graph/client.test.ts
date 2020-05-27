import {
  createMockIntegrationLogger,
  Recording,
  setupRecording,
} from '@jupiterone/integration-sdk/testing';

import config from '../../../test/integrationInstanceConfig';
import { GraphClient } from './client';

class AnyGraphClient extends GraphClient {}

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

test('accessToken fetched and cached', async () => {
  let requests = 0;

  recording = setupRecording({
    directory: __dirname,
    name: 'createGraphClient',
  });
  recording.server.any().on('request', (_req) => {
    requests++;
  });

  const client = new AnyGraphClient(createMockIntegrationLogger(), config);
  await expect(client.fetchMetadata()).resolves.toMatchObject({
    '@odata.context': 'https://graph.microsoft.com/v1.0/$metadata',
  });
  expect(requests).toEqual(2);

  await expect(client.fetchMetadata()).resolves.toMatchObject({
    '@odata.context': 'https://graph.microsoft.com/v1.0/$metadata',
  });
  expect(requests).toEqual(3);
});

test('fetchOrganization', async () => {
  recording = setupRecording({
    directory: __dirname,
    name: 'fetchOrganization',
  });

  const client = new AnyGraphClient(createMockIntegrationLogger(), config);
  await expect(client.fetchOrganization()).resolves.toMatchObject({
    verifiedDomains: [
      expect.objectContaining({
        name: expect.any(String),
      }),
    ],
  });
});
