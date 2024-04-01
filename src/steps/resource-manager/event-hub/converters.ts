import {
  Entity,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk-core';
import { AzureWebLinker } from '../../../azure';
import { EventHubEntities } from './constants';
import { EHNamespace, Eventhub } from '@azure/arm-eventhub';
import { flattenObject } from '../utils/flattenObj'

export function createEventHubNamespaceEntity(
  webLinker: AzureWebLinker,
  data: EHNamespace,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        _type: EventHubEntities.EVENT_HUB_NAMESPACE._type,
        _class: EventHubEntities.EVENT_HUB_NAMESPACE._class,
        webLink: webLinker.portalResourceUrl(data.id),
        id: data.id,
        name: data.name,
        type: data.type,
        resourceGroupName: getEntityFromId(data.id as string, 'resourceGroups'),
        ...flattenObject(data)
      },
    },
  });
}

export function createEventHubEntity(webLinker: AzureWebLinker, data: Eventhub): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        _type: EventHubEntities.AZURE_EVENT_HUB._type,
        _class: EventHubEntities.AZURE_EVENT_HUB._class,
        webLink: webLinker.portalResourceUrl(data.id),
        category: ['platform'],
        function: ['queuing'],
        resourceGroupName: getEntityFromId(data.id as string, 'resourceGroups'),
        namespace: getEntityFromId(data.id as string, 'namespaces'),
        subscriptionId: getEntityFromId(data.id as string, 'subscriptions'),
        ...flattenObject(data)
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
        _key: data.id as string,
        _type: EventHubEntities.AZURE_CONSUMER_GROUP._type,
        _class: EventHubEntities.AZURE_CONSUMER_GROUP._class,
        webLink: webLinker.portalResourceUrl(data.id),
        category: ['network', 'security'],
        function: ['networking', 'monitoring'],
        ...flattenObject(data)
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
        ...flattenObject(data),
        _key: data.id as string,
        _type: EventHubEntities.EVENT_HUB_CLUSTER._type,
        _class: EventHubEntities.EVENT_HUB_CLUSTER._class,
        webLink: webLinker.portalResourceUrl(data.id),
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
        ...flattenObject(data),
        _key: data.keyVaultUri as string,
        _type: EventHubEntities.EVENT_HUB_KEYS._type,
        _class: EventHubEntities.EVENT_HUB_KEYS._class,
        namespaceId: namespaceId,
      },
    },
  });
}
