import { EntityFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";

export const ACCOUNT_ENTITY_TYPE = "azure_account";
export const ACCOUNT_ENTITY_CLASS = "Account";

export interface AccountEntity extends EntityFromIntegration {
  organizationName: string | undefined;
  defaultDomain: string | undefined;
  verifiedDomains: string[] | undefined;
}

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

export const USER_ENTITY_TYPE = "azure_user";
export const USER_ENTITY_CLASS = "User";

export interface UserEntity extends EntityFromIntegration {
  id: string;
  displayName?: string;
  givenName?: string;
  jobTitle?: string;
  mail?: string;
  mobilePhone?: string;
  officeLocation?: string;
  preferredLanguage?: string;
  surname?: string;
  userPrincipalName?: string;
}

/**
 * The entity type used for members of groups which are not one of the ingested
 * directory objects.
 */
export const GROUP_MEMBER_ENTITY_TYPE = "azure_group_member";

/**
 * The entity class used for members of groups which are not one of the ingested
 * directory objects.
 */
export const GROUP_MEMBER_ENTITY_CLASS = "User";

/**
 * The entity representing a group member which is not one of the ingested
 * directory objects.
 */
export interface GroupMemberEntity extends EntityFromIntegration {
  displayName?: string;
  jobTitle?: string;
  mail?: string;
}

export interface VirtualMachineEntity extends EntityFromIntegration {
  vmSize: string | undefined;
  type: string | undefined;
  vmId: string | undefined;
  location: string;
}

export const VIRTUAL_MACHINE_ENTITY_TYPE = "azurerm_virtual_machine";
export const VIRTUAL_MACHINE_ENTITY_CLASS = "Host";
