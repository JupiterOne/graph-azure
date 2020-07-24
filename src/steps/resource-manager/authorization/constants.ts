import { PrincipalType } from '@azure/arm-authorization/esm/models';
import {
  GROUP_ENTITY_TYPE,
  STEP_AD_GROUPS,
  USER_ENTITY_TYPE,
  STEP_AD_USERS,
} from '../../active-directory';
import { generateRelationshipType } from '@jupiterone/integration-sdk-core';

// Fetch Role Assignments
export const STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENTS =
  'rm-authorization-role-assignments';
export const ROLE_ASSIGNMENT_DATA_KEY = 'role-assignments-data';

// Fetch Role Definitions
export const STEP_RM_AUTHORIZATION_ROLE_DEFINITIONS =
  'rm-authorization-role-definitions';
export const ROLE_DEFINITION_ENTITY_TYPE = 'azure_role_definition';
export const ROLE_DEFINITION_ENTITY_CLASS = ['AccessRole', 'AccessPolicy'];

// Create Role Assignment Relationships
export const STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENT_RELATIONSHIPS =
  'rm-authorization-role-assignment-relationships';
export const ROLE_ASSIGNMENT_RELATIONSHIP_CLASS = 'TRUSTS';

interface RoleAssignmentMap {
  principalType: PrincipalType;
  type: string;
  dependsOn: string[];
}

export const ROLE_ASSIGNMENT_TYPES_MAP: RoleAssignmentMap[] = [
  {
    principalType: 'Application',
    type: 'azure_application_placeholder',
    dependsOn: [],
  },
  {
    principalType: 'DirectoryObjectOrGroup',
    type: 'azure_directory_placeholder',
    dependsOn: [],
  },
  {
    principalType: 'DirectoryRoleTemplate',
    type: 'azure_directory_role_template_placeholder',
    dependsOn: [],
  },
  {
    principalType: 'Everyone',
    type: 'azure_everyone_placeholder',
    dependsOn: [],
  },
  {
    principalType: 'ForeignGroup',
    type: 'azure_foreign_group_placeholder',
    dependsOn: [],
  },
  {
    principalType: 'Group',
    type: GROUP_ENTITY_TYPE,
    dependsOn: [STEP_AD_GROUPS],
  },
  {
    principalType: 'MSI',
    type: 'azure_msi_placeholder',
    dependsOn: [],
  },
  {
    principalType: 'ServicePrincipal',
    type: 'azure_service_principal_placeholder',
    dependsOn: [],
  },
  {
    principalType: 'Unknown',
    type: 'azure_unknown_placeholder',
    dependsOn: [],
  },
  {
    principalType: 'User',
    type: USER_ENTITY_TYPE,
    dependsOn: [STEP_AD_USERS],
  },
];

export const ROLE_ASSIGNMENT_DEFAULT_TYPE = 'azure_unknown_role_target';

export const ROLE_ASSIGNMENT_DEPENDS_ON = ([] as string[]).concat(
  ...ROLE_ASSIGNMENT_TYPES_MAP.map((t) => t.dependsOn),
);
export const ROLE_ASSIGNMENT_TARGET_ENTITY_TYPES = ([] as string[]).concat(
  ...ROLE_ASSIGNMENT_TYPES_MAP.map((t) => t.type),
);

export function getJupiterTypeForPrincipalType(
  principalType: PrincipalType,
): string {
  return (
    ROLE_ASSIGNMENT_TYPES_MAP.find((t) => t.principalType === principalType)
      ?.type || ROLE_ASSIGNMENT_DEFAULT_TYPE
  );
}

export function createRoleAssignmentRelationshipType(
  targetEntityType: string,
): string {
  return generateRelationshipType(
    ROLE_ASSIGNMENT_RELATIONSHIP_CLASS,
    ROLE_DEFINITION_ENTITY_TYPE,
    targetEntityType,
  );
}

export const ROLE_ASSIGNMENT_RELATIONSHIP_TYPES = [
  createRoleAssignmentRelationshipType(ROLE_ASSIGNMENT_DEFAULT_TYPE),
  ...ROLE_ASSIGNMENT_TARGET_ENTITY_TYPES.map(
    createRoleAssignmentRelationshipType,
  ),
];
