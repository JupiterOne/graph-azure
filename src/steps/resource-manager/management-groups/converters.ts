import {
  Entity,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import { ManagementGroupEntities } from './constants';
import { ManagementGroup } from '@azure/arm-managementgroups';

export function createManagementGroupEntity(
  webLinker: AzureWebLinker,
  data: ManagementGroup,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        _type: ManagementGroupEntities.MANAGEMENT_GROUP._type,
        _class: ManagementGroupEntities.MANAGEMENT_GROUP._class,
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
