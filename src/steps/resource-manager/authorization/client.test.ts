import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';

import {
  getMatchRequestsBy,
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { AuthorizationClient } from './client';
import {
  RoleAssignment,
  ClassicAdministrator,
  RoleDefinition,
} from '@azure/arm-authorization/esm/models';
import { IntegrationConfig } from '../../../types';
import { configFromEnv } from '../../../../test/integrationInstanceConfig';

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
    expect(resources).toContainEqual(
      expect.objectContaining({
        name: '20000000-0000-0000-0000-000000000000',
      }),
    );
    expect(resources).toContainEqual(
      expect.objectContaining({
        name: '30000000-0000-0000-0000-000000000000',
      }),
    );
  });
});

describe('iterateClassicAdministrators', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateClassicAdministrators',
    });

    const client = new AuthorizationClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const resources: ClassicAdministrator[] = [];
    await client.iterateClassicAdministrators((e) => {
      resources.push(e);
    });

    expect(resources).toEqual([
      expect.objectContaining({
        name: '',
        role: 'ServiceAdministrator;AccountAdministrator',
      }),
      expect.objectContaining({
        name: '00030000D25AEAF7',
        role: 'CoAdministrator',
      }),
    ]);
  });
});

describe('iterateRoleDefinitions', () => {
  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateRoleDefinitions',
      options: {
        matchRequestsBy: getMatchRequestsBy({
          config: configFromEnv,
        }),
      },
    });

    const client = new AuthorizationClient(
      configFromEnv,
      createMockIntegrationLogger(),
    );

    const roleDefinitions: RoleDefinition[] = [];
    await client.iterateRoleDefinitions(
      `/subscriptions/${configFromEnv.subscriptionId}`,
      (rd) => {
        roleDefinitions.push(rd);
      },
    );

    expect(roleDefinitions.length).toBeGreaterThan(0);
  });
});
