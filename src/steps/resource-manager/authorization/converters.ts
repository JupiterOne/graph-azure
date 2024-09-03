import {
  RoleDefinition,
  RoleAssignment,
  ClassicAdministrator,
} from '@azure/arm-authorization/esm/models';
import {
  Entity,
  convertProperties,
  createMappedRelationship,
  MappedRelationship,
  createIntegrationEntity,
  RelationshipDirection,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import { entities, relationships } from './constants';
import { ADEntities } from '../../active-directory/constants';

export function createClassicAdministratorEntity(): Entity {
  return createIntegrationEntity({
    entityData: {
      source: {},
      assign: {
        _key: entities.CLASSIC_ADMIN._type,
        _type: entities.CLASSIC_ADMIN._type,
        _class: entities.CLASSIC_ADMIN._class,
        name: 'Azure Classic Administrator',
      },
    },
  });
}

export function createClassicAdministratorHasUserMappedRelationship(options: {
  webLinker: AzureWebLinker;
  classicAdministratorGroupEntity: Entity;
  data: ClassicAdministrator;
}): MappedRelationship {
  const { webLinker, classicAdministratorGroupEntity, data } = options;
  return createMappedRelationship({
    _class: RelationshipClass.HAS,
    _type: relationships.CLASSIC_ADMIN_GROUP_HAS_USER._type,
    _mapping: {
      relationshipDirection: RelationshipDirection.FORWARD,
      sourceEntityKey: classicAdministratorGroupEntity._key,
      targetFilterKeys: [['_type', 'userPrincipalName']],
      targetEntity: {
        _type: ADEntities.USER._type,
        userPrincipalName: data.emailAddress,
      },
    },
    properties: {
      id: data.id,
      name: data.name,
      type: data.type,
      emailAddress: data.emailAddress,
      role: data.role,
      webLink: webLinker.portalResourceUrl(data.id),
    },
  });
}

export function createRoleAssignmentEntity(
  webLinker: AzureWebLinker,
  data: RoleAssignment,
  roleDefinition: RoleDefinition | undefined,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        _type: entities.ROLE_ASSIGNMENT._type,
        _class: entities.ROLE_ASSIGNMENT._class,
        name: data.name,
        displayName: data.name,
        type: data.type,
        scope: data.scope,
        roleDefinitionId: data.roleDefinitionId,
        principalId: data.principalId,
        principalType: data.principalType,
        canDelegate: data.canDelegate,
        ...(roleDefinition ? getActionsForRoleDefinition(roleDefinition) : {}),
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}

function getActionsForRoleDefinition(data: RoleDefinition) {
  return {
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
  };
}

export function createRoleDefinitionEntity(
  webLinker: AzureWebLinker,
  data: RoleDefinition,
): Entity {
  const entity = {
    ...convertProperties(data),
    _key: data.id as string,
    _type: entities.ROLE_DEFINITION._type,
    _class: entities.ROLE_DEFINITION._class,
    _rawData: [{ name: 'default', rawData: data }],
    displayName: data.roleName,
    description: data.description,
    ...getActionsForRoleDefinition(data),
    webLink: webLinker.portalResourceUrl(data.id),
  };
  return entity;
}
