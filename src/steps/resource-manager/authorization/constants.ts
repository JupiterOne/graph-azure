import { PrincipalType } from '@azure/arm-authorization/esm/models';
import {
  STEP_AD_GROUPS,
  STEP_AD_USERS,
  STEP_AD_SERVICE_PRINCIPALS,
  ADEntities,
} from '../../active-directory/constants';
import {
  generateRelationshipType,
  StepRelationshipMetadata,
} from '@jupiterone/integration-sdk-core';
import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { entities as subscriptionEntities } from '../subscriptions/constants';
import { ANY_SCOPE } from '../constants';

export const steps = {
  ROLE_ASSIGNMENTS: 'rm-authorization-role-assignments',
  ROLE_ASSIGNMENT_PRINCIPALS:
    'rm-authorization-role-assignment-principal-relationships',
  ROLE_ASSIGNMENT_SCOPES:
    'rm-authorization-role-assignment-scope-relationships',
  ROLE_DEFINITIONS: 'rm-authorization-role-definitions',
  ROLE_ASSIGNMENT_DEFINITIONS:
    'rm-authorization-role-assignment-definition-relationships',
  CLASSIC_ADMINS: 'rm-authorization-classic-administrators',
};

export const entities = {
  ROLE_DEFINITION: {
    _type: 'azure_role_definition',
    _class: ['AccessRole'],
    resourceName: '[RM] Role Definition',
  },
  CLASSIC_ADMIN: {
    _key: 'azure_classic_admin_group',
    _type: 'azure_classic_admin_group',
    _class: ['UserGroup'],
    resourceName: '[RM] Classic Admin',
  },
  ROLE_ASSIGNMENT: {
    _type: 'azure_role_assignment',
    _class: ['AccessPolicy'],
    resourceName: '[RM] Role Assignment',
  },
};

interface RoleAssignmentPrincipalMap {
  principalType: PrincipalType;
  type: string;
  dependsOn: string[];
}

const ROLE_ASSIGNMENT_PRINCIPAL_TYPES_MAP: RoleAssignmentPrincipalMap[] = [
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
    type: ADEntities.USER_GROUP._type,
    dependsOn: [STEP_AD_GROUPS],
  },
  {
    principalType: 'MSI',
    type: 'azure_msi',
    dependsOn: [],
  },
  {
    principalType: 'ServicePrincipal',
    type: ADEntities.SERVICE_PRINCIPAL._type,
    dependsOn: [STEP_AD_SERVICE_PRINCIPALS],
  },
  {
    principalType: 'Unknown',
    type: 'azure_unknown',
    dependsOn: [],
  },
  {
    principalType: 'User',
    type: ADEntities.USER._type,
    dependsOn: [STEP_AD_USERS],
  },
];

const ROLE_ASSIGNMENT_DEFAULT_PRINCIPAL_TYPE = 'azure_unknown_principal_type';

export const ROLE_ASSIGNMENT_PRINCIPAL_DEPENDS_ON = ([] as string[]).concat(
  ...ROLE_ASSIGNMENT_PRINCIPAL_TYPES_MAP.map((t) => t.dependsOn),
);
const ROLE_ASSIGNMENT_PRINCIPAL_ENTITY_TYPES = ([] as string[]).concat(
  ...ROLE_ASSIGNMENT_PRINCIPAL_TYPES_MAP.map((t) => t.type),
);

export function getJupiterTypeForPrincipalType(
  principalType: PrincipalType | undefined,
): string {
  return (
    ROLE_ASSIGNMENT_PRINCIPAL_TYPES_MAP.find(
      (t) => t.principalType === principalType,
    )?.type || ROLE_ASSIGNMENT_DEFAULT_PRINCIPAL_TYPE
  );
}

function createRoleAssignmentPrincipalRelationshipType(
  targetEntityType: string,
): StepRelationshipMetadata {
  return {
    _type: generateRelationshipType(
      RelationshipClass.ASSIGNED,
      entities.ROLE_ASSIGNMENT._type,
      targetEntityType,
    ),
    sourceType: entities.ROLE_ASSIGNMENT._type,
    _class: RelationshipClass.ASSIGNED,
    targetType: targetEntityType,
  };
}

const ROLE_ASSIGNMENT_PRINCIPAL_RELATIONSHIPS = [
  createRoleAssignmentPrincipalRelationshipType(
    ROLE_ASSIGNMENT_DEFAULT_PRINCIPAL_TYPE,
  ),
  ...ROLE_ASSIGNMENT_PRINCIPAL_ENTITY_TYPES.map(
    createRoleAssignmentPrincipalRelationshipType,
  ),
];

export const relationships = {
  CLASSIC_ADMIN_GROUP_HAS_USER: {
    _type: 'azure_classic_admin_group_has_user',
    sourceType: entities.CLASSIC_ADMIN._type,
    _class: RelationshipClass.HAS,
    targetType: ADEntities.USER._type,
  },
  ROLE_ASSIGNMENT_USES_DEFINITION: {
    _type: 'azure_role_assignment_uses_definition',
    sourceType: entities.ROLE_ASSIGNMENT._type,
    _class: RelationshipClass.USES,
    targetType: entities.ROLE_DEFINITION._type,
  },
  SUBSCRIPTION_CONTAINS_ROLE_DEFINITION: {
    _type: 'azure_subscription_contains_role_definition',
    sourceType: subscriptionEntities.SUBSCRIPTION._type,
    _class: RelationshipClass.CONTAINS,
    targetType: entities.ROLE_DEFINITION._type,
  },
  ROLE_ASSIGNMENT_ALLOWS_ANY_SCOPE: {
    _type: 'azure_role_assignment_allows_any_scope',
    sourceType: entities.ROLE_ASSIGNMENT._type,
    _class: RelationshipClass.ALLOWS,
    targetType: ANY_SCOPE,
  },
  ROLE_ASSIGNMENT_ASSIGNED_PRINCIPALS: ROLE_ASSIGNMENT_PRINCIPAL_RELATIONSHIPS,
};
