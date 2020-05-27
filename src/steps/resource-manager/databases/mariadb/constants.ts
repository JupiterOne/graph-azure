import { generateRelationshipType } from '@jupiterone/integration-sdk';

export const RM_MARIADB_SERVER_ENTITY_TYPE = 'azure_mariadb_server';
export const RM_MARIADB_DATABASE_ENTITY_TYPE = 'azure_mariadb_database';
export const RM_MARIADB_SERVER_DATABASE_RELATIONSHIP_TYPE = generateRelationshipType(
  'HAS',
  RM_MARIADB_SERVER_ENTITY_TYPE,
  RM_MARIADB_DATABASE_ENTITY_TYPE,
);
