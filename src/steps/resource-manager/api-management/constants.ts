import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createResourceGroupResourceRelationshipMetadata } from '../utils/createResourceGroupResourceRelationship';

// Fetch Resource Groups
export const STEP_RM_API_MANAGEMENT_SERVICES = 'rm-api-management-services';
export const STEP_RM_API_MANAGEMENT_APIS = 'rm-api-management-apis';
export const STEP_RM_API_MANAGEMENT_SERVICES_DIAGNOSTIC_SETTINGS =
  'm-api-management-services-diagnostic-settings';
export const ApiManagementEntities = {
  SERVICE: {
    _type: 'azure_api_management_service',
    _class: ['Gateway'],
    resourceName: '[RM] API Management Service',
  },
  API: {
    _type: 'azure_api_management_api',
    _class: ['ApplicationEndpoint'],
    resourceName: '[RM] API Management API',
  },
};

export const ApiManagementRelationships = {
  RESOURCE_GROUP_HAS_SERVICE: createResourceGroupResourceRelationshipMetadata(
    ApiManagementEntities.SERVICE._type,
  ),
  SERVICE_HAS_API: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      ApiManagementEntities.SERVICE,
      ApiManagementEntities.API,
    ),
    sourceType: ApiManagementEntities.SERVICE._type,
    _class: RelationshipClass.HAS,
    targetType: ApiManagementEntities.API._type,
  },
};
