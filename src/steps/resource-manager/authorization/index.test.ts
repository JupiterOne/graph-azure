import {
  findOrBuildPrincipalEntityForRoleAssignment,
  fetchClassicAdministrators,
  fetchRoleAssignments,
  buildRoleAssignmentPrincipalRelationships,
  fetchRoleDefinitions,
  buildRoleAssignmentScopeRelationships,
} from '.';
import instanceConfig, {
  configFromEnv,
} from '../../../../test/integrationInstanceConfig';
import { Recording } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import { Entity } from '@jupiterone/integration-sdk-core';
import {
  entities,
  getJupiterTypeForPrincipalType,
  relationships,
} from './constants';
import {
  PrincipalType,
  RoleAssignment,
} from '@azure/arm-authorization/esm/models';
import { generateEntityKey } from '../../../utils/generateKeys';
import {
  getMatchRequestsBy,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import {
  USER_ENTITY_TYPE,
  USER_ENTITY_CLASS,
  ACCOUNT_ENTITY_TYPE,
} from '../../active-directory';
import { entities as keyvaultEntities } from '../key-vault/constants';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import {
  getMockAccountEntity,
  getMockSubscriptionEntity,
} from '../../../../test/helpers/getMockEntity';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

describe('#findOrBuildTargetEntityForRoleDefinition', () => {
  test('should find target entity that exists in the job state', async () => {
    const principalId = 'user-1';
    const principalType = 'User' as PrincipalType;
    const entityType = getJupiterTypeForPrincipalType(principalType);
    const targetEntity: Entity = {
      _class: 'User',
      _type: entityType,
      _key: generateEntityKey(principalId),
    };

    const roleAssignment: RoleAssignment = {
      roleDefinitionId:
        '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleDefinitions/role-definition-id',
      id:
        '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id',
      name: 'role-assignment-name',
      type: 'Microsoft.Authorization/roleAssignments',
      scope: '/subscriptions/subscription-id',
      principalId,
      principalType,
    };

    const context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [targetEntity],
    });

    const response = await findOrBuildPrincipalEntityForRoleAssignment(
      context,
      {
        principalId: roleAssignment.principalId as string,
        principalType: roleAssignment.principalType as string,
      },
    );

    expect(response).toBe(targetEntity);
  });

  test('should build placeholder entity that does not exist in the job state', async () => {
    const principalId = 'user-1';
    const principalType = 'User' as PrincipalType;
    const entityType = getJupiterTypeForPrincipalType(principalType);

    const roleAssignment: RoleAssignment = {
      roleDefinitionId:
        '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleDefinitions/role-definition-id',
      id:
        '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id',
      name: 'role-assignment-name',
      type: 'Microsoft.Authorization/roleAssignments',
      scope: '/subscriptions/subscription-id',
      principalId,
      principalType,
    };

    const context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [],
    });

    const response = await findOrBuildPrincipalEntityForRoleAssignment(
      context,
      {
        principalId: roleAssignment.principalId as string,
        principalType: roleAssignment.principalType as string,
      },
    );

    expect(response).toEqual({
      _type: entityType,
      _key: generateEntityKey(principalId),
    });
  });
});

test('step - role assignments', async () => {
  const instanceConfig: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
    subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
  };

  recording = setupAzureRecording({
    directory: __dirname,
    name: 'active-directory-step-role-assignments',
  });

  const context = createMockAzureStepExecutionContext({
    instanceConfig,
    setData: {
      [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
    },
  });

  await fetchRoleAssignments(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: 'AccessPolicy',
    schema: {
      additionalProperties: false,
      properties: {
        _type: { const: 'azure_role_assignment' },
        _key: { type: 'string' },
        _class: { type: 'array', items: { const: 'AccessRole' } },
        id: { type: 'string' },
        name: { type: 'string' },
        displayName: { type: 'string' },
        type: { const: 'Microsoft.Authorization/roleAssignments' },
        scope: { type: 'string' },
        roleDefinitionId: { type: 'string' },
        principalId: { type: 'string' },
        principalType: { type: 'string' },
        webLink: { type: 'string' },
        canDelegate: { type: 'boolean' },
        _rawData: { type: 'array', items: { type: 'object' } },
      },
    },
  });
  expect(context.jobState.collectedRelationships.length).toBe(0);
});

