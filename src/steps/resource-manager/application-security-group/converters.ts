import {
  Entity,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk-core';
import { ApplicationSecurityGroupEntities } from './constants';
import { flattenObject } from '../utils/flattenObj'

export function createApplicationSecurityGroupEntity(data): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...flattenObject(data),
        _key: data.id as string,
        _type:
          ApplicationSecurityGroupEntities.AZURE_APPLICATION_SECURITY_GROUP
            ._type,
        _class:
          ApplicationSecurityGroupEntities.AZURE_APPLICATION_SECURITY_GROUP
            ._class,
        category: ['application'],
      },
    },
  });
}
