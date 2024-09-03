import {
  Entity,
  createIntegrationEntity,
  convertProperties,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import {
  ApiManagementServiceResource,
  ApiContract,
} from '@azure/arm-apimanagement/esm/models';
import { createApiAssignEntity, createServiceAssignEntity } from './entities';

export function createApiManagementServiceEntity(
  webLinker: AzureWebLinker,
  data: ApiManagementServiceResource,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: createServiceAssignEntity({
        ...convertProperties(data),
        _key: data.id as string,
        id: data.id,
        name: data.name || data.id || '',
        public: !!data.publicIPAddresses?.length,
        function: ['api-gateway'],
        category: ['application'],
        webLink: webLinker.portalResourceUrl(data.id),
      }),
    },
  });
}

export function createApiManagementApiEntity(
  webLinker: AzureWebLinker,
  data: ApiContract,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: createApiAssignEntity({
        ...convertProperties(data),
        _key: data.id as string,
        id: data.id,
        name: data.name || data.id || '',
        address: data.path,
        webLink: webLinker.portalResourceUrl(data.id),
      }),
    },
  });
}
