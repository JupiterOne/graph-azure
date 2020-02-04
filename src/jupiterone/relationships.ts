export const ACCOUNT_GROUP_RELATIONSHIP_TYPE = "azure_account_has_group";
export const ACCOUNT_GROUP_RELATIONSHIP_CLASS = "HAS";

export const ACCOUNT_USER_RELATIONSHIP_TYPE = "azure_account_has_user";
export const ACCOUNT_USER_RELATIONSHIP_CLASS = "HAS";

export const GROUP_MEMBER_RELATIONSHIP_TYPE = "azure_group_has_member";
export const GROUP_MEMBER_RELATIONSHIP_CLASS = "HAS";

export const SECURITY_GROUP_NIC_RELATIONSHIP_TYPE =
  "azure_security_group_protects_nic";
export const SECURITY_GROUP_NIC_RELATIONSHIP_CLASS = "PROTECTS";

export const SECURITY_GROUP_SUBNET_RELATIONSHIP_TYPE =
  "azure_security_group_protects_subnet";
export const SECURITY_GROUP_SUBNET_RELATIONSHIP_CLASS = "PROTECTS";

export const SUBNET_VIRTUAL_MACHINE_RELATIONSHIP_TYPE = "azure_subnet_has_vm";
export const SUBNET_VIRTUAL_MACHINE_RELATIONSHIP_CLASS = "HAS";

export const VIRTUAL_NETWORK_SUBNET_RELATIONSHIP_TYPE =
  "azure_vnet_contains_subnet";
export const VIRTUAL_NETWORK_SUBNET_RELATIONSHIP_CLASS = "CONTAINS";

export const VIRTUAL_MACHINE_NIC_RELATIONSHIP_TYPE =
  "azure_vm_uses_network_interface";
export const VIRTUAL_MACHINE_NIC_RELATIONSHIP_CLASS = "USES";

export const VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_TYPE =
  "azure_vm_uses_public_ip";
export const VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_CLASS = "USES";

export const SQL_SERVER_DATABASE_RELATIONSHIP_TYPE =
  "azure_sql_server_has_database";
export const SQL_SERVER_DATABASE_RELATIONSHIP_CLASS = "HAS";
