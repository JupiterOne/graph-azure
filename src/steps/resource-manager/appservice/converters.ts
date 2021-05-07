import {
  Entity,
  createIntegrationEntity,
  StepEntityMetadata,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import { Site } from '@azure/arm-appservice/esm/models';

export function createAppEntity(
  webLinker: AzureWebLinker,
  data: Site,
  metadata: StepEntityMetadata,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        _type: metadata._type,
        _class: metadata._class,
        id: data.id,
        name: data.name,
        type: data.type,
        kind: data.kind?.split(','),
        location: data.location,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}
