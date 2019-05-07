import { RelationshipFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";

export interface GroupUserRelationship extends RelationshipFromIntegration {
  id?: number;
}

export const GROUP_USER_RELATIONSHIP_TYPE = "azure_group_has_user";
export const GROUP_USER_RELATIONSHIP_CLASS = "HAS";
