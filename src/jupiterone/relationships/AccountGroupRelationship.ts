import { RelationshipFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";

export interface AccountGroupRelationship extends RelationshipFromIntegration {
  id?: number;
}

export const ACCOUNT_GROUP_RELATIONSHIP_TYPE = "azure_account_has_group";
export const ACCOUNT_GROUP_RELATIONSHIP_CLASS = "HAS";
