import {
  Entity,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import { entities, SUBSCRIPTION_ENTITY_METADATA } from './constants';
import { Subscription, Location } from '@azure/arm-subscriptions/esm/models';

export function createSubscriptionEntity(
  webLinker: AzureWebLinker,
  data: Subscription,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        _type: SUBSCRIPTION_ENTITY_METADATA._type,
        _class: SUBSCRIPTION_ENTITY_METADATA._class,
        id: data.id,
        subscriptionId: data.subscriptionId,
        state: data.state,
        authorizationSource: data.authorizationSource,
        name: data.displayName,
        displayName: data.displayName,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}

export function createLocationEntity(
  webLinker: AzureWebLinker,
  data: Location,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id,
        _type: entities.LOCATION._type,
        _class: entities.LOCATION._class,
        id: data.id,
        name: data.name,
        displayName: data.displayName,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}
