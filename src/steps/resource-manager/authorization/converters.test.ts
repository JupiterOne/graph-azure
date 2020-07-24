import { convertProperties } from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { createRoleDefinitionEntity } from './converters';
import { RoleDefinition } from '@azure/arm-authorization/esm/models';

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
