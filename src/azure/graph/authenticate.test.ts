import { IntegrationProviderAPIError } from '@jupiterone/integration-sdk-core';
import { Recording } from '@jupiterone/integration-sdk-testing';

import config from '../../../test/integrationInstanceConfig';
import authenticate from './authenticate';
import { setupAzureRecording } from '../../../test/helpers/recording';

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

test('authenticate', async () => {
  recording = setupAzureRecording({
    directory: __dirname,
    name: 'authenticate',
  });
  const token = await authenticate(config);
  expect(token).toBeDefined();
});

test('authenticate invalid credentials', async () => {
  recording = setupAzureRecording({
    directory: __dirname,
    name: 'authenticate invalid',
    options: { recordFailedRequests: true },
  });
  await expect(
    authenticate({ ...config, clientSecret: 'somejunkfortest' }),
  ).rejects.toThrow(IntegrationProviderAPIError);
});
