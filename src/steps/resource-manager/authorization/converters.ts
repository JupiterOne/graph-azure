import { RoleDefinition } from '@azure/arm-authorization/esm/models';
import { convertProperties, Entity } from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import {
  ROLE_DEFINITION_ENTITY_CLASS,
  ROLE_DEFINITION_ENTITY_TYPE,
} from './constants';

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
    actions: ([] as string[]).concat(
      ...(data.permissions?.map((p) => p.actions || []) || []),
    ),
    notActions: ([] as string[]).concat(
      ...(data.permissions?.map((p) => p.notActions || []) || []),
    ),
    dataActions: ([] as string[]).concat(
      ...(data.permissions?.map((p) => p.dataActions || []) || []),
    ),
    notDataActions: ([] as string[]).concat(
      ...(data.permissions?.map((p) => p.notDataActions || []) || []),
    ),
    webLink: webLinker.portalResourceUrl(data.id),
  };
  return entity;
}
