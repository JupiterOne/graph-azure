import {
  createMockIntegrationLogger,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import {
  DirectoryObject,
  DirectoryRole,
  Group,
  User,
} from '@microsoft/microsoft-graph-types';

import config, { configFromEnv } from '../../../test/integrationInstanceConfig';
import { DirectoryGraphClient, GroupMember } from './client';
import { IntegrationConfig } from '../../types';
import {
  setupAzureRecording,
  getMatchRequestsBy,
} from '../../../test/helpers/recording';

const logger = createMockIntegrationLogger();

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

/**
 * The /policy/fetchIdentitySecurityDefaultsEnforcementPolicy endpoint returns data to inform
 * users whether their default directory has enabled `Security Defaults`.
 *
 * Although any user can access this switch in the portal.azure.com UI, apparently it is only functional for
 * "Delegated (work or school account)" or "Application" callers. It is _not supported_ for "Delegated
 * (personal Microsoft account)", according to the documentation:
 *
 * https://docs.microsoft.com/en-us/graph/api/identitysecuritydefaultsenforcementpolicy-get?view=graph-rest-1.0&tabs=http
 *
 * It also requires an additional permission, Policy.Read.All.
 */
describe('fetchIdentitySecurityDefaultsEnforcementPolicy', () => {
  // When re-recording this test, ensure it is recorded with a school/work active directory account.
  test('should fetch for account with permission Policy.Read.All', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'fetchIdentitySecurityDefaultsEnforcementPolicy-with-permission',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const client = new DirectoryGraphClient(logger, configFromEnv);
    const response = await client.fetchIdentitySecurityDefaultsEnforcementPolicy();

    expect(response).toMatchObject({
      isEnabled: expect.any(Boolean),
    });
  });

  // When re-recording this test, ensure it is recorded with a school/work active directory account.
  test('should inform user if not granted permission Policy.Read.All', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'fetchIdentitySecurityDefaultsEnforcementPolicy-without-permission',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
        recordFailedRequests: true,
      },
    });
    const publishEventSpy = jest.spyOn(logger, 'publishEvent');

    const client = new DirectoryGraphClient(logger, configFromEnv);
    const response = await client.fetchIdentitySecurityDefaultsEnforcementPolicy();

    expect(response).toBeUndefined();
    expect(publishEventSpy).toHaveBeenCalledTimes(1);
    expect(publishEventSpy).toHaveBeenCalledWith({
      name: 'auth',
      description:
        'Unable to fetch data from /policies/identitySecurityDefaultsEnforcementPolicy. See https://github.com/JupiterOne/graph-azure/blob/master/docs/jupiterone.md#permissions for more information about optional permissions for this integration.',
    });
    publishEventSpy.mockRestore();
  });
});

test('iterateGroups', async () => {
  recording = setupAzureRecording({
    directory: __dirname,
    name: 'iterateGroups',
  });

  const client = new DirectoryGraphClient(logger, config);

  const resources: Group[] = [];
  await client.iterateGroups((e) => {
    resources.push(e);
  });

  expect(resources.length).toBeGreaterThan(0);
  resources.forEach((r) => {
    expect(r).toMatchObject({
      displayName: expect.any(String),
    });
  });
});

describe('iterateGroupMembers', () => {
  let client: DirectoryGraphClient;

  beforeEach(() => {
    client = new DirectoryGraphClient(logger, config);
  });

  test('single selected property', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateGroupMembersSelectProperty',
    });

    const resources: GroupMember[] = [];
    await client.iterateGroupMembers(
      {
        groupId: '1c417feb-b04f-46c9-a747-614d6d03f348',
        select: ['id'],
      },
      (e) => {
        resources.push(e);
      },
    );

    expect(resources.length).toBeGreaterThan(0);
    resources.forEach((r) => {
      expect(r).toMatchObject({
        id: expect.any(String),
      });
    });

    const resource = resources[0];
    expect(resource.displayName).toBeUndefined();
  });

  test('multiple selected properties', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateGroupMembersSelectProperties',
    });

    const resources: GroupMember[] = [];
    await client.iterateGroupMembers(
      {
        groupId: '1c417feb-b04f-46c9-a747-614d6d03f348',
        select: ['id', 'displayName'],
      },
      (e) => {
        resources.push(e);
      },
    );

    expect(resources.length).toBeGreaterThan(0);
    resources.forEach((r) => {
      expect(r).toMatchObject({
        id: expect.any(String),
        displayName: expect.any(String),
      });
    });
  });

  test('iterateGroupMembers', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateGroupMembers',
    });

    const resources: GroupMember[] = [];
    await client.iterateGroupMembers(
      { groupId: '58e48aba-cd45-440f-a851-2bf9715fadc1' },
      (e) => {
        resources.push(e);
      },
    );

    expect(resources.length).toBeGreaterThan(0);
    resources.forEach((r) => {
      expect(r).toMatchObject({
        displayName: expect.any(String),
      });
    });
  });
});

describe('iterateUsers', () => {
  test('404 answers empty collection', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateUsers404',
    });

    const client = new DirectoryGraphClient(logger, config);

    recording.server
      .get('https://graph.microsoft.com/v1.0/users')
      .intercept((_req, res) => {
        res.status(404);
      });

    const resources: User[] = [];
    await client.iterateUsers((e) => {
      resources.push(e);
    });

    expect(resources.length).toEqual(0);
  });

  test('provides expected data', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateUsers',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const client = new DirectoryGraphClient(logger, configFromEnv);

    const resources: User[] = [];
    await client.iterateUsers((e) => {
      resources.push(e);
    });

    expect(resources.length).toBeGreaterThan(0);
    resources.forEach((r) => {
      expect(r).toMatchObject({
        id: expect.any(String),
        userType: expect.stringMatching(/(Member|Guest)/),
      });
    });
  });
});

test('iterateDirectoryRoles', async () => {
  recording = setupAzureRecording({
    directory: __dirname,
    name: 'iterateDirectoryRoles',
  });

  const client = new DirectoryGraphClient(logger, config);

  const resources: DirectoryRole[] = [];
  await client.iterateDirectoryRoles((e) => {
    resources.push(e);
  });

  expect(resources.length).toBeGreaterThan(0);
  resources.forEach((r) => {
    expect(r).toMatchObject({
      roleTemplateId: expect.any(String),
    });
  });
});

test('iterateDirectoryRoleMembers', async () => {
  recording = setupAzureRecording({
    directory: __dirname,
    name: 'iterateDirectoryRoleMembers',
  });

  const client = new DirectoryGraphClient(logger, config);

  const resources: DirectoryObject[] = [];
  await client.iterateDirectoryRoleMembers(
    '9a4ba32c-28dd-4c30-bc99-f8137845d6bf',
    (e) => {
      resources.push(e);
    },
  );

  expect(resources.length).toBeGreaterThan(0);
  resources.forEach((r) => {
    expect(r).toMatchObject({
      '@odata.type': '#microsoft.graph.user',
    });
  });
});

test('iterateServicePrincipals', async () => {
  const config: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
    subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
  };

  recording = setupAzureRecording({
    directory: __dirname,
    name: 'iterateServicePrincipals',
  });

  const client = new DirectoryGraphClient(logger, config);

  const resources: any[] = [];
  await client.iterateServicePrincipals((e) => {
    resources.push(e);
  });

  expect(resources.length).toBeGreaterThan(0);
  resources.forEach((r) => {
    expect(r).toMatchObject({
      servicePrincipalType: expect.any(String),
    });
  });
});
