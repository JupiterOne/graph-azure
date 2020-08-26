import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

export const RM_POSTGRESQL_SERVER_ENTITY_TYPE = 'azure_postgresql_server';
export const RM_POSTGRESQL_DATABASE_ENTITY_TYPE = 'azure_postgresql_database';

export const RM_POSTGRESQL_SERVER_DATABASE_RELATIONSHIP_CLASS =
  RelationshipClass.HAS;
export const RM_POSTGRESQL_SERVER_DATABASE_RELATIONSHIP_TYPE = generateRelationshipType(
  RM_POSTGRESQL_SERVER_DATABASE_RELATIONSHIP_CLASS,
  RM_POSTGRESQL_SERVER_ENTITY_TYPE,
  RM_POSTGRESQL_DATABASE_ENTITY_TYPE,
);
