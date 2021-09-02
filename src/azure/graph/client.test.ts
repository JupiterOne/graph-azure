import {
  createMockIntegrationLogger,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { FetchError } from 'node-fetch';

import config from '../../../test/integrationInstanceConfig';
import { GraphClient, testFunctions } from './client';
import { setupAzureRecording } from '../../../test/helpers/recording';
import { GraphRequest } from '@microsoft/microsoft-graph-client';

const { getRolesFromAccessToken } = testFunctions;

class AnyGraphClient extends GraphClient {}

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

describe('getRolesFromAccessToken', () => {
  test('should return roles if in access_token.payload.roles', () => {
    const payload = { roles: ['Directory.Read.All'] };
    const base64Payload = Buffer.from(
      JSON.stringify(payload),
      'ascii',
    ).toString('Base64');
    const accessToken = `header.${base64Payload}.signature`;
    expect(getRolesFromAccessToken(accessToken)).toEqual([
      'Directory.Read.All',
    ]);
  });

  test('should return [] if access_token.payload.roles = []', () => {
    const payload = { roles: [] };
    const base64Payload = Buffer.from(
      JSON.stringify(payload),
      'ascii',
    ).toString('Base64');
    const accessToken = `header.${base64Payload}.signature`;
    expect(getRolesFromAccessToken(accessToken)).toEqual([]);
  });

  test('should return [] if access_token.payload.roles = undefined', () => {
    const payload = {};
    const base64Payload = Buffer.from(
      JSON.stringify(payload),
      'ascii',
    ).toString('Base64');
    const accessToken = `header.${base64Payload}.signature`;
    expect(getRolesFromAccessToken(accessToken)).toEqual([]);
  });

  test('should return [] if access_token.payload is not valid', () => {
    const payload = 'non-encoded-string';
    const accessToken = `header.${payload}.signature`;
    expect(getRolesFromAccessToken(accessToken)).toEqual([]);
  });
});

test('accessToken fetched and cached', async () => {
  let requests = 0;

  recording = setupAzureRecording({
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
  recording = setupAzureRecording({
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

test('client.request should retry requests 5 times', async () => {
  const client = new AnyGraphClient(createMockIntegrationLogger(), config);

  const graphClientError = new Error('Generic Graph client error');
  (graphClientError as any).statusCode = 400;
  (graphClientError as any).statusText = 'Server Error';
  const mockGet = jest.fn().mockRejectedValue(graphClientError);

  const mockGraphRequest: GraphRequest = ({
    get: mockGet,
    buildFullUrl: () => 'https://hostname/endpoint',
  } as unknown) as GraphRequest;

  await expect(client.request(mockGraphRequest)).rejects.toThrow(
    'Provider API failed at https://hostname/endpoint: 400 Server Error',
  );

  expect(mockGet).toHaveBeenCalledTimes(5);
});

test('client.request should expose node-fetch error codes', async () => {
  const client = new AnyGraphClient(createMockIntegrationLogger(), config);

  const systemError = new Error('system error');
  (systemError as any).code = 'ECONNRESET';

  const mockGraphRequest: GraphRequest = ({
    get: jest
      .fn()
      .mockRejectedValue(
        new FetchError('Error message for system error', 'system', systemError),
      ),
    buildFullUrl: () => 'https://hostname/endpoint',
  } as unknown) as GraphRequest;

  await expect(client.request(mockGraphRequest)).rejects.toThrow(
    'Provider API failed at https://hostname/endpoint: ECONNRESET Error message for system error',
  );
});
