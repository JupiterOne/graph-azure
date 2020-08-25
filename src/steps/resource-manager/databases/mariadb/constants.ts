import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

export const RM_MARIADB_SERVER_ENTITY_TYPE = 'azure_mariadb_server';
export const RM_MARIADB_DATABASE_ENTITY_TYPE = 'azure_mariadb_database';

export const RM_MARIADB_SERVER_DATABASE_RELATIONSHIP_CLASS =
  RelationshipClass.HAS;
export const RM_MARIADB_SERVER_DATABASE_RELATIONSHIP_TYPE = generateRelationshipType(
  RM_MARIADB_SERVER_DATABASE_RELATIONSHIP_CLASS,
  RM_MARIADB_SERVER_ENTITY_TYPE,
  RM_MARIADB_DATABASE_ENTITY_TYPE,
);
