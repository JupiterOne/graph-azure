import {
  Entity,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import { entities } from './constants';
import { Subscription, Location } from '@azure/arm-subscriptions/esm/models';

export function createSubscriptionEntity(
  webLinker: AzureWebLinker,
  data: Subscription,
): Entity {
  const tags = {};
  if ((data as any).tags != undefined) {
    const rawTags = (data as any).tags;
    Object.keys(rawTags).forEach((e) => {
      tags[`tag.${e}`] = rawTags[e].toString();
    });
  }
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        _type: entities.SUBSCRIPTION._type,
        _class: entities.SUBSCRIPTION._class,
        id: data.id,
        subscriptionId: data.subscriptionId,
        state: data.state,
        authorizationSource: data.authorizationSource,
        name: data.displayName,
        displayName: data.displayName,
        ...tags,
        webLink: webLinker.portalResourceUrl(data.id),
        offerName: data.subscriptionPolicies?.quotaId,
      },
    },
  });
}

export function getLocationName(locationId: string) {
  const parts = locationId.split('/');
  return parts[parts.length - 1];
}

export function getLocationEntityProps(data: Location) {
  return {
    _key: `azure_location_${getLocationName(data.id!)}`,
    _type: entities.LOCATION._type,
    _class: entities.LOCATION._class,
    // The only reason for keeping the id property is
    // warn/map part of `fetchLocations` step
    id: data.id,
    name: data.name,
    displayName: data.displayName,
  };
}
export function createSubscriptionUsageEntity(
  webLinker: AzureWebLinker,
  data: any,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        _type: entities.USAGE._type,
        _class: entities.USAGE._class,
        id: data.id,
        offerId: data.offerId,
        webLink: webLinker.portalResourceUrl(data.id),
        productName: data.productOrderName ?? data.product,
        kind: data.kind,
      },
    },
  });
}
