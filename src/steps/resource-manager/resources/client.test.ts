import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';

import {
  getMatchRequestsBy,
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { ResourcesClient } from './client';
import { RoleAssignment } from '@azure/arm-authorization/esm/models';
import { configFromEnv } from '../../../../test/integrationInstanceConfig';

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

describe('iterateResourceGroups', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateResourceGroups',
      options: {
        matchRequestsBy: getMatchRequestsBy({
          config: configFromEnv,
          options: { url: { query: false } },
        }),
      },
    });

    const client = new ResourcesClient(
      configFromEnv,
      createMockIntegrationLogger(),
      true,
    );

    const resources: RoleAssignment[] = [];
    await client.iterateResourceGroups((e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        name: 'DefaultResourceGroup-CUS',
      }),
    );
  }, 10000);
});
