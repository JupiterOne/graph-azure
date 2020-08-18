import {
  findOrCreateRoleDefinitionEntity,
  getRoleDefinitionKeyFromRoleAssignment,
  findOrBuildTargetEntityForRoleDefinition,
  fetchClassicAdministrators,
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
} from './constants';
import {
  PrincipalType,
  RoleAssignment,
} from '@azure/arm-authorization/esm/models';
import { generateEntityKey } from '../../../utils/generateKeys';
import { setupAzureRecording } from '../../../../test/helpers/recording';

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
      _key: getRoleDefinitionKeyFromRoleAssignment(roleAssignment),
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
      roleAssignment,
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

    const roleDefinitionId = getRoleDefinitionKeyFromRoleAssignment(
      roleAssignment,
    );
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
      _key: getRoleDefinitionKeyFromRoleAssignment(roleAssignment),
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
      roleAssignment,
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
      roleAssignment,
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
      _key: generateEntityKey(entityType, principalId),
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

    const response = await findOrBuildTargetEntityForRoleDefinition(context, {
      roleAssignment,
    });

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

    const response = await findOrBuildTargetEntityForRoleDefinition(context, {
      roleAssignment,
    });

    expect(response).toEqual({
      _type: entityType,
      _key: generateEntityKey(entityType, principalId),
    });
  });
});

test('active directory step - classic administrators', async () => {
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
      _type: 'mapping_source_has_azure_user',
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
      _type: 'mapping_source_has_azure_user',
    },
  ]);
});
