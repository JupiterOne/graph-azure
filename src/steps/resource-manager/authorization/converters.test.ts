import {
  convertProperties,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import {
  createRoleDefinitionEntity,
  createRoleAssignmentRelationship,
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
        '/providers/Microsoft.Authorization/roleDefinitions/8e3af657-a8ff-443c-a75c-2fe8c4bcb635',
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

describe('createRoleAssignmentRelationship', () => {
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

    expect(createRoleAssignmentRelationship(webLinker, roleAssignment)).toEqual(
      {
        ...convertProperties(roleAssignment),
        _class: 'TRUSTS',
        _key:
          '/providers/Microsoft.Authorization/roleDefinitions/8e3af657-a8ff-443c-a75c-2fe8c4bcb635|trusts|FORWARD:id=b6e7f627-8731-47bd-be0e-477d1cbc6e17',
        _mapping: {
          relationshipDirection: RelationshipDirection.FORWARD,
          skipTargetCreation: false,
          sourceEntityKey:
            '/providers/Microsoft.Authorization/roleDefinitions/8e3af657-a8ff-443c-a75c-2fe8c4bcb635',
          targetEntity: {
            id: 'b6e7f627-8731-47bd-be0e-477d1cbc6e17',
          },
          targetFilterKeys: ['id'],
        },
        _type: 'azure_role_definition_trusts_user',
        displayName: 'TRUSTS',
        webLink:
          'https://portal.azure.com/#@something.onmicrosoft.com/resource/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/providers/Microsoft.Authorization/roleAssignments/c967042a-aad6-4e3b-8485-1c85d5e6f9e8',
        id:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/providers/Microsoft.Authorization/roleAssignments/c967042a-aad6-4e3b-8485-1c85d5e6f9e8',
        name: 'c967042a-aad6-4e3b-8485-1c85d5e6f9e8',
        principalType: 'User',
        scope: '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7',
        type: 'Microsoft.Authorization/roleAssignments',
      },
    );
  });
});
