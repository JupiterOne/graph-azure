import {
  RoleDefinition,
  RoleAssignment,
} from '@azure/arm-authorization/esm/models';
import {
  Entity,
  Relationship,
  convertProperties,
  ExplicitRelationship,
  createDirectRelationship,
  createMappedRelationship,
  MappedRelationship,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import {
  ROLE_DEFINITION_ENTITY_CLASS,
  ROLE_DEFINITION_ENTITY_TYPE,
  ROLE_ASSIGNMENT_RELATIONSHIP_CLASS,
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
): Relationship {
  return {
    ...convertProperties(roleAssignment),
    webLink: webLinker.portalResourceUrl(roleAssignment.id),
  };
}
