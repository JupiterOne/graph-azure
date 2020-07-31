import {
  findOrCreateRoleDefinitionEntity,
  getRoleDefinitionKeyFromRoleAssignment,
} from '.';
import instanceConfig from '../../../../test/integrationInstanceConfig';
import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import { AuthorizationClient } from './client';
import { Entity } from '@jupiterone/integration-sdk-core';
import {
  ROLE_DEFINITION_ENTITY_TYPE,
  ROLE_DEFINITION_ENTITY_CLASS,
} from './constants';
import {
  PrincipalType,
  RoleAssignment,
} from '@azure/arm-authorization/esm/models';

describe('#findOrCreateRoleDefinitionEntity', () => {
  test('should find entity that exists in the job state', async () => {
    const client = ({
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
