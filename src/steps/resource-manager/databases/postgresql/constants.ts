import { generateRelationshipType } from "@jupiterone/integration-sdk";

export const RM_POSTGRESQL_SERVER_ENTITY_TYPE = "azure_postgresql_server";
export const RM_POSTGRESQL_DATABASE_ENTITY_TYPE = "azure_postgresql_database";
export const RM_POSTGRESQL_SERVER_DATABASE_RELATIONSHIP_TYPE = generateRelationshipType(
  "HAS",
  RM_POSTGRESQL_SERVER_ENTITY_TYPE,
  RM_POSTGRESQL_DATABASE_ENTITY_TYPE,
);
