import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

// Graph objects
export const RM_SQL_SERVER_ENTITY_TYPE = 'azure_sql_server';
export const RM_SQL_DATABASE_ENTITY_TYPE = 'azure_sql_database';

export const RM_SQL_SERVER_DATABASE_RELATIONSHIP_CLASS = RelationshipClass.HAS;
export const RM_SQL_SERVER_DATABASE_RELATIONSHIP_TYPE = generateRelationshipType(
  RM_SQL_SERVER_DATABASE_RELATIONSHIP_CLASS,
  RM_SQL_SERVER_ENTITY_TYPE,
  RM_SQL_DATABASE_ENTITY_TYPE,
);

export const SQL_SERVER_DATABASE_RELATIONSHIP_TYPE =
  'azure_sql_server_has_database';
