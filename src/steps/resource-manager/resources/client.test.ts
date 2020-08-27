import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';

import {
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { ResourcesClient } from './client';
import { RoleAssignment } from '@azure/arm-authorization/esm/models';
import { IntegrationConfig } from '../../../types';

// developer used different creds than ~/test/integrationInstanceConfig
const config: IntegrationConfig = {
  clientId: process.env.CLIENT_ID || 'clientId',
  clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
  directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
  subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
};

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
      config,
      createMockIntegrationLogger(),
      true,
    );

    const resources: RoleAssignment[] = [];
    await client.iterateResourceGroups((e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        name: 'j1dev',
      }),
    );
  });
});
