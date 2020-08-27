import { ResourceGroup } from '@azure/arm-resources/esm/models';
import {
  Entity,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import { RESOURCE_GROUP_ENTITY } from './constants';

export function createResourceGroupEntity(
  webLinker: AzureWebLinker,
  data: ResourceGroup,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        _type: RESOURCE_GROUP_ENTITY._type,
        _class: RESOURCE_GROUP_ENTITY._class,
        id: data.id,
        name: data.name,
        displayName: data.name,
        type: data.type,
        location: data.location,
        managedBy: data.managedBy,
        provisioningState: data.properties?.provisioningState,
        webLink: webLinker.portalResourceUrl(data.id),
      },
      tagProperties: [], // data.tags is {[k: string]: string}, needs to be string[].
    },
  });
}
