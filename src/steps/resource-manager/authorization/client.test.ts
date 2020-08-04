import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';

import {
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { AuthorizationClient } from './client';
import {
  RoleAssignment,
  ClassicAdministrator,
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

describe('getRoleDefinition', () => {
  test('CustomRole', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateRoleDefinitions-custom',
    });

    const client = new AuthorizationClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const customRole = await client.getRoleDefinition(
      '/providers/Microsoft.Authorization/roleDefinitions/8bfcfc94-cf28-d595-8e3d-851a1eb7c8fa',
    );

    expect(customRole).toMatchObject(
      expect.objectContaining({
        roleName: 'j1dev-subscription',
        roleType: 'CustomRole',
      }),
    );
  });

  test('BuiltInRole', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateRoleDefinitions-builtIn',
    });

    const client = new AuthorizationClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const builtInRole = await client.getRoleDefinition(
      '/providers/Microsoft.Authorization/roleDefinitions/b24988ac-6180-42a0-ab88-20f7382dd24c',
    );

    expect(builtInRole).toMatchObject(
      expect.objectContaining({
        roleName: 'Contributor',
        roleType: 'BuiltInRole',
      }),
    );
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
