import {
  MappedRelationshipFromIntegration,
  RelationshipFromIntegration,
} from "@jupiterone/jupiter-managed-integration-sdk";

export const ACCOUNT_GROUP_RELATIONSHIP_TYPE = "azure_account_has_group";
export const ACCOUNT_GROUP_RELATIONSHIP_CLASS = "HAS";

export interface AccountGroupRelationship extends RelationshipFromIntegration {
  id?: number;
}

export const ACCOUNT_USER_RELATIONSHIP_TYPE = "azure_account_has_user";
export const ACCOUNT_USER_RELATIONSHIP_CLASS = "HAS";

export interface AccountUserRelationship extends RelationshipFromIntegration {
  id?: number;
}

export const GROUP_MEMBER_RELATIONSHIP_TYPE = "azure_group_has_member";
export const GROUP_MEMBER_RELATIONSHIP_CLASS = "HAS";

export interface GroupMemberRelationship
  extends MappedRelationshipFromIntegration {
  groupId: string;
  memberId: string;
  memberType: string;
}