test('step - role assignment principal relationships', async () => {
  const instanceConfig: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
    subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
  };

  const userEntityId = 'principal-id';
  const userEntity = {
    _key: generateEntityKey(userEntityId),
    _type: USER_ENTITY_TYPE,
    _class: USER_ENTITY_CLASS,
    principalId: 'principal-id',
    principalType: 'User' as PrincipalType,
  };

  const roleAssignmentDirectEntity = {
    _key:
      '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id',
    _type: entities.ROLE_ASSIGNMENT._type,
    _class: entities.ROLE_ASSIGNMENT._class,
    principalId: userEntityId,
    principalType: 'User' as PrincipalType,
  };

  const roleAssignmentMappedEntity = {
    _key:
      '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id-2',
    _type: entities.ROLE_ASSIGNMENT._type,
    _class: entities.ROLE_ASSIGNMENT._class,
    principalId: 'unknown-principal-id',
    principalType: 'User' as PrincipalType,
  };

  const context = createMockAzureStepExecutionContext({
    instanceConfig,
    entities: [
      userEntity,
      roleAssignmentDirectEntity,
      roleAssignmentMappedEntity,
    ],
  });

  await buildRoleAssignmentPrincipalRelationships(context);

  expect(context.jobState.collectedEntities.length).toBe(0);
  expect(context.jobState.collectedRelationships).toEqual([
    {
      _key:
        '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id|assigned|principal-id',
      _type: 'azure_role_assignment_assigned_user',
      _class: 'ASSIGNED',
      _fromEntityKey:
        '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id',
      _toEntityKey: 'principal-id',
      displayName: 'ASSIGNED',
    },
    {
      _class: 'ASSIGNED',
      _mapping: {
        relationshipDirection: 'FORWARD',
        sourceEntityKey:
          '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id-2',
        targetEntity: {
          _key: 'unknown-principal-id',
          _type: 'azure_user',
        },
        targetFilterKeys: [['_type', '_key']],
      },
      displayName: 'ASSIGNED',
      _key:
        '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id-2|assigned|unknown-principal-id',
      _type: 'mapping_source_assigned_azure_user',
    },
  ]);
});

test('step - role assignment scope relationships', async () => {
  const instanceConfig: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
    subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
  };

  const keyVaultPrefix =
    '/subscriptions/subscription-id/resourceGroups/resource-group-id/providers/Microsoft.KeyVault/vaults/';
  const keyVaultId = keyVaultPrefix + 'key-vault-id';

  const keyVaultEntity = {
    _key: keyVaultId,
    _type: keyvaultEntities.KEY_VAULT._type,
    _class: keyvaultEntities.KEY_VAULT._class,
  };

  const roleAssignmentDirectEntity = {
    _key:
      '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id',
    _type: entities.ROLE_ASSIGNMENT._type,
    _class: entities.ROLE_ASSIGNMENT._class,
    scope: keyVaultId,
  };

  const roleAssignmentMappedEntity = {
    _key:
      '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id-2',
    _type: entities.ROLE_ASSIGNMENT._type,
    _class: entities.ROLE_ASSIGNMENT._class,
    scope: keyVaultPrefix + 'some-non-keyvault',
  };

  const context = createMockAzureStepExecutionContext({
    instanceConfig,
    entities: [
      keyVaultEntity,
      roleAssignmentDirectEntity,
      roleAssignmentMappedEntity,
    ],
  });

  await buildRoleAssignmentScopeRelationships(context);

  expect(context.jobState.collectedEntities.length).toBe(0);
  expect(context.jobState.collectedRelationships).toEqual([
    {
      _key:
        '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id|allows|/subscriptions/subscription-id/resourceGroups/resource-group-id/providers/Microsoft.KeyVault/vaults/key-vault-id',
      _type: 'azure_role_assignment_allows_keyvault_service',
      _class: 'ALLOWS',
      _fromEntityKey:
        '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id',
      _toEntityKey:
        '/subscriptions/subscription-id/resourceGroups/resource-group-id/providers/Microsoft.KeyVault/vaults/key-vault-id',
      displayName: 'ALLOWS',
    },
  ]);
});

