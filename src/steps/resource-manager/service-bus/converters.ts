import {
  Entity,
  createIntegrationEntity,
  convertProperties,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';

import { ServiceBusEntities } from './constants';
import { SBNamespace, SBQueue } from '@azure/arm-servicebus/esm/models';

export function createServiceBusNamespaceEntity(
  webLinker: AzureWebLinker,
  data: SBNamespace,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        function: ['event-delivery'],
        _key: data.id as string,
        _type: ServiceBusEntities.NAMESPACE._type,
        _class: ServiceBusEntities.NAMESPACE._class,
        id: data.id,
        name: data.name,
        category: ['infrastructure'],
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}

export function createServiceBusQueueEntity(
  webLinker: AzureWebLinker,
  data: SBQueue,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: data.id as string,
        _type: ServiceBusEntities.QUEUE._type,
        _class: ServiceBusEntities.QUEUE._class,
        id: data.id,
        name: data.name,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}

export function createServiceBusTopicEntity(
  webLinker: AzureWebLinker,
  data: SBQueue,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: data.id as string,
        _type: ServiceBusEntities.TOPIC._type,
        _class: ServiceBusEntities.TOPIC._class,
        id: data.id,
        name: data.name,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}

export function createServiceBusSubscriptionEntity(
  webLinker: AzureWebLinker,
  data: SBQueue,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: data.id as string,
        _type: ServiceBusEntities.SUBSCRIPTION._type,
        _class: ServiceBusEntities.SUBSCRIPTION._class,
        id: data.id,
        name: data.name,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}
