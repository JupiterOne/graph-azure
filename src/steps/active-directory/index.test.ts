import { Recording } from '@jupiterone/integration-sdk-testing';

import {
  setupAzureRecording,
  getMatchRequestsBy,
} from '../../../test/helpers/recording';
import { configFromEnv } from '../../../test/integrationInstanceConfig';
import { IntegrationConfig } from '../../types';
import {
  fetchAccount,
  fetchGroupMembers,
  fetchGroups,
  fetchUsers,
  fetchServicePrincipals,
} from './index';
import { createMockAzureStepExecutionContext } from '../../../test/createMockAzureStepExecutionContext';
import { Entity, Relationship } from '@jupiterone/integration-sdk-core';
import {
  ACCOUNT_ENTITY_TYPE,
  ACCOUNT_ENTITY_CLASS,
  USER_ENTITY_CLASS,
  USER_ENTITY_TYPE,
  ACCOUNT_USER_RELATIONSHIP_TYPE,
  GROUP_ENTITY_TYPE,
  GROUP_ENTITY_CLASS,
  ACCOUNT_GROUP_RELATIONSHIP_TYPE,
  GROUP_MEMBER_RELATIONSHIP_TYPE,
  GROUP_MEMBER_ENTITY_CLASS,
} from './constants';
import { filterGraphObjects } from '../../../test/helpers/filterGraphObjects';

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

function separateActiveDirectoryEntities(entities: Entity[]) {
  const {
    targets: accountEntities,
    rest: restAfterAccount,
  } = filterGraphObjects(entities, (e) => e._type === ACCOUNT_ENTITY_TYPE);
  const { targets: userEntities, rest: restAfterUsers } = filterGraphObjects(
    restAfterAccount,
    (e) => e._type === USER_ENTITY_TYPE,
  );
  const { targets: groupEntities, rest: restAfterGroups } = filterGraphObjects(
    restAfterUsers,
    (e) => e._type === GROUP_ENTITY_TYPE,
  );
  const {
    targets: groupMemberEntities,
    rest: restAfterGroupMembers,
  } = filterGraphObjects(restAfterGroups, (e) => e._type === GROUP_ENTITY_TYPE);

  return {
    accountEntities,
    userEntities,
    groupEntities,
    groupMemberEntities,
    restEntities: restAfterGroupMembers,
  };
}

function separateActiveDirectoryRelationships(relationships: Relationship[]) {
  const {
    targets: accountUserRelationships,
    rest: restAfterAccountUsers,
  } = filterGraphObjects(
    relationships,
    (r) => r._type === ACCOUNT_USER_RELATIONSHIP_TYPE,
  );
  const {
    targets: accountGroupRelationships,
    rest: restAfterAccountGroups,
  } = filterGraphObjects(
    restAfterAccountUsers,
    (r) => r._type === ACCOUNT_GROUP_RELATIONSHIP_TYPE,
  );
  const {
    targets: directGroupMemberRelationships,
    rest: restAfterDirectGroupMembers,
  } = filterGraphObjects(
    restAfterAccountGroups,
    (r) =>
      r._type === GROUP_MEMBER_RELATIONSHIP_TYPE && r._mapping === undefined,
  );
  const {
    targets: mappedGroupMemberRelationships,
    rest: restAfterMappedGroupMembers,
  } = filterGraphObjects(
    restAfterDirectGroupMembers,
    (r) =>
      r._type === GROUP_MEMBER_RELATIONSHIP_TYPE && r._mapping !== undefined,
  );
  return {
    accountUserRelationships,
    accountGroupRelationships,
    directGroupMemberRelationships,
    mappedGroupMemberRelationships,
    restRelationships: restAfterMappedGroupMembers,
  };
}

test('active directory steps', async () => {
  recording = setupAzureRecording({
    directory: __dirname,
    name: 'active-directory-steps',
    options: { matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }) },
  });

  const context = createMockAzureStepExecutionContext({
    instanceConfig: configFromEnv,
  });

  await fetchAccount(context);
  await fetchUsers(context);
  await fetchGroups(context);
  await fetchGroupMembers(context);

  const {
    accountEntities,
    userEntities,
    groupEntities,
    groupMemberEntities,
    restEntities,
  } = separateActiveDirectoryEntities(context.jobState.collectedEntities);

  expect(accountEntities.length).toBe(1);
  expect(accountEntities).toMatchGraphObjectSchema({
    _class: ACCOUNT_ENTITY_CLASS,
  });

  expect(userEntities.length).toBeGreaterThan(0);
  expect(userEntities).toMatchGraphObjectSchema({ _class: USER_ENTITY_CLASS });

  expect(groupEntities.length).toBeGreaterThan(0);
  expect(groupEntities).toMatchGraphObjectSchema({
    _class: GROUP_ENTITY_CLASS,
  });

  // expect(groupMemberEntities.length).toBeGreaterThan(0); // The 'ad-group-members' can simply return relationships in some cases.
  expect(groupMemberEntities).toMatchGraphObjectSchema({
    _class: GROUP_MEMBER_ENTITY_CLASS,
  });

  expect(restEntities.length).toBe(0);

  const {
    accountUserRelationships,
    accountGroupRelationships,
    directGroupMemberRelationships,
    mappedGroupMemberRelationships,
    restRelationships,
  } = separateActiveDirectoryRelationships(
    context.jobState.collectedRelationships,
  );

  expect(accountUserRelationships.length).toBeGreaterThan(0);
  expect(accountUserRelationships).toMatchDirectRelationshipSchema({});

  expect(accountGroupRelationships.length).toBeGreaterThan(0);
  expect(accountGroupRelationships).toMatchDirectRelationshipSchema({});

  // expect(directGroupMemberRelationships.length).toBeGreaterThan(0); // The 'ad-group-members' can simply return relationships in some cases.
  expect(directGroupMemberRelationships).toMatchDirectRelationshipSchema({});

  expect(mappedGroupMemberRelationships.length).toBeGreaterThan(0);
  for (const mappedGroupMemberRelationship of mappedGroupMemberRelationships) {
    expect(mappedGroupMemberRelationship).toMatchObject({
      _class: 'HAS',
      _key: expect.any(String),
      _type: GROUP_MEMBER_RELATIONSHIP_TYPE,
      _mapping: expect.objectContaining({
        sourceEntityKey: expect.any(String),
        targetEntity: expect.any(Object),
        targetFilterKeys: expect.any(Array),
      }),
    });
  }

  expect(restRelationships.length).toBe(0);
});

test('active directory step - service principals', async () => {
  const instanceConfig: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
    subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
  };

  recording = setupAzureRecording({
    directory: __dirname,
    name: 'active-directory-step-service-principals',
  });

  const context = createMockAzureStepExecutionContext({
    instanceConfig,
  });

  await fetchServicePrincipals(context);

  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: 'Service',
    schema: {
      additionalProperties: false,
      properties: {
        _type: { const: 'azure_service_principal' },
        userType: { const: 'service' },
        username: { type: 'string' },
        name: { type: 'string' },
        displayName: { type: 'string' },
        appDisplayName: { type: ['string', 'null'] },
        appId: { type: 'string' },
        servicePrincipalType: {
          type: 'string',
          enum: ['Application', 'SocialIdp'],
        },
        servicePrincipalNames: {
          type: 'array',
          items: { type: 'string' },
        },
        _rawData: {
          type: 'array',
          items: { type: 'object' },
        },
      },
    },
  });
});
