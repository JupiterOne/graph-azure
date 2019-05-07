import { RelationshipFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";

export interface UserGroupRelationship extends RelationshipFromIntegration {
  id?: number;
}

export const USER_GROUP_RELATIONSHIP_TYPE = "azure_user_assigned_group";
export const USER_GROUP_RELATIONSHIP_CLASS = "ASSIGNED";
