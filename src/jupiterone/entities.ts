import { Entity } from "@jupiterone/integration-sdk";

export const ACCOUNT_ENTITY_TYPE = "azure_account";
export const ACCOUNT_ENTITY_CLASS = "Account";

export interface AccountEntity extends Entity {
  id: string;
  organizationName: string | undefined;
  defaultDomain: string | undefined;
  verifiedDomains: string[] | undefined;
}

export const GROUP_ENTITY_TYPE = "azure_user_group";
export const GROUP_ENTITY_CLASS = "UserGroup";

export interface GroupEntity extends Entity {
  id: string;
  createdOn: number | undefined;
  deletedOn: number | undefined;
  renewedOn: number | undefined;
  classification: string | undefined;
  description: string | undefined;
  displayName: string | undefined;
  email: string | undefined;
  mail: string | undefined;
  mailEnabled: boolean | undefined;
  mailNickname: string | undefined;
  securityEnabled: boolean | undefined;
}

export const USER_ENTITY_TYPE = "azure_user";
export const USER_ENTITY_CLASS = "User";

export interface UserEntity extends Entity {
  id: string;
  displayName: string | undefined;
  givenName: string | undefined;
  firstName: string | undefined;
  jobTitle: string | undefined;
  email: string | undefined;
  mail: string | undefined;
  mobilePhone: string | undefined;
  officeLocation: string | undefined;
  preferredLanguage: string | undefined;
  surname: string | undefined;
  lastName: string | undefined;
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
export interface GroupMemberEntity extends Entity {
  displayName: string | undefined;
  jobTitle: string | undefined;
  mail: string | undefined;
}

export const VIRTUAL_NETWORK_ENTITY_TYPE = "azure_vnet";
export const VIRTUAL_NETWORK_ENTITY_CLASS = "Network";

export const SECURITY_GROUP_ENTITY_TYPE = "azure_security_group";
export const SECURITY_GROUP_ENTITY_CLASS = "Firewall";

export const SUBNET_ENTITY_TYPE = "azure_subnet";
export const SUBNET_ENTITY_CLASS = "Network";

export interface AzureRegionalEntity extends Entity {
  type: string | undefined;
  resourceGroup: string | undefined;
  region: string | undefined;
}

export interface VirtualMachineEntity extends Entity, AzureRegionalEntity {
  /**
   * The `vmId` property of the `VirtualMachine`. This is distinct from the `id`.
   */
  vmId: string | undefined;
  vmSize: string | undefined;
}

export const VIRTUAL_MACHINE_ENTITY_TYPE = "azure_vm";
export const VIRTUAL_MACHINE_ENTITY_CLASS = "Host";

export const VIRTUAL_MACHINE_IMAGE_ENTITY_TYPE = "azure_image";
export const VIRTUAL_MACHINE_IMAGE_ENTITY_CLASS = "Image";

export const DISK_ENTITY_TYPE = "azure_managed_disk";
export const DISK_ENTITY_CLASS = ["DataStore", "Disk"];

export interface PublicIPAddressEntity extends Entity {
  type: string | undefined;
  resourceGuid: string | undefined;
  resourceGroup: string | undefined;
  region: string | undefined;
  publicIp: string | undefined;
  publicIpAddress: string | undefined;
  public: boolean;
  sku: string | undefined;
}

export const PUBLIC_IP_ADDRESS_ENTITY_TYPE = "azure_public_ip";
export const PUBLIC_IP_ADDRESS_ENTITY_CLASS = "IpAddress";

export interface NetworkInterfaceEntity extends Entity {
  type: string | undefined;
  resourceGuid: string | undefined;
  resourceGroup: string | undefined;
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

export const LOAD_BALANCER_ENTITY_TYPE = "azure_lb";
export const LOAD_BALANCER_ENTITY_CLASS = "Gateway";

export const STORAGE_BLOB_SERVICE_ENTITY_TYPE = "azure_storage_blob_service";
export const STORAGE_BLOB_SERVICE_ENTITY_CLASS = "Service";

export const STORAGE_CONTAINER_ENTITY_TYPE = "azure_storage_container";
export const STORAGE_CONTAINER_ENTITY_CLASS = "DataStore";

export const STORAGE_FILE_SERVICE_ENTITY_TYPE = "azure_storage_file_service";
export const STORAGE_FILE_SERVICE_ENTITY_CLASS = "Service";

export const STORAGE_FILE_SHARE_ENTITY_TYPE = "azure_storage_share";
export const STORAGE_FILE_SHARE_ENTITY_CLASS = "DataStore";

export const STORAGE_QUEUE_SERVICE_ENTITY_TYPE = "azure_storage_queue_service";
export const STORAGE_QUEUE_SERVICE_ENTITY_CLASS = "Service";

export const STORAGE_TABLE_SERVICE_ENTITY_TYPE = "azure_storage_table_service";
export const STORAGE_TABLE_SERVICE_ENTITY_CLASS = "Service";

export const AZURE_DATABASE_ENTITY_CLASS = ["Database", "DataStore"];
export const AZURE_DB_SERVER_ENTITY_CLASS = ["Database", "DataStore", "Host"];

export const SQL_DATABASE_ENTITY_TYPE = "azure_sql_database";
export const SQL_SERVER_ENTITY_TYPE = "azure_sql_server";

export interface SQLDatabaseEntity extends Entity {
  location: string | undefined;
}
