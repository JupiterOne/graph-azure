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

    expect(resources).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: 'ac643838-a3d9-c5ac-b2f6-60baaa7451c8',
      }),
      expect.objectContaining({
        id: expect.any(String),
        name: '46a0fbc6-e68f-4668-a9d2-76b7cc16134b',
      }),
      expect.objectContaining({
        id: expect.any(String),
        name: 'c967042a-aad6-4e3b-8485-1c85d5e6f9e8',
      }),
      expect.objectContaining({
        id: expect.any(String),
        name: '41c65a1f-1d8f-450f-b8c5-f56fd3b10302',
      }),
      expect.objectContaining({
        id: expect.any(String),
        name: '1f0b8507-2f08-467b-8347-f5ca0554d696',
      }),
    ]);
  });
});
