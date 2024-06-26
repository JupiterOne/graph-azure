import { NetworkManagementClient } from '@azure/arm-network';
import { SqlManagementClient } from '@azure/arm-sql';
import {
  createMockIntegrationLogger,
  Recording,
} from '@jupiterone/integration-sdk-testing';

import config from '../../../test/integrationInstanceConfig';
import { Client, DEFAULT_MAX_RETRIES, request } from './client';
import { setupAzureRecording } from '../../../test/helpers/recording';

import { FetchError } from 'node-fetch';
import { RestError as AzureRestError } from '@azure/ms-rest-js';

class SomeClient extends Client {}

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

test('client accessToken fetched once and used across resources', async () => {
  let requests = 0;

  recording = setupAzureRecording({
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

test('request should expose Azure RestError error codes', async () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const noop: any = () => {};
  const azureRequest = {
    url: 'some-url',
    method: 'GET' as any,
    headers: {
      set: noop,
      get: noop,
      contains: noop,
      remove: noop,
      rawHeaders: noop,
      headerNames: noop,
      headerValues: noop,
      headersArray: noop,
      clone: noop,
      toJson: noop,
    },
    withCredentials: false,
    timeout: 1000,
    validateRequestProperties: noop,
    clone: noop,
    prepare: noop,
  };

  await expect(
    request(
      () => {
        throw new AzureRestError(
          'Error message for azure rest error',
          'Error Code',
          400,
          azureRequest,
          {
            request: azureRequest,
            status: 400,
            headers: azureRequest.headers,
          },
          {
            code: 'FeatureNotSupportedForAccount',
            message: 'Table is not supported for the account',
          },
        );
      },
      createMockIntegrationLogger(),
      'fake-resource',
      1000,
    ),
  ).rejects.toThrow('Table is not supported for the account');
});

test('request should expose node-fetch error codes', async () => {
  // See how node-fetch handles system errors:
  // https://github.com/node-fetch/node-fetch/blob/master/docs/ERROR-HANDLING.md

  const systemError = new Error('system error');
  (systemError as any).code = 'ECONNRESET';
  await expect(
    request(
      () => {
        throw new FetchError(
          'Error message for system error',
          'system',
          systemError,
        );
      },
      createMockIntegrationLogger(),
      'fake-resource',
      1000,
    ),
  ).rejects.toThrow('Error message for system error');
}, 20_000);

test('request should expose Azure RestError status and text', async () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const noop: any = () => {};
  const azureRequest = {
    url: 'some-url',
    method: 'GET' as any,
    headers: {
      set: noop,
      get: noop,
      contains: noop,
      remove: noop,
      rawHeaders: noop,
      headerNames: noop,
      headerValues: noop,
      headersArray: noop,
      clone: noop,
      toJson: noop,
    },
    withCredentials: false,
    timeout: 1000,
    validateRequestProperties: noop,
    clone: noop,
    prepare: noop,
  };

  await expect(
    request(
      () => {
        throw new AzureRestError(
          'Error message for azure rest error',
          'Error Code',
          400,
          azureRequest,
          {
            request: azureRequest,
            status: 400,
            headers: azureRequest.headers,
          },
          {
            error: {
              code: 'FeatureNotSupportedForAccount',
              message: 'Table is not supported for the account',
            },
          },
        );
      },
      createMockIntegrationLogger(),
      'fake-resource',
      1000,
    ),
  ).rejects.toThrow('Table is not supported for the account');
});

test('request should expose Azure RestError status and text when message is StringfiedJSON', async () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const noop: any = () => {};
  const azureRequest = {
    url: 'some-url',
    method: 'GET' as any,
    headers: {
      set: noop,
      get: noop,
      contains: noop,
      remove: noop,
      rawHeaders: noop,
      headerNames: noop,
      headerValues: noop,
      headersArray: noop,
      clone: noop,
      toJson: noop,
    },
    withCredentials: false,
    timeout: 1000,
    validateRequestProperties: noop,
    clone: noop,
    prepare: noop,
  };

  await expect(
    request(
      () => {
        throw new AzureRestError(
          JSON.stringify(
            JSON.stringify({
              error: {
                code: 'Subscription Not Registered',
                message:
                  'Please register to Microsoft.Security in order to view your security status',
              },
            }),
          ),
          'Subscription Not Registered',
          401,
          azureRequest,
          {
            request: azureRequest,
            status: 401,
            headers: azureRequest.headers,
          },
        );
      },
      createMockIntegrationLogger(),
      'fake-resource',
      1000,
    ),
  ).rejects.toThrow(
    'Please register to Microsoft.Security in order to view your security status',
  );
});

test('Should retry after failing once ', async () => {
  let counter = 0;

  await expect(
    async () =>
      await request(
        () => {
          counter++;
          throw new Error();
        },
        createMockIntegrationLogger(),
        'fake-resource',
        100,
      ),
  ).rejects.toThrow();
  expect(counter).toEqual(DEFAULT_MAX_RETRIES);
});
