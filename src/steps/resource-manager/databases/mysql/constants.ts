import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

export const RM_MYSQL_SERVER_ENTITY_TYPE = 'azure_mysql_server';
export const RM_MYSQL_DATABASE_ENTITY_TYPE = 'azure_mysql_database';

export const RM_MYSQL_SERVER_DATABASE_RELATIONSHIP_CLASS =
  RelationshipClass.HAS;
export const RM_MYSQL_SERVER_DATABASE_RELATIONSHIP_TYPE = generateRelationshipType(
  RM_MYSQL_SERVER_DATABASE_RELATIONSHIP_CLASS,
  RM_MYSQL_SERVER_ENTITY_TYPE,
  RM_MYSQL_DATABASE_ENTITY_TYPE,
);
