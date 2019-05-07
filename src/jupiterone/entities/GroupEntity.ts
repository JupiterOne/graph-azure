import { EntityFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";

export const GROUP_ENTITY_TYPE = "azure_user_group";
export const GROUP_ENTITY_CLASS = "UserGroup";

export interface GroupEntity extends EntityFromIntegration {
  id: string;
  deletedDateTime?: number;
  classification?: string;
  createdDateTime?: number;
  description?: string;
  displayName?: string;
  mail?: string;
  mailEnabled?: boolean;
  mailNickname?: string;
  renewedDateTime?: number;
  securityEnabled?: boolean;
}
