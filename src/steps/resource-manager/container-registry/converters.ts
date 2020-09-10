import {
  Entity,
  createIntegrationEntity,
  convertProperties,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import { ContainerRegistryEntities } from './constants';
import { Registry, Webhook } from '@azure/arm-containerregistry/esm/models';

export function createContainerRegistryEntity(
  webLinker: AzureWebLinker,
  data: Registry,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: data.id as string,
        _type: ContainerRegistryEntities.REGISTRY._type,
        _class: ContainerRegistryEntities.REGISTRY._class,
        id: data.id,
        name: data.name,
        classification: null,
        encrypted: data.encryption?.status === 'enabled',
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}

export function createContainerRegistryWebhookEntity(
  webLinker: AzureWebLinker,
  data: Webhook,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: data.id as string,
        _type: ContainerRegistryEntities.WEBHOOK._type,
        _class: ContainerRegistryEntities.WEBHOOK._class,
        id: data.id,
        name: data.name,
        address: 'NOT_RETURNED_FROM_AZURE_API',
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}
