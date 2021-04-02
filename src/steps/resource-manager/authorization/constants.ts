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
    _class: 'UserGroup',
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
const SCOPE_MATCHER_ENTITY_TYPES = makeMatcherEntityTypes(SCOPE_TYPES_MAP);

function createRoleAssignmentScopeRelationshipType(
  targetEntityType: string,
): StepRelationshipMetadata {
  return {
    _type: generateRelationshipType(
      RelationshipClass.ALLOWS,
      entities.ROLE_ASSIGNMENT._type,
      targetEntityType,
    ),
    sourceType: entities.ROLE_ASSIGNMENT._type,
    _class: RelationshipClass.ALLOWS,
    targetType: targetEntityType,
  };
}

const ROLE_ASSIGNMENT_SCOPE_RELATIONSHIPS = [
  ...SCOPE_MATCHER_ENTITY_TYPES.map(createRoleAssignmentScopeRelationshipType),
];

export const relationships = {
  CLASSIC_ADMIN_GROUP_HAS_USER: {
    _type: 'azure_classic_admin_group_has_user',
    sourceType: entities.CLASSIC_ADMIN._type,
    _class: RelationshipClass.HAS,
    targetType: USER_ENTITY_TYPE,
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
  ROLE_ASSIGNMENT_ALLOWS_SCOPES: ROLE_ASSIGNMENT_SCOPE_RELATIONSHIPS,
  ROLE_ASSIGNMENT_ASSIGNED_PRINCIPALS: ROLE_ASSIGNMENT_PRINCIPAL_RELATIONSHIPS,
};
