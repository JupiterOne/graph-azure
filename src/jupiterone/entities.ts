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
  createdOn: number | undefined;
  deletedOn: number | undefined;
  renewedOn: number | undefined;
  classification: string | undefined;
  description: string | undefined;
  displayName: string | undefined;
  mail: string | undefined;
  mailEnabled: boolean | undefined;
  mailNickname: string | undefined;
  securityEnabled: boolean | undefined;
}

export const USER_ENTITY_TYPE = "azure_user";
export const USER_ENTITY_CLASS = "User";

export interface UserEntity extends EntityFromIntegration {
  id: string;
  displayName: string | undefined;
  givenName: string | undefined;
  jobTitle: string | undefined;
  mail: string | undefined;
  mobilePhone: string | undefined;
  officeLocation: string | undefined;
  preferredLanguage: string | undefined;
  surname: string | undefined;
  userPrincipalName: string | undefined;
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
  displayName: string | undefined;
  jobTitle: string | undefined;
  mail: string | undefined;
}

export interface VirtualMachineEntity extends EntityFromIntegration {
  vmSize: string | undefined;
  type: string | undefined;

  /**
   * The `vmId` property of the `VirtualMachine`. This is distinct from the `id`.
   */
  vmId: string | undefined;
  region: string | undefined;
}

export const VIRTUAL_MACHINE_ENTITY_TYPE = "azure_vm";
export const VIRTUAL_MACHINE_ENTITY_CLASS = "Host";

export interface PublicIPAddressEntity extends EntityFromIntegration {
  type: string | undefined;
  resourceGuid: string | undefined;
  region: string | undefined;
  publicIp: string | undefined;
  publicIpAddress: string | undefined;
  public: boolean;
}

export const PUBLIC_IP_ADDRESS_ENTITY_TYPE = "azure_public_ip";
export const PUBLIC_IP_ADDRESS_ENTITY_CLASS = "IpAddress";

export interface NetworkInterfaceEntity extends EntityFromIntegration {
  type: string | undefined;
  resourceGuid: string | undefined;
  region: string | undefined;

  /**
   * The `id` property of the `VirtualMachine`. This is NOT the `vmId`.
   */
  virtualMachineId: string | undefined;
  publicIp: string[] | undefined;
  publicIpAddress: string[] | undefined;
  privateIp: string[] | undefined;
  privateIpAddress: string[] | undefined;
  macAddress: string | undefined;
  securityGroupId: string | undefined;
  ipForwarding: boolean | undefined;
}

export const NETWORK_INTERFACE_ENTITY_TYPE = "azure_nic";
export const NETWORK_INTERFACE_ENTITY_CLASS = "NetworkInterface";
