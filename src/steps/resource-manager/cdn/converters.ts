import {
  Entity,
  createIntegrationEntity,
  convertProperties,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import { CdnEntities } from './constants';
import { Profile, Endpoint } from '@azure/arm-cdn/esm/models';

export function createCdnProfileEntity(
  webLinker: AzureWebLinker,
  data: Profile,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: data.id as string,
        _type: CdnEntities.PROFILE._type,
        _class: CdnEntities.PROFILE._class,
        id: data.id,
        name: data.name,
        category: ['infrastructure'],
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}

export function createCdnEndpointEntity(
  webLinker: AzureWebLinker,
  data: Endpoint,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: data.id as string,
        _type: CdnEntities.ENDPOINT._type,
        _class: CdnEntities.ENDPOINT._class,
        id: data.id,
        name: data.name,
        category: ['data'],
        function: ['content-distribution'],
        public: true,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}
