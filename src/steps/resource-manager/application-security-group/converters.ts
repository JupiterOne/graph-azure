import {
  Entity,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk-core';
import { ApplicationSecurityGroupEntities } from './constants';
import { ApplicationSecurityGroup } from '@azure/arm-network/esm/models';

export function createApplicationSecurityGroupEntity(
  data: ApplicationSecurityGroup,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        _type:
          ApplicationSecurityGroupEntities.AZURE_APPLICATION_SECURITY_GROUP
            ._type,
        _class:
          ApplicationSecurityGroupEntities.AZURE_APPLICATION_SECURITY_GROUP
            ._class,
        category: ['application'],
        id: data.id,
        name: data.name,
        etag: data.etag,
        provisioningState: data.provisioningState,
        resourceGuid: data.resourceGuid,
        type: data.type,
      },
    },
  });
}
