import {
  Entity,
  createIntegrationEntity,
  convertProperties,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import { ApiManagementEntities } from './constants';
import {
  ApiManagementServiceResource,
  ApiContract,
} from '@azure/arm-apimanagement/esm/models';

export function createApiManagementServiceEntity(
  webLinker: AzureWebLinker,
  data: ApiManagementServiceResource,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: data.id as string,
        _type: ApiManagementEntities.SERVICE._type,
        _class: ApiManagementEntities.SERVICE._class,
        id: data.id,
        name: data.name,
        public: !!data.publicIPAddresses?.length,
        function: ['api-gateway'],
        category: ['application'],
        webLink: webLinker.portalResourceUrl(data.id),
      },
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
      assign: {
        ...convertProperties(data),
        _key: data.id as string,
        _type: ApiManagementEntities.API._type,
        _class: ApiManagementEntities.API._class,
        id: data.id,
        name: data.name,
        address: data.path,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}
