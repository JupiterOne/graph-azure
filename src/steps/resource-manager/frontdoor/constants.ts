import { createResourceGroupResourceRelationshipMetadata } from '../utils/createResourceGroupResourceRelationship';

export const FrontDoorStepIds = {
  FETCH_FRONTDOORS: 'rm-fetch-frontdoors',
};

export const FrontDoorEntities = {
  FRONTDOOR: {
    resourceName: 'FrontDoor',
    _class: ['Service'],
    _type: 'azure_frontdoor',
  },
};

export const FrontDoorRelationships = {
  RESOURCE_GROUP_HAS_FRONTDOOR: createResourceGroupResourceRelationshipMetadata(
    FrontDoorEntities.FRONTDOOR._type,
  ),
};
