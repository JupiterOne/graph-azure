import { Recording } from '@jupiterone/integration-sdk-testing';

import config from '../../../test/integrationInstanceConfig';
import { validateResourceManagerInvocation } from './authenticate';
import { setupAzureRecording } from '../../../test/helpers/recording';

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

describe('validateResourceManagerInvocation', () => {
  test('authenticate with subscription matching', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'authenticate',
    });
    const credentials = await validateResourceManagerInvocation(config);
    expect(credentials).toBeUndefined();
  });

  test('authenticate with subscription not matching', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'authenticate bad subscription',
    });
    await expect(
      validateResourceManagerInvocation({ ...config, subscriptionId: 'junk' }),
    ).rejects.toThrow(
      'subscriptionId not found in tenant specified by directoryId',
    );
  });

  test('authenticate with no subscription', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'authenticate no subscription',
    });
    await expect(
      validateResourceManagerInvocation({
        ...config,
        subscriptionId: undefined,
      }),
    ).rejects.toThrow(
      'Cannot use Azure Resource Manager APIs without subscriptionId',
    );
  });
});
