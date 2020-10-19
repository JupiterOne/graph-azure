import { Recording } from '@jupiterone/integration-sdk-testing';

import { setupAzureRecording } from '../../../test/helpers/recording';
import instanceConfig from '../../../test/integrationInstanceConfig';
import { IntegrationConfig } from '../../types';
import {
  fetchAccount,
  fetchGroupMembers,
  fetchGroups,
  fetchUsers,
  fetchServicePrincipals,
} from './index';
import { createMockAzureStepExecutionContext } from '../../../test/createMockAzureStepExecutionContext';

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

test('active directory steps', async () => {
  recording = setupAzureRecording({
    directory: __dirname,
    name: 'active-directory-steps',
  });

  const context = createMockAzureStepExecutionContext({
    instanceConfig,
  });

  await fetchAccount(context);
  await fetchUsers(context);
  await fetchGroups(context);
  await fetchGroupMembers(context);

  expect(context.jobState.collectedEntities).toEqual([
    {
      _class: ['Account'],
      _key: 'local-integration-instance',
      _type: 'azure_account',
      _rawData: [expect.objectContaining({ name: 'default' })],
      createdOn: undefined,
      defaultDomain: 'adamjupiteronehotmailcom.onmicrosoft.com',
      displayName: 'Local Integration',
      id: 'a76fc728-0cba-45f0-a9eb-d45207e14513',
      name: 'Default Directory',
      organizationName: 'Default Directory',
      verifiedDomains: ['adamjupiteronehotmailcom.onmicrosoft.com'],
    },
    {
      _class: ['User'],
      _key: 'd0e84358-ed79-4ae0-9157-83d3a0ef9b78',
      _type: 'azure_user',
      _rawData: [expect.objectContaining({ name: 'default' })],
      createdOn: undefined,
      name: 'Adam Williams',
      displayName: 'Adam Williams',
      firstName: 'Adam',
      givenName: 'Adam',
      email: null,
      id: 'd0e84358-ed79-4ae0-9157-83d3a0ef9b78',
      lastName: 'Williams',
      preferredLanguage: 'en',
      surname: 'Williams',
      userPrincipalName: 'admin@adamjupiteronehotmailcom.onmicrosoft.com',
      username: 'admin@adamjupiteronehotmailcom.onmicrosoft.com',
    },
    {
      _class: ['User'],
      _key: '1bc373cb-36d4-4fd9-8996-b77d3544a380',
      _type: 'azure_user',
      _rawData: [expect.objectContaining({ name: 'default' })],
      createdOn: undefined,
      name: 'adam',
      displayName: 'adam',
      firstName: null,
      lastName: null,
      email: 'adam@thewilliams.ws',
      id: '1bc373cb-36d4-4fd9-8996-b77d3544a380',
      mail: 'adam@thewilliams.ws',
      userPrincipalName:
        'adam_thewilliams.ws#EXT#@adamjupiteronehotmailcom.onmicrosoft.com',
      username:
        'adam_thewilliams.ws#EXT#@adamjupiteronehotmailcom.onmicrosoft.com',
    },
    {
      _class: ['User'],
      _key: '894a1974-e9fa-4bcc-a560-91b58d1a224f',
      _type: 'azure_user',
      _rawData: [expect.objectContaining({ name: 'default' })],
      createdOn: undefined,
      name: 'Erkang Zheng',
      displayName: 'Erkang Zheng',
      email: 'erkang@gmail.com',
      firstName: 'Erkang',
      givenName: 'Erkang',
      id: '894a1974-e9fa-4bcc-a560-91b58d1a224f',
      lastName: 'Zheng',
      mail: 'erkang@gmail.com',
      surname: 'Zheng',
      userPrincipalName:
        'erkang_gmail.com#EXT#@adamjupiteronehotmailcom.onmicrosoft.com',
      username:
        'erkang_gmail.com#EXT#@adamjupiteronehotmailcom.onmicrosoft.com',
    },
    {
      _class: ['UserGroup'],
      _key: '1c417feb-b04f-46c9-a747-614d6d03f348',
      _type: 'azure_user_group',
      _rawData: [expect.objectContaining({ name: 'default' })],
      createdOn: 1567782403000,
      createdDateTime: 1567782403000,
      deletedOn: undefined,
      description: 'Developers working on the JupiterOne Azure Integration',
      name: 'Integration Developers',
      displayName: 'Integration Developers',
      id: '1c417feb-b04f-46c9-a747-614d6d03f348',
      email: null,
      mailEnabled: false,
      mailNickname: '21e62e82-8',
      renewedOn: 1567782403000,
      renewedDateTime: 1567782403000,
      securityEnabled: true,
      securityIdentifier: 'S-1-12-1-474054635-1187622991-1298220967-1223885677',
    },
    {
      _class: ['UserGroup'],
      _key: '58e48aba-cd45-440f-a851-2bf9715fadc1',
      _type: 'azure_user_group',
      _rawData: [expect.objectContaining({ name: 'default' })],
      createdOn: 1567617474000,
      createdDateTime: 1567617474000,
      deletedOn: undefined,
      description: 'Users authorized to managed things (test)',
      name: 'Managers',
      displayName: 'Managers',
      id: '58e48aba-cd45-440f-a851-2bf9715fadc1',
      email: null,
      mailEnabled: false,
      mailNickname: 'bd565bd0-d',
      renewedOn: 1567617474000,
      renewedDateTime: 1567617474000,
      securityEnabled: true,
      securityIdentifier:
        'S-1-12-1-1491372730-1141886277-4180365736-3249364849',
    },
  ]);
  expect(context.jobState.collectedRelationships).toEqual([
    {
      _class: 'HAS',
      _fromEntityKey: 'local-integration-instance',
      _key:
        'local-integration-instance|has|d0e84358-ed79-4ae0-9157-83d3a0ef9b78',
      _toEntityKey: 'd0e84358-ed79-4ae0-9157-83d3a0ef9b78',
      _type: 'azure_account_has_user',
      displayName: 'HAS',
    },
    {
      _class: 'HAS',
      _fromEntityKey: 'local-integration-instance',
      _key:
        'local-integration-instance|has|1bc373cb-36d4-4fd9-8996-b77d3544a380',
      _toEntityKey: '1bc373cb-36d4-4fd9-8996-b77d3544a380',
      _type: 'azure_account_has_user',
      displayName: 'HAS',
    },
    {
      _class: 'HAS',
      _fromEntityKey: 'local-integration-instance',
      _key:
        'local-integration-instance|has|894a1974-e9fa-4bcc-a560-91b58d1a224f',
      _toEntityKey: '894a1974-e9fa-4bcc-a560-91b58d1a224f',
      _type: 'azure_account_has_user',
      displayName: 'HAS',
    },
    {
      _class: 'HAS',
      _fromEntityKey: 'local-integration-instance',
      _key:
        'local-integration-instance|has|1c417feb-b04f-46c9-a747-614d6d03f348',
      _toEntityKey: '1c417feb-b04f-46c9-a747-614d6d03f348',
      _type: 'azure_account_has_group',
      displayName: 'HAS',
    },
    {
      _class: 'HAS',
      _fromEntityKey: 'local-integration-instance',
      _key:
        'local-integration-instance|has|58e48aba-cd45-440f-a851-2bf9715fadc1',
      _toEntityKey: '58e48aba-cd45-440f-a851-2bf9715fadc1',
      _type: 'azure_account_has_group',
      displayName: 'HAS',
    },
    {
      _class: 'HAS',
      _key:
        '1c417feb-b04f-46c9-a747-614d6d03f348_d0e84358-ed79-4ae0-9157-83d3a0ef9b78',
      _mapping: {
        relationshipDirection: 'FORWARD',
        sourceEntityKey: '1c417feb-b04f-46c9-a747-614d6d03f348',
        targetEntity: {
          _class: 'User',
          _key: 'd0e84358-ed79-4ae0-9157-83d3a0ef9b78',
          _type: 'azure_user',
          displayName: 'Adam Williams',
          email: null,
          jobTitle: null,
        },
        targetFilterKeys: [['_type', '_key']],
      },
      _type: 'azure_group_has_member',
      displayName: 'HAS',
      groupId: '1c417feb-b04f-46c9-a747-614d6d03f348',
      memberId: 'd0e84358-ed79-4ae0-9157-83d3a0ef9b78',
      memberType: '#microsoft.graph.user',
    },
    {
      _class: 'HAS',
      _key:
        '1c417feb-b04f-46c9-a747-614d6d03f348_1bc373cb-36d4-4fd9-8996-b77d3544a380',
      _mapping: {
        relationshipDirection: 'FORWARD',
        sourceEntityKey: '1c417feb-b04f-46c9-a747-614d6d03f348',
        targetEntity: {
          _class: 'User',
          _key: '1bc373cb-36d4-4fd9-8996-b77d3544a380',
          _type: 'azure_user',
          displayName: 'adam',
          email: 'adam@thewilliams.ws',
          jobTitle: null,
        },
        targetFilterKeys: [['_type', '_key']],
      },
      _type: 'azure_group_has_member',
      displayName: 'HAS',
      groupId: '1c417feb-b04f-46c9-a747-614d6d03f348',
      memberId: '1bc373cb-36d4-4fd9-8996-b77d3544a380',
      memberType: '#microsoft.graph.user',
    },
    {
      _class: 'HAS',
      _key:
        '1c417feb-b04f-46c9-a747-614d6d03f348_58e48aba-cd45-440f-a851-2bf9715fadc1',
      _mapping: {
        relationshipDirection: 'FORWARD',
        sourceEntityKey: '1c417feb-b04f-46c9-a747-614d6d03f348',
        targetEntity: {
          _class: 'UserGroup',
          _key: '58e48aba-cd45-440f-a851-2bf9715fadc1',
          _type: 'azure_user_group',
          displayName: 'Managers',
          email: null,
          jobTitle: undefined,
        },
        targetFilterKeys: [['_type', '_key']],
      },
      _type: 'azure_group_has_member',
      displayName: 'HAS',
      groupId: '1c417feb-b04f-46c9-a747-614d6d03f348',
      memberId: '58e48aba-cd45-440f-a851-2bf9715fadc1',
      memberType: '#microsoft.graph.group',
    },
    {
      _class: 'HAS',
      _key:
        '58e48aba-cd45-440f-a851-2bf9715fadc1_1bc373cb-36d4-4fd9-8996-b77d3544a380',
      _mapping: {
        relationshipDirection: 'FORWARD',
        sourceEntityKey: '58e48aba-cd45-440f-a851-2bf9715fadc1',
        targetEntity: {
          _class: 'User',
          _key: '1bc373cb-36d4-4fd9-8996-b77d3544a380',
          _type: 'azure_user',
          displayName: 'adam',
          email: 'adam@thewilliams.ws',
          jobTitle: null,
        },
        targetFilterKeys: [['_type', '_key']],
      },
      _type: 'azure_group_has_member',
      displayName: 'HAS',
      groupId: '58e48aba-cd45-440f-a851-2bf9715fadc1',
      memberId: '1bc373cb-36d4-4fd9-8996-b77d3544a380',
      memberType: '#microsoft.graph.user',
    },
  ]);
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
