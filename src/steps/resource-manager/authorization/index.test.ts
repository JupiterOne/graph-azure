import {
  findOrCreateRoleDefinitionEntity,
  findOrBuildPrincipalEntityForRoleAssignment,
  fetchClassicAdministrators,
  fetchRoleAssignments,
  buildRoleAssignmentPrincipalRelationships,
  fetchRoleDefinitions,
  findOrBuildScopeEntityForRoleAssignment,
  buildRoleAssignmentScopeRelationships,
} from '.';
import instanceConfig from '../../../../test/integrationInstanceConfig';
import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import { AuthorizationClient } from './client';
import { Entity } from '@jupiterone/integration-sdk-core';
import {
  ROLE_DEFINITION_ENTITY_TYPE,
  ROLE_DEFINITION_ENTITY_CLASS,
  getJupiterTypeForPrincipalType,
  ROLE_ASSIGNMENT_ENTITY_TYPE,
  ROLE_ASSIGNMENT_ENTITY_CLASS,
  getJupiterTypeForScope,
} from './constants';
import {
  PrincipalType,
  RoleAssignment,
} from '@azure/arm-authorization/esm/models';
import { generateEntityKey } from '../../../utils/generateKeys';
import { setupAzureRecording } from '../../../../test/helpers/recording';
import { USER_ENTITY_TYPE, USER_ENTITY_CLASS } from '../../active-directory';
import { KEY_VAULT_SERVICE_ENTITY_TYPE } from '../key-vault';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

