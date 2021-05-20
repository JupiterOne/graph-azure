import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';

export const steps = {
  MANAGEMENT_GROUPS: 'rm-management-groups',
};

export const entities = {
  MANAGEMENT_GROUP: {
    _type: 'azure_management_group',
    _class: ['Group'],
    resourceName: '[RM] Management Group',
  },
};

export const relationships = {
  ACCOUNT_CONTAINS_ROOT_MANAGEMENT_GROUP: {
    _type: 'azure_account_contains_management_group',
    sourceType: ACCOUNT_ENTITY_TYPE,
    _class: RelationshipClass.HAS,
    targetType: entities.MANAGEMENT_GROUP._type,
  },
  MANAGEMENT_GROUP_CONTAINS_MANAGEMENT_GROUP: {
    _type: 'azure_management_group_contains_group',
    sourceType: entities.MANAGEMENT_GROUP._type,
    _class: RelationshipClass.CONTAINS,
    targetType: entities.MANAGEMENT_GROUP._type,
  },
};