test.skip('step - role definitions', async () => {
  const instanceConfig: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
    subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
  };

  recording = setupAzureRecording({
    directory: __dirname,
    name: 'active-directory-step-role-definitions',
  });

  const roleAssignmentEntity = {
    _key:
      '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id-1',
    _type: entities.ROLE_ASSIGNMENT._type,
    _class: entities.ROLE_ASSIGNMENT._class,
    roleDefinitionId:
      '/providers/Microsoft.Authorization/roleDefinitions/b24988ac-6180-42a0-ab88-20f7382dd24c',
  };

  const roleAssignmentEntityTwo = {
    _key:
      '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id-2',
    _type: entities.ROLE_ASSIGNMENT._type,
    _class: entities.ROLE_ASSIGNMENT._class,
    roleDefinitionId:
      '/providers/Microsoft.Authorization/roleDefinitions/b24988ac-6180-42a0-ab88-20f7382dd24c',
  };
  const context = createMockAzureStepExecutionContext({
    instanceConfig,
    entities: [roleAssignmentEntity, roleAssignmentEntityTwo],
    setData: {
      [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
    },
  });

  await fetchRoleDefinitions(context);

  expect(context.jobState.collectedEntities.length).toBe(1);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: 'AccessRole',
    schema: {
      additionalProperties: false,
      properties: {
        _type: { const: 'azure_role_definition' },
        _key: { type: 'string' },
        _class: { type: 'array', items: { const: 'AccessPolicy' } },
        id: { type: 'string' },
        name: { type: 'string' },
        displayName: { type: 'string' },
        type: { const: 'Microsoft.Authorization/roleDefinitions' },
        roleName: { type: 'string' },
        description: { type: 'string' },
        roleType: { type: 'string', enum: ['BuiltInRole', 'CustomRole'] },
        assignableScopes: { type: 'array', items: { type: 'string' } },
        _rawData: { type: 'array', items: { type: 'object' } },
        actions: { type: 'array', items: { type: 'string' } },
        notActions: { type: 'array', items: { type: 'string' } },
        dataActions: { type: 'array', items: { type: 'string' } },
        notDataActions: { type: 'array', items: { type: 'string' } },
        webLink: { type: 'string' },
      },
    },
  });

  expect(context.jobState.collectedRelationships).toEqual([
    {
      _key:
        '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id-1|uses|/providers/Microsoft.Authorization/roleDefinitions/b24988ac-6180-42a0-ab88-20f7382dd24c',
      _type: 'azure_role_assignment_uses_definition',
      _class: 'USES',
      _toEntityKey:
        '/providers/Microsoft.Authorization/roleDefinitions/b24988ac-6180-42a0-ab88-20f7382dd24c',
      _fromEntityKey:
        '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id-1',
      displayName: 'USES',
    },
    {
      _key:
        '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id-2|uses|/providers/Microsoft.Authorization/roleDefinitions/b24988ac-6180-42a0-ab88-20f7382dd24c',
      _type: 'azure_role_assignment_uses_definition',
      _class: 'USES',
      _toEntityKey:
        '/providers/Microsoft.Authorization/roleDefinitions/b24988ac-6180-42a0-ab88-20f7382dd24c',
      _fromEntityKey:
        '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id-2',
      displayName: 'USES',
    },
  ]);
});

