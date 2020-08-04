import {
  RoleDefinition,
  RoleAssignment,
  ClassicAdministrator,
} from '@azure/arm-authorization/esm/models';
import {
  Entity,
  convertProperties,
  ExplicitRelationship,
  createDirectRelationship,
  createMappedRelationship,
  MappedRelationship,
  createIntegrationEntity,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import {
  ROLE_DEFINITION_ENTITY_CLASS,
  ROLE_DEFINITION_ENTITY_TYPE,
  ROLE_ASSIGNMENT_RELATIONSHIP_CLASS,
  CLASSIC_ADMINISTRATOR_ENTITY_TYPE,
  CLASSIC_ADMINISTRATOR_ENTITY_CLASS,
  CLASSIC_ADMINISTRATOR_ENTITY_KEY,
} from './constants';
import { USER_ENTITY_TYPE } from '../../active-directory';

export function createClassicAdministratorEntity(): Entity {
  return createIntegrationEntity({
    entityData: {
      source: {},
      assign: {
        _key: CLASSIC_ADMINISTRATOR_ENTITY_KEY,
        _type: CLASSIC_ADMINISTRATOR_ENTITY_TYPE,
        _class: CLASSIC_ADMINISTRATOR_ENTITY_CLASS,
        name: 'Azure Classic Administrator',
      },
    },
  });
}

export function createClassicAdministratorHasUserRelationship(options: {
  webLinker: AzureWebLinker;
  classicAdministratorGroupEntity: Entity;
  data: ClassicAdministrator;
}): MappedRelationship {
  const { webLinker, classicAdministratorGroupEntity, data } = options;
  return createMappedRelationship({
    _class: 'HAS',
    _mapping: {
      relationshipDirection: RelationshipDirection.FORWARD,
      sourceEntityKey: classicAdministratorGroupEntity._key,
      sourceEntityType: classicAdministratorGroupEntity._type,
      targetFilterKeys: [['_type', 'userPrincipalName']],
      targetEntity: {
        _type: USER_ENTITY_TYPE,
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

interface CreateRoleAssignmentDirectRelationshipOptions {
  webLinker: AzureWebLinker;
  roleAssignment: RoleAssignment;
  from: Entity;
  to: Entity;
}

export function createRoleAssignmentDirectRelationship({
  webLinker,
  roleAssignment,
  from,
  to,
}: CreateRoleAssignmentDirectRelationshipOptions): ExplicitRelationship {
  return createDirectRelationship({
    _class: ROLE_ASSIGNMENT_RELATIONSHIP_CLASS,
    from,
    to,
    properties: getRoleAssignmentRelationshipProperties(
      webLinker,
      roleAssignment,
    ),
  });
}

interface CreateRoleAssignmentMappedRelationshipOptions {
  webLinker: AzureWebLinker;
  roleAssignment: RoleAssignment;
  source: Entity;
  target: Partial<Entity> & { _type: string; _key: string };
}

export function createRoleAssignmentMappedRelationship({
  webLinker,
  roleAssignment,
  source,
  target,
}: CreateRoleAssignmentMappedRelationshipOptions): MappedRelationship {
  return createMappedRelationship({
    _class: ROLE_ASSIGNMENT_RELATIONSHIP_CLASS,
    source,
    target,
    properties: getRoleAssignmentRelationshipProperties(
      webLinker,
      roleAssignment,
    ),
  });
}

export function getRoleAssignmentRelationshipProperties(
  webLinker: AzureWebLinker,
  roleAssignment: RoleAssignment,
): { [key: string]: any } {
  return {
    ...convertProperties(roleAssignment),
    webLink: webLinker.portalResourceUrl(roleAssignment.id),
  };
}
