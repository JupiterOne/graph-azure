import { convertProperties, Entity } from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import {
  createRoleDefinitionEntity,
  createRoleAssignmentDirectRelationship,
  createRoleAssignmentMappedRelationship,
} from './converters';
import {
  RoleDefinition,
  RoleAssignment,
} from '@azure/arm-authorization/esm/models';

const webLinker = createAzureWebLinker('something.onmicrosoft.com');

describe('createRoleDefinitionEntity', () => {
  test('properties transferred', () => {
    const data: RoleDefinition = {
      id:
        '/providers/Microsoft.Authorization/roleDefinitions/8e3af657-a8ff-443c-a75c-2fe8c4bcb635',
      name: '8e3af657-a8ff-443c-a75c-2fe8c4bcb635',
      type: 'Microsoft.Authorization/roleDefinitions',
      roleName: 'Owner',
      description: 'Lets you manage everything, including access to resources.',
      roleType: 'BuiltInRole',
      permissions: [
        {
          actions: ['*', 'other-action'],
          notActions: ['not-action'],
          dataActions: [],
          notDataActions: [],
        },
        {
          actions: ['a-third-action'],
          notActions: [],
          dataActions: [],
          notDataActions: [],
        },
      ],
      assignableScopes: ['/'],
    };

    expect(createRoleDefinitionEntity(webLinker, data)).toEqual({
      ...convertProperties(data),
      _key:
        'azure_role_definition_/providers/Microsoft.Authorization/roleDefinitions/8e3af657-a8ff-443c-a75c-2fe8c4bcb635',
      _type: 'azure_role_definition',
      _class: ['AccessRole', 'AccessPolicy'],
      _rawData: [{ name: 'default', rawData: data }],
      displayName: 'Owner',
      type: 'Microsoft.Authorization/roleDefinitions',
      webLink: webLinker.portalResourceUrl(
        '/providers/Microsoft.Authorization/roleDefinitions/8e3af657-a8ff-443c-a75c-2fe8c4bcb635',
      ),
      actions: ['*', 'other-action', 'a-third-action'],
      notActions: ['not-action'],
      dataActions: [],
      notDataActions: [],
    });
  });
});

describe('createRoleAssignmentDirectRelationship', () => {
  test('properties transferred', () => {
    const roleAssignment: RoleAssignment = {
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/providers/Microsoft.Authorization/roleAssignments/c967042a-aad6-4e3b-8485-1c85d5e6f9e8',
      name: 'c967042a-aad6-4e3b-8485-1c85d5e6f9e8',
      type: 'Microsoft.Authorization/roleAssignments',
      scope: '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7',
      roleDefinitionId:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/providers/Microsoft.Authorization/roleDefinitions/8e3af657-a8ff-443c-a75c-2fe8c4bcb635',
      principalId: 'b6e7f627-8731-47bd-be0e-477d1cbc6e17',
      principalType: 'User',
    };

    const from: Entity = {
      _class: ['AccessRole', 'AccessPolicy'],
      _key: 'azure_role_definition-1',
      _type: 'azure_role_definition',
    };

    const to: Entity = {
      _class: 'User',
      _key: 'azure_user-1',
      _type: 'azure_user',
    };

    expect(
      createRoleAssignmentDirectRelationship({
        webLinker,
        roleAssignment,
        from,
        to,
      }),
    ).toEqual({
      _class: 'ASSIGNED',
      _fromEntityKey: 'azure_role_definition-1',
      _key: 'azure_role_definition-1|assigned|azure_user-1',
      _toEntityKey: 'azure_user-1',
      _type: 'azure_role_definition_assigned_user',
      displayName: 'ASSIGNED',
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/providers/Microsoft.Authorization/roleAssignments/c967042a-aad6-4e3b-8485-1c85d5e6f9e8',
      name: 'c967042a-aad6-4e3b-8485-1c85d5e6f9e8',
      principalId: 'b6e7f627-8731-47bd-be0e-477d1cbc6e17',
      principalType: 'User',
      roleDefinitionId:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/providers/Microsoft.Authorization/roleDefinitions/8e3af657-a8ff-443c-a75c-2fe8c4bcb635',
      scope: '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7',
      type: 'Microsoft.Authorization/roleAssignments',
      webLink:
        'https://portal.azure.com/#@something.onmicrosoft.com/resource/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/providers/Microsoft.Authorization/roleAssignments/c967042a-aad6-4e3b-8485-1c85d5e6f9e8',
    });
  });
});

describe('createRoleAssignmentMappedRelationship', () => {
  test('properties transferred', () => {
    const roleAssignment: RoleAssignment = {
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/providers/Microsoft.Authorization/roleAssignments/c967042a-aad6-4e3b-8485-1c85d5e6f9e8',
      name: 'c967042a-aad6-4e3b-8485-1c85d5e6f9e8',
      type: 'Microsoft.Authorization/roleAssignments',
      scope: '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7',
      roleDefinitionId:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/providers/Microsoft.Authorization/roleDefinitions/8e3af657-a8ff-443c-a75c-2fe8c4bcb635',
      principalId: 'b6e7f627-8731-47bd-be0e-477d1cbc6e17',
      principalType: 'User',
    };

    const source: Entity = {
      _class: ['AccessRole', 'AccessPolicy'],
      _key: 'azure_role_definition-1',
      _type: 'azure_role_definition',
    };

    const target = {
      _key: 'azure_user-2',
      _type: 'azure_user',
    };

    expect(
      createRoleAssignmentMappedRelationship({
        webLinker,
        roleAssignment,
        source,
        target,
      }),
    ).toEqual({
      _class: 'ASSIGNED',
      _key: 'azure_role_definition-1|assigned|azure_user-2',
      _mapping: {
        relationshipDirection: 'FORWARD',
        sourceEntityKey: 'azure_role_definition-1',
        sourceEntityType: 'azure_role_definition',
        targetEntity: {
          _key: 'azure_user-2',
          _type: 'azure_user',
        },
        targetFilterKeys: [['_type', '_key']],
      },
      _type: 'azure_role_definition_assigned_user',
      displayName: 'ASSIGNED',
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/providers/Microsoft.Authorization/roleAssignments/c967042a-aad6-4e3b-8485-1c85d5e6f9e8',
      name: 'c967042a-aad6-4e3b-8485-1c85d5e6f9e8',
      principalId: 'b6e7f627-8731-47bd-be0e-477d1cbc6e17',
      principalType: 'User',
      roleDefinitionId:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/providers/Microsoft.Authorization/roleDefinitions/8e3af657-a8ff-443c-a75c-2fe8c4bcb635',
      scope: '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7',
      type: 'Microsoft.Authorization/roleAssignments',
      webLink:
        'https://portal.azure.com/#@something.onmicrosoft.com/resource/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/providers/Microsoft.Authorization/roleAssignments/c967042a-aad6-4e3b-8485-1c85d5e6f9e8',
    });
  });
});
