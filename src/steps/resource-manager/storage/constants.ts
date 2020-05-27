import { generateRelationshipType } from "@jupiterone/integration-sdk";

import { ACCOUNT_ENTITY_TYPE } from "../../active-directory";

// Step IDs
export const STEP_RM_STORAGE_RESOURCES = "rm-storage-resources";

// Graph objects
export const STORAGE_BLOB_SERVICE_ENTITY_TYPE = "azure_storage_blob_service";
export const STORAGE_BLOB_SERVICE_ENTITY_CLASS = "Service";
export const ACCOUNT_STORAGE_BLOB_SERVICE_RELATIONSHIP_TYPE = generateRelationshipType(
  "HAS",
  ACCOUNT_ENTITY_TYPE,
  STORAGE_BLOB_SERVICE_ENTITY_TYPE,
);

export const STORAGE_CONTAINER_ENTITY_TYPE = "azure_storage_container";
export const STORAGE_CONTAINER_ENTITY_CLASS = "DataStore";
export const STORAGE_BLOB_SERVICE_CONTAINER_RELATIONSHIP = generateRelationshipType(
  "HAS",
  STORAGE_BLOB_SERVICE_ENTITY_TYPE,
  STORAGE_CONTAINER_ENTITY_TYPE,
);

export const STORAGE_FILE_SERVICE_ENTITY_TYPE = "azure_storage_file_service";
export const STORAGE_FILE_SERVICE_ENTITY_CLASS = "Service";
export const ACCOUNT_STORAGE_FILE_SERVICE_RELATIONSHIP_TYPE = generateRelationshipType(
  "HAS",
  ACCOUNT_ENTITY_TYPE,
  STORAGE_FILE_SERVICE_ENTITY_TYPE,
);

export const STORAGE_FILE_SHARE_ENTITY_TYPE = "azure_storage_share";
export const STORAGE_FILE_SHARE_ENTITY_CLASS = "DataStore";
export const STORAGE_FILE_SERVICE_SHARE_RELATIONSHIP = generateRelationshipType(
  "HAS",
  STORAGE_FILE_SERVICE_ENTITY_TYPE,
  STORAGE_FILE_SHARE_ENTITY_TYPE,
);

export const STORAGE_QUEUE_SERVICE_ENTITY_TYPE = "azure_storage_queue_service";
export const STORAGE_QUEUE_SERVICE_ENTITY_CLASS = "Service";
export const ACCOUNT_STORAGE_QUEUE_SERVICE_RELATIONSHIP_TYPE = generateRelationshipType(
  "HAS",
  ACCOUNT_ENTITY_TYPE,
  STORAGE_QUEUE_SERVICE_ENTITY_TYPE,
);

export const STORAGE_TABLE_SERVICE_ENTITY_TYPE = "azure_storage_table_service";
export const STORAGE_TABLE_SERVICE_ENTITY_CLASS = "Service";
export const ACCOUNT_STORAGE_TABLE_SERVICE_RELATIONSHIP_TYPE = generateRelationshipType(
  "HAS",
  ACCOUNT_ENTITY_TYPE,
  STORAGE_TABLE_SERVICE_ENTITY_TYPE,
);
