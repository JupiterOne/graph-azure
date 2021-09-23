import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';

import {
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
    });

    const client = new ResourcesClient(
      {
        ...configFromEnv,
        directoryId: '19ae0f99-6fc6-444b-bd54-97504efc66ad',
        subscriptionId: '193f89dc-6225-4a80-bacb-96b32fbf6dd0',
      },
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
  });
});
