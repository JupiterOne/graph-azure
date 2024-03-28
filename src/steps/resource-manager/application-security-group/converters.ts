import {
  Entity,
  createIntegrationEntity,
  convertProperties,
} from '@jupiterone/integration-sdk-core';
import { ApplicationSecurityGroupEntities } from './constants';

export function createApplicationSecurityGroupEntity(data): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: data.id as string,
        _type:
          ApplicationSecurityGroupEntities.AZURE_APPLICATION_SECURITY_GROUP
            ._type,
        _class:
          ApplicationSecurityGroupEntities.AZURE_APPLICATION_SECURITY_GROUP
            ._class,
        id: data.id,
        name: data.name,
        category: ['application'],
        etag: data.etag,
      },
    },
  });
}
