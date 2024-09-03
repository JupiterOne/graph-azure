import { SchemaType } from '@jupiterone/integration-sdk-core';
import { createEntityType, createEntityMetadata } from '../../../helpers';

// Authorization Entities
export const [RoleDefinitionEntityMetadata, createRoleDefinitionAssignEntity] =
  createEntityMetadata({
    resourceName: '[RM] Role Definition',
    _class: ['AccessRole'],
    _type: createEntityType('role_definition'),
    description: 'Azure Role Definition',
    schema: SchemaType.Object({}),
  });

export const [
  ClassicAdminGroupEntityMetadata,
  createClassicAdminGroupAssignEntity,
] = createEntityMetadata({
  resourceName: '[RM] Classic Admin',
  _class: ['UserGroup'],
  _type: createEntityType('classic_admin_group'),
  description: 'Azure Classic Admin',
  schema: SchemaType.Object({}),
});

export const [RoleAssignmentEntityMetadata, createRoleAssignmentAssignEntity] =
  createEntityMetadata({
    resourceName: '[RM] Role Assignment',
    _class: ['AccessPolicy'],
    _type: createEntityType('role_assignment'),
    description: 'Azure Role Assignment',
    schema: SchemaType.Object({}),
  });
