import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createResourceGroupResourceRelationshipMetadata } from '../utils/createResourceGroupResourceRelationship';

export const STEP_RM_BATCH_ACCOUNT = 'rm-batch-account';
export const STEP_RM_BATCH_POOL = 'rm-batch-pool';
export const STEP_RM_BATCH_APPLICATION = 'rm-batch-application';

export const BatchEntities = {
  BATCH_ACCOUNT: {
    _type: 'azure_batch_account',
    _class: ['Service'],
    resourceName: '[RM] Batch Account',
  },
  BATCH_POOL: {
    _type: 'azure_batch_pool',
    _class: ['Cluster'],
    resourceName: '[RM] Batch Pool',
  },
  BATCH_APPLICATION: {
    _type: 'azure_batch_application',
    _class: ['Process'],
    resourceName: '[RM] Batch Application',
  },
};

export const BatchAccountRelationships = {
  RESOURCE_GROUP_HAS_BATCH_ACCOUNT: createResourceGroupResourceRelationshipMetadata(
    BatchEntities.BATCH_ACCOUNT._type,
  ),

  BATCH_ACCOUNT_HAS_BATCH_POOL: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      BatchEntities.BATCH_ACCOUNT,
      BatchEntities.BATCH_POOL,
    ),
    sourceType: BatchEntities.BATCH_ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: BatchEntities.BATCH_POOL._type,
  },

  BATCH_ACCOUNT_HAS_BATCH_APPLICATION: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      BatchEntities.BATCH_ACCOUNT,
      BatchEntities.BATCH_APPLICATION,
    ),
    sourceType: BatchEntities.BATCH_ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: BatchEntities.BATCH_APPLICATION._type,
  },
};
