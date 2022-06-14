import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { createResourceGroupResourceRelationshipMetadata } from '../utils/createResourceGroupResourceRelationship';

export const FrontDoorStepIds = {
  FETCH_FRONTDOORS: 'rm-fetch-frontdoors',
  FETCH_RULES_ENGINES: 'rm-fetch-frontdoor-rules-engines',
};

export const FrontDoorEntities = {
  FRONTDOOR: {
    resourceName: 'FrontDoor',
    _class: ['Service'],
    _type: 'azure_frontdoor',
  },
  RULES_ENGINE: {
    resourceName: 'FrontDoor Rules Engine',
    _class: ['Ruleset'],
    _type: 'azure_frontdoor_rules_engine',
  },
};

export const FrontDoorRelationships = {
  RESOURCE_GROUP_HAS_FRONTDOOR: createResourceGroupResourceRelationshipMetadata(
    FrontDoorEntities.FRONTDOOR._type,
  ),
  FRONTDOOR_HAS_RULES_ENGINE: {
    _type: 'azure_frontdoor_has_rules_engine',
    sourceType: FrontDoorEntities.FRONTDOOR._type,
    _class: RelationshipClass.HAS,
    targetType: FrontDoorEntities.RULES_ENGINE._type,
  },
};
