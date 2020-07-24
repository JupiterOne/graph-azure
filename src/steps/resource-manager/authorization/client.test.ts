import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';

import {
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { AuthorizationClient } from './client';
import {
  RoleDefinition,
  RoleAssignment,
} from '@azure/arm-authorization/esm/models';
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

describe('iterateRoleDefinitions', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateRoleDefinitions',
    });

    const client = new AuthorizationClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const resources: RoleDefinition[] = [];
    await client.iterateRoleDefinitions((e) => {
      if (e.roleName === 'Owner') {
        resources.push(e);
      }
    });

    expect(resources).toMatchObject([
      expect.objectContaining({
        roleName: 'Owner',
      }),
    ]);
  });
});

describe('iterateRoleAssignments', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateRoleAssignments',
    });

    const client = new AuthorizationClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const resources: RoleAssignment[] = [];
    await client.iterateRoleAssignments((e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        name: '10000000-0000-0000-0000-000000000000',
      }),
    );
  });
});
