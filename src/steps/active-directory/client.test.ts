import {
  createMockIntegrationLogger,
  Recording,
  setupRecording,
} from '@jupiterone/integration-sdk/testing';
import {
  DirectoryObject,
  DirectoryRole,
  Group,
  User,
} from '@microsoft/microsoft-graph-types';

import config from '../../../test/integrationInstanceConfig';
import { DirectoryGraphClient, GroupMember } from './client';

const logger = createMockIntegrationLogger();

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

test('iterateGroups', async () => {
  recording = setupRecording({ directory: __dirname, name: 'iterateGroups' });

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
    recording = setupRecording({
      directory: __dirname,
      name: 'iterateGroupMembersSelectProperty',
    });

    const resources: GroupMember[] = [];
    await client.iterateGroupMembers(
      {
        groupId: '1c417feb-b04f-46c9-a747-614d6d03f348',
        select: 'id',
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
    recording = setupRecording({
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
    recording = setupRecording({
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
    recording = setupRecording({
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
    recording = setupRecording({ directory: __dirname, name: 'iterateUsers' });

    const client = new DirectoryGraphClient(logger, config);

    const resources: User[] = [];
    await client.iterateUsers((e) => {
      resources.push(e);
    });

    expect(resources.length).toBeGreaterThan(0);
    resources.forEach((r) => {
      expect(r).toMatchObject({
        id: expect.any(String),
      });
    });
  });
});

test('iterateDirectoryRoles', async () => {
  recording = setupRecording({
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
  recording = setupRecording({
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
