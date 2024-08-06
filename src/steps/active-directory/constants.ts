import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import {
  AccountEntityMetadata,
  DeviceEntityMetadata,
  GroupMemberEntityMetadata,
  RoleDefinitionEntityMetadata,
  ServicePrincipalEntityMetadata,
  UserEntityMetadata,
  UserGroupEntityMetadata,
} from '../../entities';

// Step IDs
export const STEP_AD_ACCOUNT = 'ad-account';
export const STEP_AD_DOMAIN = 'ad-domain';
export const STEP_AD_ACCOUNT_HAS_DOMAIN = 'ad-account-domain';
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

export const DOMAIN_ENTITY_TYPE = 'azure_domain';
export const DOMAIN_ENTITY_CLASS = ['Service'];

export const ACCOUNT_GROUP_RELATIONSHIP_TYPE = 'azure_account_has_group';
export const ACCOUNT_USER_RELATIONSHIP_TYPE = 'azure_account_has_user';
export const ACCOUNT_DOMAIN_RELATIONSHIP_TYPE = 'azure_account_has_domain';
export const USER_HAS_DEVICE_RELATIONSHIP_TYPE = 'azure_user_has_device';
export const GROUP_MEMBER_RELATIONSHIP_TYPE = 'azure_group_has_member';

export const ADEntities = {
  ACCOUNT: AccountEntityMetadata,
  USER: UserEntityMetadata,
  DEVICE: DeviceEntityMetadata,
  USER_GROUP: UserGroupEntityMetadata,
  GROUP_MEMBER: GroupMemberEntityMetadata,
  SERVICE_PRINCIPAL: ServicePrincipalEntityMetadata,
  AD_ROLE_DEFINITION: RoleDefinitionEntityMetadata,
  AD_DOMAIN: {
    resourceName: '[AD] Domain',
    _type: DOMAIN_ENTITY_TYPE,
    _class: DOMAIN_ENTITY_CLASS,
  },
};

export const ADRelationships = {
  ACCOUNT_HAS_USER: {
    _type: ACCOUNT_USER_RELATIONSHIP_TYPE,
    sourceType: ADEntities.ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: ADEntities.USER._type,
  },
  ACCOUNT_HAS_DOMAIN: {
    _type: ACCOUNT_DOMAIN_RELATIONSHIP_TYPE,
    sourceType: ADEntities.ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: DOMAIN_ENTITY_TYPE,
  },
  USER_HAS_DEVICE: {
    _type: USER_HAS_DEVICE_RELATIONSHIP_TYPE,
    sourceType: ADEntities.USER._type,
    _class: RelationshipClass.HAS,
    targetType: ADEntities.DEVICE._type,
  },
  ACCOUNT_HAS_GROUP: {
    _type: ACCOUNT_GROUP_RELATIONSHIP_TYPE,
    sourceType: ADEntities.ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: ADEntities.USER_GROUP._type,
  },
  GROUP_HAS_USER: {
    _type: 'azure_group_has_user',
    sourceType: ADEntities.USER_GROUP._type,
    _class: RelationshipClass.HAS,
    targetType: ADEntities.USER._type,
  },
  GROUP_HAS_GROUP: {
    _type: 'azure_group_has_group',
    sourceType: ADEntities.USER_GROUP._type,
    _class: RelationshipClass.HAS,
    targetType: ADEntities.USER_GROUP._type,
  },
  GROUP_HAS_MEMBER: {
    _type: GROUP_MEMBER_RELATIONSHIP_TYPE,
    sourceType: ADEntities.USER_GROUP._type,
    _class: RelationshipClass.HAS,
    targetType: ADEntities.GROUP_MEMBER._type,
  },
  USER_HAS_ROLE: {
    _type: 'azure_user_has_ad_role_definition',
    sourceType: ADEntities.USER._type,
    _class: RelationshipClass.HAS,
    targetType: STEP_AD_ROLE_DEFINITIONS,
  },
  SERVICE_PRINCIPAL_HAS_ROLE: {
    _type: 'azure_service_principal_has_ad_role_definition',
    sourceType: ADEntities.SERVICE_PRINCIPAL._type,
    _class: RelationshipClass.HAS,
    targetType: STEP_AD_ROLE_DEFINITIONS,
  },
  SERVICE_PRINCIPAL_ASSIGNED_USER_GROUP: {
    _type: 'azure_service_principal_assigned_user_group',
    sourceType: ADEntities.SERVICE_PRINCIPAL._type,
    _class: RelationshipClass.ASSIGNED,
    targetType: ADEntities.USER_GROUP._type,
  },
  SERVICE_PRINCIPAL_ASSIGNED_USER: {
    _type: 'azure_service_principal_assigned_user',
    sourceType: ADEntities.SERVICE_PRINCIPAL._type,
    _class: RelationshipClass.ASSIGNED,
    targetType: ADEntities.USER._type,
  },
  SERVICE_PRINCIPAL_ASSIGNED_SERVICE_PRINCIPAL: {
    _type: 'azure_service_principal_assigned_principal',
    sourceType: ADEntities.SERVICE_PRINCIPAL._type,
    _class: RelationshipClass.ASSIGNED,
    targetType: ADEntities.SERVICE_PRINCIPAL._type,
  },
};

export enum EntityPrincipalType {
  ServicePrincipal = 'ServicePrincipal',
  Group = 'Group',
  User = 'User',
}
