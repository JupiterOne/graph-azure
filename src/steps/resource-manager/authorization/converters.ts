import {
  RoleDefinition,
  Permission,
} from '@azure/arm-authorization/esm/models';
import { convertProperties, Entity } from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import {
  ROLE_DEFINITION_ENTITY_CLASS,
  ROLE_DEFINITION_ENTITY_TYPE,
} from './constants';

export function convertPermissionsToRulesList(
  permissions: Permission[] | undefined,
): string[] {
  const rules: string[] = [];
  // [{ actions: ['*'], notActions: [], dataActions: [], notDataActions: [] }]
  if (permissions) {
    // { actions: ['*'], notActions: [], dataActions: [], notDataActions [] }
    for (const permission of permissions) {
      // actions || notActions || dataActions || notDataActions
      for (const actionKey of Object.keys(permission)) {
        // '*'
        for (const action of permission[actionKey]) {
          // 'actions = *'
          rules.push(`${actionKey} = ${action}`);
        }
      }
    }
  }
  return rules;
}

export function createRoleDefinitionEntity(
  webLinker: AzureWebLinker,
  data: RoleDefinition,
): Entity {
  const entity = {
    ...convertProperties(data),
    _key: data.id as string,
    _type: ROLE_DEFINITION_ENTITY_TYPE,
    _class: ROLE_DEFINITION_ENTITY_CLASS,
    _rawData: [{ name: 'default', rawData: data }],
    displayName: data.roleName,
    description: data.description,
    rules: convertPermissionsToRulesList(data.permissions),
    webLink: webLinker.portalResourceUrl(data.id),
  };
  return entity;
}
