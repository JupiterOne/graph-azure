import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';

// Step IDs
export const STEP_RM_STORAGE_RESOURCES = 'rm-storage-resources';

// Graph objects
export const STORAGE_BLOB_SERVICE_ENTITY_TYPE = 'azure_storage_blob_service';
export const STORAGE_BLOB_SERVICE_ENTITY_CLASS = 'Service';

export const ACCOUNT_STORAGE_BLOB_SERVICE_RELATIONSHIP_CLASS =
  RelationshipClass.HAS;
export const ACCOUNT_STORAGE_BLOB_SERVICE_RELATIONSHIP_TYPE = generateRelationshipType(
  ACCOUNT_STORAGE_BLOB_SERVICE_RELATIONSHIP_CLASS,
  ACCOUNT_ENTITY_TYPE,
  STORAGE_BLOB_SERVICE_ENTITY_TYPE,
);

export const STORAGE_CONTAINER_ENTITY_TYPE = 'azure_storage_container';
export const STORAGE_CONTAINER_ENTITY_CLASS = 'DataStore';

export const STORAGE_BLOB_SERVICE_CONTAINER_RELATIONSHIP_CLASS =
  RelationshipClass.HAS;
export const STORAGE_BLOB_SERVICE_CONTAINER_RELATIONSHIP_TYPE = generateRelationshipType(
  STORAGE_BLOB_SERVICE_CONTAINER_RELATIONSHIP_CLASS,
  STORAGE_BLOB_SERVICE_ENTITY_TYPE,
  STORAGE_CONTAINER_ENTITY_TYPE,
);

export const STORAGE_FILE_SERVICE_ENTITY_TYPE = 'azure_storage_file_service';
export const STORAGE_FILE_SERVICE_ENTITY_CLASS = 'Service';

export const ACCOUNT_STORAGE_FILE_SERVICE_RELATIONSHIP_CLASS =
  RelationshipClass.HAS;
export const ACCOUNT_STORAGE_FILE_SERVICE_RELATIONSHIP_TYPE = generateRelationshipType(
  ACCOUNT_STORAGE_FILE_SERVICE_RELATIONSHIP_CLASS,
  ACCOUNT_ENTITY_TYPE,
  STORAGE_FILE_SERVICE_ENTITY_TYPE,
);

export const STORAGE_FILE_SHARE_ENTITY_TYPE = 'azure_storage_share';
export const STORAGE_FILE_SHARE_ENTITY_CLASS = 'DataStore';

export const STORAGE_FILE_SERVICE_SHARE_RELATIONSHIP_CLASS =
  RelationshipClass.HAS;
export const STORAGE_FILE_SERVICE_SHARE_RELATIONSHIP_TYPE = generateRelationshipType(
  STORAGE_FILE_SERVICE_SHARE_RELATIONSHIP_CLASS,
  STORAGE_FILE_SERVICE_ENTITY_TYPE,
  STORAGE_FILE_SHARE_ENTITY_TYPE,
);

export const STORAGE_QUEUE_SERVICE_ENTITY_TYPE = 'azure_storage_queue_service';
export const STORAGE_QUEUE_SERVICE_ENTITY_CLASS = 'Service';
export const ACCOUNT_STORAGE_QUEUE_SERVICE_RELATIONSHIP_TYPE = generateRelationshipType(
  RelationshipClass.HAS,
  ACCOUNT_ENTITY_TYPE,
  STORAGE_QUEUE_SERVICE_ENTITY_TYPE,
);

export const STORAGE_TABLE_SERVICE_ENTITY_TYPE = 'azure_storage_table_service';
export const STORAGE_TABLE_SERVICE_ENTITY_CLASS = 'Service';
export const ACCOUNT_STORAGE_TABLE_SERVICE_RELATIONSHIP_TYPE = generateRelationshipType(
  RelationshipClass.HAS,
  ACCOUNT_ENTITY_TYPE,
  STORAGE_TABLE_SERVICE_ENTITY_TYPE,
);
