import {
  Entity,
  createIntegrationEntity,
  StepEntityMetadata,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import { AppServicePlan, Site } from '@azure/arm-appservice/esm/models';
import { AppServiceEntities } from './constants';

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

export function createAppServicePlanEntity(
  webLinker: AzureWebLinker,
  data: AppServicePlan,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        _type: AppServiceEntities.APP_SERVICE_PLAN._type,
        _class: AppServiceEntities.APP_SERVICE_PLAN._class,
        id: data.id,
        name: data.name,
        type: data.type,
        kind: data.kind?.split(','),
        location: data.location,
        'sku.name': data.sku?.name,
        'sku.tier': data.sku?.tier,
        'sku.size': data.sku?.size,
        'sku.family': data.sku?.family,
        'sku.capacity': data.sku?.capacity,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}
