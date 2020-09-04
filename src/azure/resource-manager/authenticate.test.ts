import { Recording } from '@jupiterone/integration-sdk-testing';

import config from '../../../test/integrationInstanceConfig';
import authenticate from './authenticate';
import { setupAzureRecording } from '../../../test/helpers/recording';

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

test('authenticate with subscription matching', async () => {
  recording = setupAzureRecording({
    directory: __dirname,
    name: 'authenticate',
  });
  const credentials = await authenticate(config);
  expect(credentials).toBeDefined();
});

test('authenticate with subscription not matching', async () => {
  recording = setupAzureRecording({
    directory: __dirname,
    name: 'authenticate bad subscription',
  });
  await expect(
    authenticate({ ...config, subscriptionId: 'junk' }),
  ).rejects.toThrow(/not found in tenant/);
});

test('authenticate with no subscription', async () => {
  recording = setupAzureRecording({
    directory: __dirname,
    name: 'authenticate no subscription',
  });
  await expect(
    authenticate({
      ...config,
      subscriptionId: undefined,
    }),
  ).rejects.toThrow(/without/);
});
