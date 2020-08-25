import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

// Step IDs
export const STEP_RM_COSMOSDB_SQL_DATABASES = 'rm-cosmosdb-sql-databases';

// Graph objects
export const RM_COSMOSDB_ACCOUNT_ENTITY_TYPE = 'azure_cosmosdb_account';
export const RM_COSMOSDB_ACCOUNT_ENTITY_CLASS = ['Account', 'Service'];

export const RM_COSMOSDB_SQL_DATABASE_ENTITY_TYPE =
  'azure_cosmosdb_sql_database';
export const RM_COSMOSDB_SQL_DATABASE_ENTITY_CLASS = ['Database', 'DataStore'];

export const RM_COSMOSDB_ACCOUNT_SQL_DATABASE_RELATIONSHIP_CLASS =
  RelationshipClass.HAS;
export const RM_COSMOSDB_ACCOUNT_SQL_DATABASE_RELATIONSHIP_TYPE = generateRelationshipType(
  RM_COSMOSDB_ACCOUNT_SQL_DATABASE_RELATIONSHIP_CLASS,
  RM_COSMOSDB_ACCOUNT_ENTITY_TYPE,
  RM_COSMOSDB_SQL_DATABASE_ENTITY_TYPE,
);
