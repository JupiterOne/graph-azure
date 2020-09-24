import {
  Entity,
  createIntegrationEntity,
  convertProperties,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';

import { EventGridEntities } from './constants';
import {
  Domain,
  DomainTopic,
  Topic,
  EventSubscription,
} from '@azure/arm-eventgrid/esm/models';

export function createEventGridDomainEntity(
  webLinker: AzureWebLinker,
  data: Domain,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: data.id as string,
        _type: EventGridEntities.DOMAIN._type,
        _class: EventGridEntities.DOMAIN._class,
        id: data.id,
        name: data.name,
        category: ['infrastructure'],
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}

export function createEventGridDomainTopicEntity(
  webLinker: AzureWebLinker,
  data: DomainTopic,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: data.id as string,
        _type: EventGridEntities.DOMAIN_TOPIC._type,
        _class: EventGridEntities.DOMAIN_TOPIC._class,
        id: data.id,
        name: data.name,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}

export function createEventGridEventSubscriptionEntity(
  webLinker: AzureWebLinker,
  data: EventSubscription,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: data.id as string,
        _type: EventGridEntities.EVENT_SUBSCRIPTION._type,
        _class: EventGridEntities.EVENT_SUBSCRIPTION._class,
        id: data.id,
        name: data.name,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}

export function createEventGridTopicEntity(
  webLinker: AzureWebLinker,
  data: Topic,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: data.id as string,
        _type: EventGridEntities.TOPIC._type,
        _class: EventGridEntities.TOPIC._class,
        id: data.id,
        name: data.name,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}
