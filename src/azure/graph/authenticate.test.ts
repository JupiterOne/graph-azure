import { IntegrationProviderAPIError } from '@jupiterone/integration-sdk-core';
import { Recording, setupRecording } from '@jupiterone/integration-sdk-testing';

import config from '../../../test/integrationInstanceConfig';
import authenticate from './authenticate';

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

test('authenticate', async () => {
  recording = setupRecording({ directory: __dirname, name: 'authenticate' });
  const token = await authenticate(config);
  expect(token).toBeDefined();
});

test('authenticate invalid credentials', async () => {
  recording = setupRecording({
    directory: __dirname,
    name: 'authenticate invalid',
    options: { recordFailedRequests: true },
  });
  await expect(
    authenticate({ ...config, clientSecret: 'somejunkfortest' }),
  ).rejects.toThrow(IntegrationProviderAPIError);
});
