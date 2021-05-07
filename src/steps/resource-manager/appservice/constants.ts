import { createResourceGroupResourceRelationshipMetadata } from '../utils/createResourceGroupResourceRelationship';

export const AppServiceSteps = {
  APPS: 'rm-appservice-apps',
};

export const AppServiceEntities = {
  WEB_APP: {
    _type: 'azure_web_app',
    _class: ['Application'],
    resourceName: '[RM] Web App',
  },
  FUNCTION_APP: {
    _type: 'azure_function_app',
    _class: ['Function'],
    resourceName: '[RM] Function App',
  },
};

export const AppServiceRelationships = {
  RESOURCE_GROUP_HAS_WEB_APP: createResourceGroupResourceRelationshipMetadata(
    AppServiceEntities.WEB_APP._type,
  ),
  RESOURCE_GROUP_HAS_FUNCTION_APP: createResourceGroupResourceRelationshipMetadata(
    AppServiceEntities.FUNCTION_APP._type,
  ),
};
