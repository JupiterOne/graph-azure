import { generateRelationshipType } from '@jupiterone/integration-sdk';

export const RM_MYSQL_SERVER_ENTITY_TYPE = 'azure_mysql_server';
export const RM_MYSQL_DATABASE_ENTITY_TYPE = 'azure_mysql_database';
export const RM_MYSQL_SERVER_DATABASE_RELATIONSHIP_TYPE = generateRelationshipType(
  'HAS',
  RM_MYSQL_SERVER_ENTITY_TYPE,
  RM_MYSQL_DATABASE_ENTITY_TYPE,
);