describe('rm-authorization-role-definitions', () => {
  function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);
    const subscriptionEntity = getMockSubscriptionEntity(config);
    return { accountEntity, subscriptionEntity };
  }

  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-authorization-role-definitions',
      options: {
        matchRequestsBy: getMatchRequestsBy({
          config: configFromEnv,
          shouldReplaceSubscriptionId: () => true,
        }),
      },
    });

    const { accountEntity, subscriptionEntity } = getSetupEntities(
      configFromEnv,
    );
    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [subscriptionEntity],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchRoleDefinitions(context);

    const roleDefinitionEntities = context.jobState.collectedEntities;

    expect(roleDefinitionEntities.length).toBeGreaterThan(0);
    expect(roleDefinitionEntities).toMatchGraphObjectSchema({
      _class: entities.ROLE_DEFINITION._class,
    });

    const subscriptionRoleDefinitionRelationships =
      context.jobState.collectedRelationships;

    expect(subscriptionRoleDefinitionRelationships.length).toBe(
      roleDefinitionEntities.length,
    );
    expect(
      subscriptionRoleDefinitionRelationships,
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: {
            const: relationships.SUBSCRIPTION_CONTAINS_ROLE_DEFINITION._type,
          },
        },
      },
    });
  });
});

test('step - classic administrators', async () => {
  const instanceConfig: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
    subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
  };

  recording = setupAzureRecording({
    directory: __dirname,
    name: 'active-directory-step-classic-administrators',
  });

  const context = createMockAzureStepExecutionContext({
    instanceConfig,
    setData: {
      [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
    },
  });

  await fetchClassicAdministrators(context);

  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: 'UserGroup',
    schema: {
      additionalProperties: false,
      properties: {
        _type: { const: 'azure_classic_admin_group' },
        _key: { const: 'azure_classic_admin_group' },
        _class: { type: 'array', items: { const: 'UserGroup' } },
        name: { const: 'Azure Classic Administrator' },
        displayName: { const: 'Azure Classic Administrator' },
        _rawData: { type: 'array', items: { type: 'object' } },
      },
    },
  });

  expect(context.jobState.collectedRelationships).toEqual([
    {
      _class: 'HAS',
      _mapping: {
        relationshipDirection: 'FORWARD',
        sourceEntityKey: 'azure_classic_admin_group',
        targetFilterKeys: [['_type', 'userPrincipalName']],
        targetEntity: {
          _type: 'azure_user',
          userPrincipalName: '',
        },
      },
      displayName: 'HAS',
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/providers/Microsoft.Authorization/classicAdministrators/',
      name: '',
      type: 'Microsoft.Authorization/classicAdministrators',
      emailAddress: '',
      role: 'ServiceAdministrator;AccountAdministrator',
      webLink:
        'https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/providers/Microsoft.Authorization/classicAdministrators/',
      _key:
        'azure_classic_admin_group|has|FORWARD:_type=azure_user:userPrincipalName=',
      _type: 'azure_classic_admin_group_has_user',
    },
    {
      _class: 'HAS',
      _mapping: {
        relationshipDirection: 'FORWARD',
        sourceEntityKey: 'azure_classic_admin_group',
        targetFilterKeys: [['_type', 'userPrincipalName']],
        targetEntity: {
          _type: 'azure_user',
          userPrincipalName:
            'ndowmon_gmail.com#EXT#@ndowmongmail.onmicrosoft.com',
        },
      },
      displayName: 'HAS',
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/providers/Microsoft.Authorization/classicAdministrators/00030000D25AEAF7',
      name: '00030000D25AEAF7',
      type: 'Microsoft.Authorization/classicAdministrators',
      emailAddress: 'ndowmon_gmail.com#EXT#@ndowmongmail.onmicrosoft.com',
      role: 'CoAdministrator',
      webLink:
        'https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/providers/Microsoft.Authorization/classicAdministrators/00030000D25AEAF7',
      _key:
        'azure_classic_admin_group|has|FORWARD:_type=azure_user:userPrincipalName=ndowmon_gmail.com#EXT#@ndowmongmail.onmicrosoft.com',
      _type: 'azure_classic_admin_group_has_user',
    },
  ]);
});
