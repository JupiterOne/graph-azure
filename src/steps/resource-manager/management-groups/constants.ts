import {
  RelationshipClass,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { entities } from '../subscriptions/constants';
import { ADEntities } from '../../active-directory/constants';

export const ManagementGroupSteps = {
  MANAGEMENT_GROUPS: 'rm-management-groups',
};

export const ManagementGroupEntities = {
  MANAGEMENT_GROUP: {
    _type: 'azure_management_group',
    _class: ['Group'],
    resourceName: '[RM] Management Group',
  },
};

export const ManagementGroupRelationships = {
  ACCOUNT_HAS_ROOT_MANAGEMENT_GROUP: {
    _type: 'azure_account_has_management_group',
    sourceType: ADEntities.ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: ManagementGroupEntities.MANAGEMENT_GROUP._type,
  },
  MANAGEMENT_GROUP_CONTAINS_MANAGEMENT_GROUP: {
    _type: 'azure_management_group_contains_group',
    sourceType: ManagementGroupEntities.MANAGEMENT_GROUP._type,
    _class: RelationshipClass.CONTAINS,
    targetType: ManagementGroupEntities.MANAGEMENT_GROUP._type,
  },
};

export const ManagementGroupMappedRelationships = {
  MANAGEMENT_GROUP_HAS_SUBSCRIPTION: {
    _type: 'azure_management_group_has_subscription',
    sourceType: ManagementGroupEntities.MANAGEMENT_GROUP._type,
    _class: RelationshipClass.HAS,
    targetType: entities.SUBSCRIPTION._type,
    direction: RelationshipDirection.FORWARD,
  },
};
