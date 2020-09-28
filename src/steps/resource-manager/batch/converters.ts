import {
  Entity,
  createIntegrationEntity,
  convertProperties,
} from '@jupiterone/integration-sdk-core';
import { AzureWebLinker } from '../../../azure';
import { BatchEntities } from './constants';
import {
  BatchAccount,
  Pool,
  Application,
  Certificate,
} from '@azure/arm-batch/esm/models';

export function createBatchAccountEntity(
  webLinker: AzureWebLinker,
  data: BatchAccount,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: data.id as string,
        _type: BatchEntities.BATCH_ACCOUNT._type,
        _class: BatchEntities.BATCH_ACCOUNT._class,
        id: data.id,
        name: data.name,
        category: ['infrastructure'],
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}

export function createBatchPoolEntity(
  webLinker: AzureWebLinker,
  data: Pool,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: data.id as string,
        _type: BatchEntities.BATCH_POOL._type,
        _class: BatchEntities.BATCH_POOL._class,
        id: data.id,
        name: data.name,
        webLink: webLinker.portalResourceUrl(data.id),
        type: data.type,
      },
    },
  });
}

export function createBatchApplicationEntity(
  webLinker: AzureWebLinker,
  data: Application,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: data.id as string,
        _type: BatchEntities.BATCH_APPLICATION._type,
        _class: BatchEntities.BATCH_APPLICATION._class,
        id: data.id,
        name: data.displayName,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}

export function createBatchCertificateEntity(
  webLinker: AzureWebLinker,
  data: Certificate,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: data.id as string,
        _type: BatchEntities.BATCH_CERTIFICATE._type,
        _class: BatchEntities.BATCH_CERTIFICATE._class,
        id: data.id,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}
