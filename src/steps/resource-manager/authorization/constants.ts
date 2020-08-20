import { PrincipalType } from '@azure/arm-authorization/esm/models';
import {
  GROUP_ENTITY_TYPE,
  STEP_AD_GROUPS,
  USER_ENTITY_TYPE,
  STEP_AD_USERS,
  SERVICE_PRINCIPAL_ENTITY_TYPE,
  STEP_AD_SERVICE_PRINCIPALS,
} from '../../active-directory';
import { generateRelationshipType } from '@jupiterone/integration-sdk-core';

// Fetch Role Assignments & Definitions
export const STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENTS_AND_DEFINITIONS =
  'rm-authorization-role-assignments-and-definitions';

export const ROLE_DEFINITION_ENTITY_TYPE = 'azure_role_definition';
export const ROLE_DEFINITION_ENTITY_CLASS = ['AccessRole', 'AccessPolicy'];

export const ROLE_ASSIGNMENT_RELATIONSHIP_CLASS = 'ASSIGNED';

interface RoleAssignmentMap {
  principalType: PrincipalType;
  type: string;
  dependsOn: string[];
}

export const ROLE_ASSIGNMENT_TYPES_MAP: RoleAssignmentMap[] = [
  {
    principalType: 'Application',
    type: 'azure_application',
    dependsOn: [],
  },
  {
    principalType: 'DirectoryObjectOrGroup',
    type: 'azure_directory',
    dependsOn: [],
  },
  {
    principalType: 'DirectoryRoleTemplate',
    type: 'azure_directory_role_template',
    dependsOn: [],
  },
  {
    principalType: 'Everyone',
    type: 'azure_everyone',
    dependsOn: [],
  },
  {
    principalType: 'ForeignGroup',
    type: 'azure_foreign_group',
    dependsOn: [],
  },
  {
    principalType: 'Group',
    type: GROUP_ENTITY_TYPE,
    dependsOn: [STEP_AD_GROUPS],
  },
  {
    principalType: 'MSI',
    type: 'azure_msi',
    dependsOn: [],
  },
  {
    principalType: 'ServicePrincipal',
    type: SERVICE_PRINCIPAL_ENTITY_TYPE,
    dependsOn: [STEP_AD_SERVICE_PRINCIPALS],
  },
  {
    principalType: 'Unknown',
    type: 'azure_unknown',
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
  principalType: PrincipalType | undefined,
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

// Fetch Classic Administrators
export const STEP_RM_AUTHORIZATION_CLASSIC_ADMINISTRATORS =
  'rm-authorization-classic-administrators';

export const CLASSIC_ADMINISTRATOR_ENTITY_KEY = 'azure_classic_admin_group';
export const CLASSIC_ADMINISTRATOR_ENTITY_TYPE = 'azure_classic_admin_group';
export const CLASSIC_ADMINISTRATOR_RELATIONSHIP_TYPE =
  'azure_classic_admin_group_has_user';
export const CLASSIC_ADMINISTRATOR_ENTITY_CLASS = 'UserGroup';
