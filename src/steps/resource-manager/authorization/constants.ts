import { PrincipalType } from '@azure/arm-authorization/esm/models';
import {
  GROUP_ENTITY_TYPE,
  STEP_AD_GROUPS,
  USER_ENTITY_TYPE,
  STEP_AD_USERS,
  SERVICE_PRINCIPAL_ENTITY_TYPE,
  STEP_AD_SERVICE_PRINCIPALS,
} from '../../active-directory';
import {
  generateRelationshipType,
  StepRelationshipMetadata,
} from '@jupiterone/integration-sdk-core';
import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import {
  ResourceIdMap,
  RESOURCE_ID_TYPES_MAP,
  makeMatcherDependsOn,
  makeMatcherEntityTypes,
} from '../utils/findOrBuildResourceEntityFromResourceId';
import {
  RESOURCE_GROUP_ENTITY,
  STEP_RM_RESOURCES_RESOURCE_GROUPS,
} from '../resources';
import {
  SUBSCRIPTION_MATCHER,
  EOL_MATCHER,
  RESOURCE_GROUP_MATCHER,
} from '../utils/matchers';
import {
  entities as subscriptionEntities,
  steps as subscriptionSteps,
} from '../subscriptions/constants';

// Fetch Role Assignments
export const STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENTS =
  'rm-authorization-role-assignments';

export const ROLE_ASSIGNMENT_ENTITY_TYPE = 'azure_role_assignment';
export const ROLE_ASSIGNMENT_ENTITY_CLASS = ['AccessPolicy'];

// Build Role Assignment to Principal Relationships
export const STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENT_PRINCIPAL_RELATIONSHIPS =
  'rm-authorization-role-assignment-principal-relationships';

export const ROLE_ASSIGNMENT_PRINCIPAL_RELATIONSHIP_CLASS =
  RelationshipClass.ASSIGNED;

interface RoleAssignmentPrincipalMap {
  principalType: PrincipalType;
  type: string;
  dependsOn: string[];
}

export const ROLE_ASSIGNMENT_PRINCIPAL_TYPES_MAP: RoleAssignmentPrincipalMap[] = [
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

export const ROLE_ASSIGNMENT_DEFAULT_PRINCIPAL_TYPE =
  'azure_unknown_principal_type';

export const ROLE_ASSIGNMENT_PRINCIPAL_DEPENDS_ON = ([] as string[]).concat(
  ...ROLE_ASSIGNMENT_PRINCIPAL_TYPES_MAP.map((t) => t.dependsOn),
);
export const ROLE_ASSIGNMENT_PRINCIPAL_ENTITY_TYPES = ([] as string[]).concat(
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

export function createRoleAssignmentPrincipalRelationshipType(
  targetEntityType: string,
): StepRelationshipMetadata {
  return {
    _type: generateRelationshipType(
      ROLE_ASSIGNMENT_PRINCIPAL_RELATIONSHIP_CLASS,
      ROLE_ASSIGNMENT_ENTITY_TYPE,
      targetEntityType,
    ),
    sourceType: ROLE_ASSIGNMENT_ENTITY_TYPE,
    _class: ROLE_ASSIGNMENT_PRINCIPAL_RELATIONSHIP_CLASS,
    targetType: targetEntityType,
  };
}

export const ROLE_ASSIGNMENT_PRINCIPAL_RELATIONSHIP_TYPES = [
  createRoleAssignmentPrincipalRelationshipType(
    ROLE_ASSIGNMENT_DEFAULT_PRINCIPAL_TYPE,
  ),
  ...ROLE_ASSIGNMENT_PRINCIPAL_ENTITY_TYPES.map(
    createRoleAssignmentPrincipalRelationshipType,
  ),
];

// Build Role Assignment to Scope Relationships
export const STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENT_SCOPE_RELATIONSHIPS =
  'rm-authorization-role-assignment-scope-relationships';

export const SCOPE_TYPES_MAP: ResourceIdMap[] = [
  ...RESOURCE_ID_TYPES_MAP,
  {
    resourceIdMatcher: new RegExp(SUBSCRIPTION_MATCHER + EOL_MATCHER),
    _type: subscriptionEntities.SUBSCRIPTION._type,
    dependsOn: [subscriptionSteps.SUBSCRIPTIONS],
  },
  {
    resourceIdMatcher: new RegExp(RESOURCE_GROUP_MATCHER + EOL_MATCHER),
    _type: RESOURCE_GROUP_ENTITY._type,
    dependsOn: [STEP_RM_RESOURCES_RESOURCE_GROUPS],
  },
];

export const SCOPE_MATCHER_DEPENDS_ON = makeMatcherDependsOn(SCOPE_TYPES_MAP);
export const SCOPE_MATCHER_ENTITY_TYPES = makeMatcherEntityTypes(
  SCOPE_TYPES_MAP,
);

export const ROLE_ASSIGNMENT_SCOPE_RELATIONSHIP_CLASS =
  RelationshipClass.ALLOWS;

export function createRoleAssignmentScopeRelationshipType(
  targetEntityType: string,
): StepRelationshipMetadata {
  return {
    _type: generateRelationshipType(
      ROLE_ASSIGNMENT_SCOPE_RELATIONSHIP_CLASS,
      ROLE_ASSIGNMENT_ENTITY_TYPE,
      targetEntityType,
    ),
    sourceType: ROLE_ASSIGNMENT_ENTITY_TYPE,
    _class: ROLE_ASSIGNMENT_SCOPE_RELATIONSHIP_CLASS,
    targetType: targetEntityType,
  };
}

export const ROLE_ASSIGNMENT_SCOPE_RELATIONSHIP_TYPES = [
  ...SCOPE_MATCHER_ENTITY_TYPES.map(createRoleAssignmentScopeRelationshipType),
];

// Fetch Role Definitions
export const STEP_RM_AUTHORIZATION_ROLE_DEFINITIONS =
  'rm-authorization-role-definitions';

export const ROLE_DEFINITION_ENTITY_TYPE = 'azure_role_definition';
export const ROLE_DEFINITION_ENTITY_CLASS = ['AccessRole'];

export const ROLE_DEFINITION_RELATIONSHIP_CLASS = RelationshipClass.USES;
export const ROLE_DEFINITION_RELATIONSHIP_TYPE = generateRelationshipType(
  ROLE_DEFINITION_RELATIONSHIP_CLASS,
  ROLE_ASSIGNMENT_ENTITY_TYPE,
  ROLE_DEFINITION_ENTITY_TYPE,
);

// Fetch Classic Administrators
export const STEP_RM_AUTHORIZATION_CLASSIC_ADMINISTRATORS =
  'rm-authorization-classic-administrators';

export const CLASSIC_ADMINISTRATOR_ENTITY_KEY = 'azure_classic_admin_group';
export const CLASSIC_ADMINISTRATOR_ENTITY_TYPE = 'azure_classic_admin_group';
export const CLASSIC_ADMINISTRATOR_ENTITY_CLASS = 'UserGroup';

export const CLASSIC_ADMINISTRATOR_RELATIONSHIP_CLASS = RelationshipClass.HAS;
export const CLASSIC_ADMINISTRATOR_RELATIONSHIP_TYPE = generateRelationshipType(
  CLASSIC_ADMINISTRATOR_RELATIONSHIP_CLASS,
  CLASSIC_ADMINISTRATOR_ENTITY_TYPE,
  USER_ENTITY_TYPE,
);
