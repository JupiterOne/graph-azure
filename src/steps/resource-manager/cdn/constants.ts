import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createResourceGroupResourceRelationshipMetadata } from '../utils/createResourceGroupResourceRelationship';

export const STEP_RM_CDN_PROFILE = 'rm-cdn-profiles';
export const STEP_RM_CDN_PROFILE_DIAGNOSTIC_SETTINGS =
  'rm-cdn-profiles-diagnostic-settings';
export const STEP_RM_CDN_ENDPOINTS = 'rm-cdn-endpoints';
export const STEP_RM_CDN_ENDPOINTS_DIAGNOSTIC_SETTINGS =
  'rm-cdn-endpoints-diagnostic-settings';

export const CdnEntities = {
  PROFILE: {
    _type: 'azure_cdn_profile',
    _class: ['Service'],
    resourceName: '[RM] CDN Profile',
  },
  ENDPOINT: {
    _type: 'azure_cdn_endpoint',
    _class: ['Gateway'],
    resourceName: '[RM] CDN Endpoint',
  },
};

export const CdnRelationships = {
  RESOURCE_GROUP_HAS_PROFILE: createResourceGroupResourceRelationshipMetadata(
    CdnEntities.PROFILE._type,
  ),
  PROFILE_HAS_ENDPOINT: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      CdnEntities.PROFILE,
      CdnEntities.ENDPOINT,
    ),
    sourceType: CdnEntities.PROFILE._type,
    _class: RelationshipClass.HAS,
    targetType: CdnEntities.ENDPOINT._type,
  },
};
