import {
  createMockIntegrationLogger,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { FetchError } from 'node-fetch';

import config, { configFromEnv } from '../../../test/integrationInstanceConfig';
import { GraphClient, testFunctions } from './client';
import {
  getMatchRequestsBy,
  setupAzureRecording,
} from '../../../test/helpers/recording';
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

describe('fetchOrganization', () => {
  test('success', async () => {
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

  test('should fail for insufficient permissions ', async () => {
    /**
     * NOTE: Before recording this test, we revoked the `Directory.read` permission
     * for the calling service principal. In the event of a re-record, please revoke
     * the service principal's `Directory.read` permission.
     */
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'fetchOrganization-invalid-token',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
        recordFailedRequests: true,
      },
    });

    const client = new AnyGraphClient(
      createMockIntegrationLogger(),
      configFromEnv,
    );
    await expect(client.fetchOrganization()).rejects.toThrow(
      'Provider authorization failed at https://graph.microsoft.com/v1.0/organization: 403 Insufficient privileges to complete the operation.',
    );
  });
});

test('client.request should retry requests 3 times', async () => {
  const client = new AnyGraphClient(createMockIntegrationLogger(), config);

  const graphClientError = new Error('Generic Graph client error');
  (graphClientError as any).statusCode = 400;
  (graphClientError as any).statusText = 'Server Error';
  const mockGet = jest.fn().mockRejectedValue(graphClientError);

  const mockGraphRequest: GraphRequest = {
    get: mockGet,
    buildFullUrl: () => 'https://hostname/endpoint',
  } as unknown as GraphRequest;

  await expect(client.request(mockGraphRequest)).rejects.toThrow(
    'Provider API failed at https://hostname/endpoint: 400 Server Error',
  );

  expect(mockGet).toHaveBeenCalledTimes(3);
});

test('client.request should expose node-fetch error codes', async () => {
  const client = new AnyGraphClient(createMockIntegrationLogger(), config);

  const systemError = new Error('system error');
  (systemError as any).code = 'ECONNRESET';

  const mockGraphRequest: GraphRequest = {
    get: jest
      .fn()
      .mockRejectedValue(
        new FetchError('Error message for system error', 'system', systemError),
      ),
    buildFullUrl: () => 'https://hostname/endpoint',
  } as unknown as GraphRequest;

  await expect(client.request(mockGraphRequest)).rejects.toThrow(
    'Provider API failed at https://hostname/endpoint: ECONNRESET Error message for system error',
  );
});

test('should refresh access token', async () => {
  recording = setupAzureRecording({
    directory: __dirname,
    name: 'refresh-access-token',
    options: {
      matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      recordFailedRequests: true,
    },
  });

  const client = new AnyGraphClient(
    createMockIntegrationLogger(),
    configFromEnv,
  );
  const refreshTokenSpy = jest.spyOn(
    client.authenticationProvider,
    'refreshAccessToken',
  );

  const graphRequest = client.client.api('/organization');
  const graphRequestGetSpy = jest.spyOn(graphRequest, 'get');

  // invalidate token once
  jest
    .spyOn(client.authenticationProvider, 'getAccessToken')
    .mockResolvedValueOnce('***INVALID-TOKEN***');

  await expect(client.request(graphRequest)).resolves.toMatchObject({
    value: [
      {
        id: expect.any(String),
      },
    ],
  });

  expect(graphRequestGetSpy).toHaveBeenCalledTimes(2);
  expect(refreshTokenSpy).toHaveBeenCalledTimes(1);
});
