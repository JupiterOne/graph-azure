import { RelationshipClass } from '@jupiterone/integration-sdk-core';

// Step IDs
export const STEP_AD_ACCOUNT = 'ad-account';
export const STEP_AD_GROUPS = 'ad-groups';
export const STEP_AD_GROUP_MEMBERS = 'ad-group-members';
export const STEP_AD_USER_REGISTRATION_DETAILS = 'ad-user-registration-details';
export const STEP_AD_USERS = 'ad-users';
export const STEP_AD_DEVICES = 'ad-devices';
export const STEP_AD_SERVICE_PRINCIPALS = 'ad-service-principals';
export const STEP_AD_ROLE_DEFINITIONS = 'ad-role-definitions';
export const STEP_AD_ROLE_ASSIGNMENTS = 'ad-role-assignments';
export const STEP_AD_SERVICE_PRINCIPAL_ACCESS =
  'ad-role-service_principal_access';
// Graph objects
export const ACCOUNT_ENTITY_TYPE = 'azure_account';
export const ACCOUNT_ENTITY_CLASS = ['Account'];

export const GROUP_ENTITY_TYPE = 'azure_user_group';
export const GROUP_ENTITY_CLASS = ['UserGroup'];

export const USER_ENTITY_TYPE = 'azure_user';
export const USER_ENTITY_CLASS = ['User'];

export const DEVICE_ENTITY_TYPE = 'azure_device';
export const DEVICE_ENTITY_CLASS = ['Device'];

export const SERVICE_PRINCIPAL_ENTITY_TYPE = 'azure_service_principal';
export const SERVICE_PRINCIPAL_ENTITY_CLASS = ['Service'];

/**
 * The entity type used for members of groups which are not one of the ingested
 * directory objects.
 */
export const GROUP_MEMBER_ENTITY_TYPE = 'azure_group_member';

/**
 * The entity class used for members of groups which are not one of the ingested
 * directory objects.
 */
export const GROUP_MEMBER_ENTITY_CLASS = 'User';

export const ACCOUNT_GROUP_RELATIONSHIP_TYPE = 'azure_account_has_group';
export const ACCOUNT_USER_RELATIONSHIP_TYPE = 'azure_account_has_user';
export const USER_HAS_DEVICE_RELATIONSHIP_TYPE = 'azure_user_has_device';
export const GROUP_MEMBER_RELATIONSHIP_TYPE = 'azure_group_has_member';

export const ADEntities = {
  ACCOUNT: {
    resourceName: '[AD] Account',
    _type: ACCOUNT_ENTITY_TYPE,
    _class: 'Account',
  },
  USER: {
    resourceName: '[AD] User',
    _type: USER_ENTITY_TYPE,
    _class: 'User',
  },
  DEVICE: {
    resourceName: '[AD] Device',
    _type: DEVICE_ENTITY_TYPE,
    _class: DEVICE_ENTITY_CLASS,
  },
  USER_GROUP: {
    resourceName: '[AD] Group',
    _type: GROUP_ENTITY_TYPE,
    _class: 'UserGroup',
  },
  GROUP_MEMBER: {
    resourceName: '[AD] Group Member',
    _type: GROUP_MEMBER_ENTITY_TYPE,
    _class: 'User',
  },
  SERVICE_PRINCIPAL: {
    resourceName: '[AD] Service Principal',
    _type: SERVICE_PRINCIPAL_ENTITY_TYPE,
    _class: SERVICE_PRINCIPAL_ENTITY_CLASS,
  },
  AD_ROLE_DEFINITION: {
    resourceName: '[AD] Role Definition',
    _type: 'azure_ad_role_definition',
    _class: ['AccessRole'],
  },
};

export const ADRelationships = {
  ACCOUNT_HAS_USER: {
    _type: ACCOUNT_USER_RELATIONSHIP_TYPE,
    sourceType: ACCOUNT_ENTITY_TYPE,
    _class: RelationshipClass.HAS,
    targetType: USER_ENTITY_TYPE,
  },
  USER_HAS_DEVICE: {
    _type: USER_HAS_DEVICE_RELATIONSHIP_TYPE,
    sourceType: USER_ENTITY_TYPE,
    _class: RelationshipClass.HAS,
    targetType: DEVICE_ENTITY_TYPE,
  },
  ACCOUNT_HAS_GROUP: {
    _type: ACCOUNT_GROUP_RELATIONSHIP_TYPE,
    sourceType: ACCOUNT_ENTITY_TYPE,
    _class: RelationshipClass.HAS,
    targetType: GROUP_ENTITY_TYPE,
  },
  GROUP_HAS_USER: {
    _type: 'azure_group_has_user',
    sourceType: GROUP_ENTITY_TYPE,
    _class: RelationshipClass.HAS,
    targetType: USER_ENTITY_TYPE,
  },
  GROUP_HAS_GROUP: {
    _type: 'azure_group_has_group',
    sourceType: GROUP_ENTITY_TYPE,
    _class: RelationshipClass.HAS,
    targetType: GROUP_ENTITY_TYPE,
  },
  GROUP_HAS_MEMBER: {
    _type: GROUP_MEMBER_RELATIONSHIP_TYPE,
    sourceType: GROUP_ENTITY_TYPE,
    _class: RelationshipClass.HAS,
    targetType: GROUP_MEMBER_ENTITY_TYPE,
  },
  USER_HAS_ROLE: {
    _type: 'azure_user_has_ad_role_definition',
    sourceType: USER_ENTITY_TYPE,
    _class: RelationshipClass.HAS,
    targetType: STEP_AD_ROLE_DEFINITIONS,
  },
  SERVICE_PRINCIPAL_HAS_ROLE: {
    _type: 'azure_service_principal_has_ad_role_definition',
    sourceType: SERVICE_PRINCIPAL_ENTITY_TYPE,
    _class: RelationshipClass.HAS,
    targetType: STEP_AD_ROLE_DEFINITIONS,
  },
  SERVICE_PRINCIPAL_ASSIGNED_USER_GROUP: {
    _type: 'azure_service_principal_assigned_user_group',
    sourceType: SERVICE_PRINCIPAL_ENTITY_TYPE,
    _class: RelationshipClass.ASSIGNED,
    targetType: GROUP_ENTITY_TYPE,
  },
  SERVICE_PRINCIPAL_ASSIGNED_USER: {
    _type: 'azure_service_principal_assigned_user',
    sourceType: SERVICE_PRINCIPAL_ENTITY_TYPE,
    _class: RelationshipClass.ASSIGNED,
    targetType: USER_ENTITY_TYPE,
  },
  SERVICE_PRINCIPAL_ASSIGNED_SERVICE_PRINCIPAL: {
    _type: 'azure_service_principal_assigned_principal',
    sourceType: SERVICE_PRINCIPAL_ENTITY_TYPE,
    _class: RelationshipClass.ASSIGNED,
    targetType: SERVICE_PRINCIPAL_ENTITY_TYPE,
  },
};

export enum EntityPrincipalType {
  ServicePrincipal = 'ServicePrincipal',
  Group = 'Group',
  User = 'User',
}