describe('#findOrCreateRoleDefinitionEntity', () => {
  test('should find entity that exists in the job state', async () => {
    const client = ({
      // eslint-disable-next-line @typescript-eslint/require-await
      getRoleDefinition: async () => {
        throw new Error(
          'should not have called client.getRoleDefinition if entity exists in job state!',
        );
      },
    } as unknown) as AuthorizationClient;
    const webLinker = {
      portalResourceUrl: () => {
        throw new Error(
          'should not have called webLinker.portalResourceUrl if entity exists in job state!',
        );
      },
    };

    const fullyQualifiedRoleDefinitionId =
      '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleDefinitions/role-definition-id';
    const roleAssignment: RoleAssignment = {
      id:
        '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id',
      name: 'role-assignment-name',
      type: 'Microsoft.Authorization/roleAssignments',
      scope: '/subscriptions/subscription-id',
      principalId: 'user-1',
      principalType: 'User' as PrincipalType,
      roleDefinitionId: fullyQualifiedRoleDefinitionId,
    };

    const roleDefinitionEntity: Entity = {
      _key: roleAssignment.roleDefinitionId as string,
      _type: ROLE_DEFINITION_ENTITY_TYPE,
      _class: ROLE_DEFINITION_ENTITY_CLASS,
    };

    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig,
      entities: [roleDefinitionEntity],
    });

    const result = await findOrCreateRoleDefinitionEntity(context, {
      client,
      webLinker,
      roleDefinitionId: roleAssignment.roleDefinitionId as string,
    });

    expect(result).toBe(roleDefinitionEntity);
  });

  test('should create entity that does not exist in the job state', async () => {
    const fullyQualifiedRoleDefinitionId =
      '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleDefinitions/role-definition-id';
    const roleAssignment: RoleAssignment = {
      id:
        '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id',
      name: 'role-assignment-name',
      type: 'Microsoft.Authorization/roleAssignments',
      scope: '/subscriptions/subscription-id',
      principalId: 'user-1',
      principalType: 'User' as PrincipalType,
      roleDefinitionId: fullyQualifiedRoleDefinitionId,
    };

    const roleDefinitionId = roleAssignment.roleDefinitionId as string;
    const getRoleDefinitionMock = jest.fn().mockResolvedValue({
      id: roleDefinitionId,
      name: 'role-definition-name',
      type: 'Microsoft.Authorization/roleDefinitions',
      roleName: 'Reader',
      description: 'Lets you view everything, but not make any changes.',
      roleType: 'BuiltInRole',
      permissions: [
        {
          actions: ['*/read'],
          notActions: [],
          dataActions: [],
          notDataActions: [],
        },
      ],
      assignableScopes: ['/'],
    });
    const client = ({
      getRoleDefinition: getRoleDefinitionMock,
    } as unknown) as AuthorizationClient;
    const portalResourceUrl = () =>
      `https://portal.azure.com/#@user.onmicrosoft.com/resource${roleDefinitionId}`;
    const webLinker = { portalResourceUrl };

    const roleDefinitionEntity: Entity = {
      _key: roleAssignment.roleDefinitionId as string,
      _type: ROLE_DEFINITION_ENTITY_TYPE,
      _class: ROLE_DEFINITION_ENTITY_CLASS,
    };

    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig,
      entities: [],
    });

    const result = await findOrCreateRoleDefinitionEntity(context, {
      client,
      webLinker,
      roleDefinitionId: roleAssignment.roleDefinitionId as string,
    });

    expect(getRoleDefinitionMock).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject(roleDefinitionEntity);
  });

  test('should throw if client.getRoleDefinition returns undefined', async () => {
    const fullyQualifiedRoleDefinitionId =
      '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleDefinitions/role-definition-id';
    const roleAssignment: RoleAssignment = {
      id:
        '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id',
      name: 'role-assignment-name',
      type: 'Microsoft.Authorization/roleAssignments',
      scope: '/subscriptions/subscription-id',
      principalId: 'user-1',
      principalType: 'User' as PrincipalType,
      roleDefinitionId: fullyQualifiedRoleDefinitionId,
    };

    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig,
      entities: [],
    });
    const loggerWarnMock = jest.spyOn(context.logger, 'warn');

    const options = {
      client: ({
        getRoleDefinition: jest.fn().mockResolvedValue(undefined),
      } as unknown) as AuthorizationClient,
      webLinker: {
        portalResourceUrl: jest
          .fn()
          .mockRejectedValue(
            new Error(
              'should not have called webLinker.portalResourceUrl if client.getRoleDefinition returns undefined!',
            ),
          ),
      },
      roleDefinitionId: roleAssignment.roleDefinitionId as string,
    };

    await expect(
      findOrCreateRoleDefinitionEntity(context, options),
    ).rejects.toThrow(
      'AuthorizationClient.getRoleDefinition returned "undefined" for roleDefinitionId.',
    );

    expect(loggerWarnMock).toHaveBeenCalledTimes(1);
  });
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

    const context = createMockStepExecutionContext<IntegrationConfig>({
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

    const context = createMockStepExecutionContext<IntegrationConfig>({
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

describe('#findOrBuildScopeEntityForRoleAssignment', () => {
  test('should find scope entity that exists in the job state', async () => {
    const scope =
      '/subscriptions/subscription-id/resourceGroups/resource-group-id/providers/Microsoft.KeyVault/vaults/key-vault-id';
    const entityType = getJupiterTypeForScope(scope);
    const targetEntity: Entity = {
      _class: ['Service'],
      _type: entityType,
      _key: scope,
    };

    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig,
      entities: [targetEntity],
    });

    const response = await findOrBuildScopeEntityForRoleAssignment(context, {
      scope,
    });

    expect(response).toBe(targetEntity);
  });

  test('should build placeholder scope entity that does not exist in the job state', async () => {
    const scope =
      '/subscriptions/subscription-id/resourceGroups/resource-group-id/providers/Microsoft.KeyVault/vaults/key-vault-id';
    const entityType = getJupiterTypeForScope(scope);

    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig,
      entities: [],
    });

    const response = await findOrBuildScopeEntityForRoleAssignment(context, {
      scope,
    });

    expect(response).toEqual({
      _type: entityType,
      _key: scope,
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

  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig,
  });

  context.jobState.getData = jest.fn().mockResolvedValue({
    defaultDomain: 'www.fake-domain.com',
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
    _type: ROLE_ASSIGNMENT_ENTITY_TYPE,
    _class: ROLE_ASSIGNMENT_ENTITY_CLASS,
    principalId: userEntityId,
    principalType: 'User' as PrincipalType,
  };

  const roleAssignmentMappedEntity = {
    _key:
      '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id-2',
    _type: ROLE_ASSIGNMENT_ENTITY_TYPE,
    _class: ROLE_ASSIGNMENT_ENTITY_CLASS,
    principalId: 'unknown-principal-id',
    principalType: 'User' as PrincipalType,
  };

  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig,
    entities: [
      userEntity,
      roleAssignmentDirectEntity,
      roleAssignmentMappedEntity,
    ],
  });

  context.jobState.getData = jest
    .fn()
    .mockRejectedValue(new Error('Should not call getData in this step!'));

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
    _type: KEY_VAULT_SERVICE_ENTITY_TYPE,
    _class: ['Service'],
  };

  const roleAssignmentDirectEntity = {
    _key:
      '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id',
    _type: ROLE_ASSIGNMENT_ENTITY_TYPE,
    _class: ROLE_ASSIGNMENT_ENTITY_CLASS,
    scope: keyVaultId,
  };

  const roleAssignmentMappedEntity = {
    _key:
      '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id-2',
    _type: ROLE_ASSIGNMENT_ENTITY_TYPE,
    _class: ROLE_ASSIGNMENT_ENTITY_CLASS,
    scope: keyVaultPrefix + 'some-non-keyvault',
  };

  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig,
    entities: [
      keyVaultEntity,
      roleAssignmentDirectEntity,
      roleAssignmentMappedEntity,
    ],
  });

  context.jobState.getData = jest
    .fn()
    .mockRejectedValue(new Error('Should not call getData in this step!'));

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
    {
      _class: 'ALLOWS',
      _mapping: {
        relationshipDirection: 'FORWARD',
        sourceEntityKey:
          '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id-2',
        targetEntity: {
          _key:
            '/subscriptions/subscription-id/resourceGroups/resource-group-id/providers/Microsoft.KeyVault/vaults/some-non-keyvault',
          _type: 'azure_keyvault_service',
        },
        targetFilterKeys: [['_key']],
      },
      displayName: 'ALLOWS',
      _key:
        '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id-2|allows|/subscriptions/subscription-id/resourceGroups/resource-group-id/providers/Microsoft.KeyVault/vaults/some-non-keyvault',
      _type: 'azure_role_assignment_allows_keyvault_service',
    },
  ]);
});

test('step - role definitions', async () => {
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
    _type: ROLE_ASSIGNMENT_ENTITY_TYPE,
    _class: ROLE_ASSIGNMENT_ENTITY_CLASS,
    roleDefinitionId:
      '/providers/Microsoft.Authorization/roleDefinitions/b24988ac-6180-42a0-ab88-20f7382dd24c',
  };

  const roleAssignmentEntityTwo = {
    _key:
      '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id-2',
    _type: ROLE_ASSIGNMENT_ENTITY_TYPE,
    _class: ROLE_ASSIGNMENT_ENTITY_CLASS,
    roleDefinitionId:
      '/providers/Microsoft.Authorization/roleDefinitions/b24988ac-6180-42a0-ab88-20f7382dd24c',
  };
  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig,
    entities: [roleAssignmentEntity, roleAssignmentEntityTwo],
  });

  context.jobState.getData = jest.fn().mockResolvedValue({
    defaultDomain: 'www.fake-domain.com',
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

  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig,
  });

  context.jobState.getData = jest.fn().mockResolvedValue({
    defaultDomain: 'www.fake-domain.com',
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
