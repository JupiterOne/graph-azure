import {
  Entity,
  createIntegrationEntity,
  convertProperties,
} from '@jupiterone/integration-sdk-core';
import { AzureWebLinker } from '../../../azure';
import { EventHubEntities } from './constants';
import { Eventhub } from '@azure/arm-eventhub';

export function createEventHubNamespaceEntity(
  webLinker: AzureWebLinker,
  data,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: data.id as string,
        _type: EventHubEntities.EVENT_HUB_NAMESPACE._type,
        _class: EventHubEntities.EVENT_HUB_NAMESPACE._class,
        webLink: webLinker.portalResourceUrl(data.id),
        id: data.id,
        name: data.name,
        type: data.type,
        resourceGroupName: getEntityFromId(data.id, 'resourceGroups'),
      },
    },
  });
}

export function createEventHubEntity(webLinker: AzureWebLinker, data: Eventhub): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: data.id,
        _type: EventHubEntities.AZURE_EVENT_HUB._type,
        _class: EventHubEntities.AZURE_EVENT_HUB._class,
        webLink: webLinker.portalResourceUrl(data.id),
        id: data.id,
        name: data.name,
        type: data.type,
        category: ['platform'],
        function: ['queuing'],
        resourceGroupName: getEntityFromId(data.id as string, 'resourceGroups'),
        namespace: getEntityFromId(data.id as string, 'namespaces'),
        subscriptionId: getEntityFromId(data.id as string, 'subscriptions'),
      },
    },
  });
}

function getEntityFromId(id: string, entityName): string {
  const parts = id.split('/');
  const index = parts.indexOf(entityName);
  if (index !== -1 && index + 1 < parts.length) {
    return parts[index + 1];
  } else {
    throw new Error('Invalid id format');
  }
}

export function createAzureConsumerGroupEntity(
  webLinker: AzureWebLinker,
  data,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: data.id as string,
        _type: EventHubEntities.AZURE_CONSUMER_GROUP._type,
        _class: EventHubEntities.AZURE_CONSUMER_GROUP._class,
        id: data.id,
        name: data.name,
        webLink: webLinker.portalResourceUrl(data.id),
        category: ['network', 'security'],
        function: ['networking', 'monitoring'],
        type: data.type,
      },
    },
  });
}

export function createAzureEventHubClusterEntity(
  webLinker: AzureWebLinker,
  data,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: data.id as string,
        _type: EventHubEntities.EVENT_HUB_CLUSTER._type,
        _class: EventHubEntities.EVENT_HUB_CLUSTER._class,
        webLink: webLinker.portalResourceUrl(data.id),
        id: data.id,
        name: data.name,
        type: data.type,
        subscriptionId: getEntityFromId(data.id, 'subscriptions'),
      },
    },
  });
}

export function createAzureEventHubKeysEntity(data, namespaceId): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: data.keyVaultUri as string,
        _type: EventHubEntities.EVENT_HUB_KEYS._type,
        _class: EventHubEntities.EVENT_HUB_KEYS._class,
        name: data.keyName,
        keyVaultUri: data.keyVaultUri,
        namespaceId: namespaceId,
      },
    },
  });
}
