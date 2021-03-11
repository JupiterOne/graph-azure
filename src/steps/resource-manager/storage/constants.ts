import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { KEY_VAULT_SERVICE_ENTITY_TYPE } from '../key-vault/constants';

// Step IDs
export const steps = {
  STORAGE_ACCOUNTS: 'rm-storage-resources',
  STORAGE_CONTAINERS: 'rm-storage-containers',
  STORAGE_FILE_SHARES: 'rm-storage-file-shares',
  STORAGE_QUEUES: 'rm-storage-queues',
  STORAGE_TABLES: 'rm-storage-tables',
};

// Graph objects
/**
 * azure_storage_account --HAS--> (azure_storage_container | azure_storage_queue | azure_storage_file_share | azure_storage_table)
 * azure_storage_container --HAS--> azure_storage_blob
 * azure_storage_file_share --HAS--> azure_storage_file_share_directory
 * azure_storage_table --HAS--> azure_storage_table_entity
 */
export const entities = {
  STORAGE_ACCOUNT: {
    _type: 'azure_storage_account',
    _class: ['Service'],
    resourceName: '[RM] Storage Account',
  },
  STORAGE_CONTAINER: {
    _type: 'azure_storage_container',
    _class: ['DataStore'],
    resourceName: '[RM] Storage Container',
  },
  STORAGE_FILE_SHARE: {
    _type: 'azure_storage_file_share',
    _class: ['DataStore'],
    resourceName: '[RM] Storage File Share',
  },
  STORAGE_QUEUE: {
    _type: 'azure_storage_queue',
    _class: ['Queue'],
    resourceName: '[RM] Storage Queue',
  },
  STORAGE_TABLE: {
    _type: 'azure_storage_table',
    _class: ['DataStore', 'Database'],
    resourceName: '[RM] Storage Table',
  },
};

export const relationships = {
  STORAGE_ACCOUNT_HAS_CONTAINER: {
    _type: 'azure_storage_account_has_container',
    sourceType: entities.STORAGE_ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: entities.STORAGE_CONTAINER._type,
  },
  STORAGE_ACCOUNT_HAS_FILE_SHARE: {
    _type: 'azure_storage_account_has_file_share',
    sourceType: entities.STORAGE_ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: entities.STORAGE_FILE_SHARE._type,
  },
  STORAGE_ACCOUNT_HAS_QUEUE: {
    _type: 'azure_storage_account_has_queue',
    sourceType: entities.STORAGE_ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: entities.STORAGE_QUEUE._type,
  },
  STORAGE_ACCOUNT_HAS_TABLE: {
    _type: 'azure_storage_account_has_table',
    sourceType: entities.STORAGE_ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: entities.STORAGE_TABLE._type,
  },
  STORAGE_ACCOUNT_USES_KEY_VAULT: {
    _type: 'azure_storage_account_uses_keyvault_service',
    sourceType: entities.STORAGE_ACCOUNT._type,
    _class: RelationshipClass.USES,
    targetType: KEY_VAULT_SERVICE_ENTITY_TYPE,
  },
};
