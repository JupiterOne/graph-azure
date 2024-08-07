import {
  Entity,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk-core';
import { ApplicationSecurityGroup } from '@azure/arm-network/esm/models';
import { createApplicationSecurityGroupAssignEntity } from './entities';

export function createApplicationSecurityGroupEntity(
  data: ApplicationSecurityGroup,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: createApplicationSecurityGroupAssignEntity({
        _key: data.id as string,
        category: ['application'],
        id: data.id,
        name: data.name || data.id || '',
        etag: data.etag,
        provisioningState: data.provisioningState,
        resourceGuid: data.resourceGuid,
        type: data.type,
      }),
    },
  });
}
