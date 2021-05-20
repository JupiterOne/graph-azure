import {
  Entity,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import { entities } from './constants';
import { ManagementGroup } from '@azure/arm-managementgroups/esm/models';

export function createManagementGroupEntity(
  webLinker: AzureWebLinker,
  data: ManagementGroup,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        _type: entities.MANAGEMENT_GROUP._type,
        _class: entities.MANAGEMENT_GROUP._class,
        id: data.id,
        type: data.type,
        name: data.name,
        tenantId: data.tenantId,
        displayName: data.displayName,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}
