import {
  RelationshipClass,
  generateRelationshipType,
} from '@jupiterone/integration-sdk-core';
import { NetworkEntities } from '../network/constants';
import { entities } from '../subscriptions/constants';
import { RESOURCE_GROUP_ENTITY } from '../resources/constants';

export const DdosSteps = {
  PROTECTION_PLAN: 'fetch-ddos-protection_plan',
  DDOS_PROTECTION_PLAN_PUBLIC_IP_RELATIONSHIP:
    'build-ddos-protection-plan-public-ip-relationship',
  DDOS_PROTECTION_PLAN_VNET_RELATIONSHIP:
    'build-ddos-protection-plan-vnet-relationship',
  RESOURCE_GROUPS_DDOS_PROTECTION_PLAN_RELATIONSHIP:
    'build-resource-group-protection-plan-relationship',
};

export const DdosEntities = {
  PROTECTION_PLAN: {
    _type: 'azure_ddos_protection_plan',
    _class: ['Configuration'],
    resourceName: '[RM] Azure Ddos Protection Plans',
  },
};

export const DdosRelationships = {
  DDOS_PROTECTION_PLAN_ASSIGNED_PUBLIC_IP: {
    _type: generateRelationshipType(
      RelationshipClass.ASSIGNED,
      DdosEntities.PROTECTION_PLAN,
      NetworkEntities.PUBLIC_IP_ADDRESS,
    ),
    sourceType: DdosEntities.PROTECTION_PLAN._type,
    _class: RelationshipClass.ASSIGNED,
    targetType: NetworkEntities.PUBLIC_IP_ADDRESS._type,
  },
  DDOS_PROTECTION_PLAN_ASSIGNED_VNET: {
    _type: generateRelationshipType(
      RelationshipClass.ASSIGNED,
      DdosEntities.PROTECTION_PLAN,
      NetworkEntities.VIRTUAL_NETWORK,
    ),
    sourceType: DdosEntities.PROTECTION_PLAN._type,
    _class: RelationshipClass.ASSIGNED,
    targetType: NetworkEntities.VIRTUAL_NETWORK._type,
  },
  SUBSCRIPTION_HAS_PROTECTION_PLAN: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      entities.SUBSCRIPTION,
      DdosEntities.PROTECTION_PLAN,
    ),
    sourceType: entities.SUBSCRIPTION._type,
    _class: RelationshipClass.HAS,
    targetType: DdosEntities.PROTECTION_PLAN._type,
  },
  RESOURCE_GROUP_HAS_PROTECTION_PLAN: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      RESOURCE_GROUP_ENTITY,
      DdosEntities.PROTECTION_PLAN,
    ),
    sourceType: RESOURCE_GROUP_ENTITY._type,
    _class: RelationshipClass.HAS,
    targetType: DdosEntities.PROTECTION_PLAN._type,
  },
};
