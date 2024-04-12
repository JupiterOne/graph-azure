import { RelationshipClass } from '@jupiterone/data-model';
import { createResourceGroupResourceRelationshipMetadata } from '../utils/createResourceGroupResourceRelationship';

export const AppServiceSteps = {
  APPS: 'rm-appservice-apps',
  APP_SERVICE_PLANS: 'rm-appservice-app-service-plans',
  APP_TO_SERVICE_RELATIONSHIPS: 'rm-appservice-app-plan-relationships',
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
  APP_SERVICE_PLAN: {
    _type: 'azure_app_service_plan',
    _class: ['Configuration'],
    resourceName: '[RM] App Service Plan',
  },
};

export const AppServiceRelationships = {
  RESOURCE_GROUP_HAS_WEB_APP: createResourceGroupResourceRelationshipMetadata(
    AppServiceEntities.WEB_APP._type,
  ),
  RESOURCE_GROUP_HAS_FUNCTION_APP:
    createResourceGroupResourceRelationshipMetadata(
      AppServiceEntities.FUNCTION_APP._type,
    ),
  RESOURCE_GROUP_HAS_APP_SERVICE_PLAN:
    createResourceGroupResourceRelationshipMetadata(
      AppServiceEntities.APP_SERVICE_PLAN._type,
    ),
  WEB_APP_USES_PLAN: {
    _type: 'azure_web_app_uses_app_service_plan',
    sourceType: AppServiceEntities.WEB_APP._type,
    _class: RelationshipClass.USES,
    targetType: AppServiceEntities.APP_SERVICE_PLAN._type,
  },
  FUNCTION_APP_USES_PLAN: {
    _type: 'azure_function_app_uses_app_service_plan',
    sourceType: AppServiceEntities.FUNCTION_APP._type,
    _class: RelationshipClass.USES,
    targetType: AppServiceEntities.APP_SERVICE_PLAN._type,
  },
};
