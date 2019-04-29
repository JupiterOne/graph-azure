import { RelationshipFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";

export interface GroupGroupRelationship extends RelationshipFromIntegration {
  id?: number;
}

export const GROUP_GROUP_RELATIONSHIP_TYPE = "azure_group_has_group";
export const GROUP_GROUP_RELATIONSHIP_CLASS = "HAS";
