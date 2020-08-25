import { convertProperties } from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import {
  createRoleDefinitionEntity,
  createClassicAdministratorEntity,
  createClassicAdministratorHasUserRelationship,
  createRoleAssignmentEntity,
} from './converters';
import {
  RoleDefinition,
  RoleAssignment,
  ClassicAdministrator,
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
      _class: ['AccessRole'],
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

describe('createRoleAssignmentEntity', () => {
  test('properties transferred', () => {
    const data: RoleAssignment = {
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/providers/Microsoft.Authorization/roleAssignments/10000000-0000-0000-0000-000000000000',
      name: '10000000-0000-0000-0000-000000000000',
      type: 'Microsoft.Authorization/roleAssignments',
      scope: '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7',
      roleDefinitionId:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/providers/Microsoft.Authorization/roleDefinitions/8bfcfc94-cf28-d595-8e3d-851a1eb7c8fa',
      principalId: '64242f8f-67ee-4f0c-b644-0766b42e8e91',
      principalType: 'ServicePrincipal',
    };

    expect(createRoleAssignmentEntity(webLinker, data)).toEqual({
      _class: ['AccessPolicy'],
      _key:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/providers/Microsoft.Authorization/roleAssignments/10000000-0000-0000-0000-000000000000',
      _rawData: [
        {
          name: 'default',
          rawData: {
            id:
              '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/providers/Microsoft.Authorization/roleAssignments/10000000-0000-0000-0000-000000000000',
            name: '10000000-0000-0000-0000-000000000000',
            principalId: '64242f8f-67ee-4f0c-b644-0766b42e8e91',
            principalType: 'ServicePrincipal',
            roleDefinitionId:
              '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/providers/Microsoft.Authorization/roleDefinitions/8bfcfc94-cf28-d595-8e3d-851a1eb7c8fa',
            scope: '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7',
            type: 'Microsoft.Authorization/roleAssignments',
          },
        },
      ],
      _type: 'azure_role_assignment',
      canDelegate: undefined,
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/providers/Microsoft.Authorization/roleAssignments/10000000-0000-0000-0000-000000000000',
      name: '10000000-0000-0000-0000-000000000000',
      displayName: '10000000-0000-0000-0000-000000000000',
      principalId: '64242f8f-67ee-4f0c-b644-0766b42e8e91',
      principalType: 'ServicePrincipal',
      roleDefinitionId:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/providers/Microsoft.Authorization/roleDefinitions/8bfcfc94-cf28-d595-8e3d-851a1eb7c8fa',
      scope: '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7',
      type: 'Microsoft.Authorization/roleAssignments',
      webLink:
        'https://portal.azure.com/#@something.onmicrosoft.com/resource/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/providers/Microsoft.Authorization/roleAssignments/10000000-0000-0000-0000-000000000000',
      createdOn: undefined,
    });
  });
});

describe('createClassicAdministratorEntity', () => {
  test('classicAdministratorEntity created', () => {
    expect(createClassicAdministratorEntity()).toEqual({
      _key: 'azure_classic_admin_group',
      _class: ['UserGroup'],
      _rawData: [],
      _type: 'azure_classic_admin_group',
      createdOn: undefined,
      displayName: 'Azure Classic Administrator',
      name: 'Azure Classic Administrator',
    });
  });
});

describe('createClassicAdministratorHasUserRelationship', () => {
  test('properties transferred', () => {
    const classicAdministratorGroupEntity = createClassicAdministratorEntity();
    const classicAdministrator: ClassicAdministrator = {
      id:
        '/subscriptions/subscription-id/providers/Microsoft.Authorization/classicAdministrators/id',
      name: 'id',
      type: 'Microsoft.Authorization/classicAdministrators',
      emailAddress: 'user-principal-name',
      role: 'CoAdministrator',
    };

    expect(
      createClassicAdministratorHasUserRelationship({
        webLinker,
        classicAdministratorGroupEntity,
        data: classicAdministrator,
      }),
    ).toEqual({
      _class: 'HAS',
      _key:
        'azure_classic_admin_group|has|FORWARD:_type=azure_user:userPrincipalName=user-principal-name',
      _type: 'mapping_source_has_azure_user',
      _mapping: {
        relationshipDirection: 'FORWARD',
        sourceEntityKey: 'azure_classic_admin_group',
        targetEntity: {
          _type: 'azure_user',
          userPrincipalName: 'user-principal-name',
        },
        targetFilterKeys: [['_type', 'userPrincipalName']],
      },
      displayName: 'HAS',
      emailAddress: 'user-principal-name',
      id:
        '/subscriptions/subscription-id/providers/Microsoft.Authorization/classicAdministrators/id',
      name: 'id',
      role: 'CoAdministrator',
      type: 'Microsoft.Authorization/classicAdministrators',
      webLink:
        'https://portal.azure.com/#@something.onmicrosoft.com/resource/subscriptions/subscription-id/providers/Microsoft.Authorization/classicAdministrators/id',
    });
  });
});
