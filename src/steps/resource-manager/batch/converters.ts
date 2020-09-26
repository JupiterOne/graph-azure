import {
  Entity,
  createIntegrationEntity,
  convertProperties,
} from '@jupiterone/integration-sdk-core';
import { AzureWebLinker } from '../../../azure';
import { BatchEntities } from './constants';
import { BatchAccount } from '@azure/arm-batch/esm/models';

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
