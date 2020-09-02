import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

// Step IDs
export const STEP_RM_STORAGE_RESOURCES = 'rm-storage-resources';

// Graph objects
export const STORAGE_ACCOUNT_ENTITY_METADATA = {
  _type: 'azure_storage_blob_service',
  _class: ['Service'],
  resourceName: '[RM] Blob Storage Service',
};

export const STORAGE_CONTAINER_ENTITY_METADATA = {
  _type: 'azure_storage_container',
  _class: ['DataStore'],
  resourceName: '[RM] Blob Storage Container',
};

export const STORAGE_ACCOUNT_CONTAINER_RELATIONSHIP_CLASS =
  RelationshipClass.HAS;
export const STORAGE_ACCOUNT_CONTAINER_RELATIONSHIP_METADATA = {
  _type: generateRelationshipType(
    STORAGE_ACCOUNT_CONTAINER_RELATIONSHIP_CLASS,
    STORAGE_ACCOUNT_ENTITY_METADATA._type,
    STORAGE_CONTAINER_ENTITY_METADATA._type,
  ),
  sourceType: STORAGE_ACCOUNT_ENTITY_METADATA._type,
  _class: STORAGE_ACCOUNT_CONTAINER_RELATIONSHIP_CLASS,
  targetType: STORAGE_CONTAINER_ENTITY_METADATA._type,
};

export const STORAGE_FILE_SHARE_ENTITY_METADATA = {
  _type: 'azure_storage_share',
  _class: ['DataStore'],
  resourceName: '[RM] File Storage Share',
};

export const STORAGE_ACCOUNT_FILE_SHARE_RELATIONSHIP_CLASS =
  RelationshipClass.HAS;
export const STORAGE_ACCOUNT_FILE_SHARE_RELATIONSHIP_METADATA = {
  _type: generateRelationshipType(
    STORAGE_ACCOUNT_FILE_SHARE_RELATIONSHIP_CLASS,
    STORAGE_ACCOUNT_ENTITY_METADATA._type,
    STORAGE_FILE_SHARE_ENTITY_METADATA._type,
  ),
  sourceType: STORAGE_ACCOUNT_ENTITY_METADATA._type,
  _class: STORAGE_ACCOUNT_FILE_SHARE_RELATIONSHIP_CLASS,
  targetType: STORAGE_FILE_SHARE_ENTITY_METADATA._type,
};
