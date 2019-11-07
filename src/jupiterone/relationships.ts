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

export const SECURITY_GROUP_SUBNET_RELATIONSHIP_TYPE =
  "azure_security_group_protects_subnet";
export const SECURITY_GROUP_SUBNET_RELATIONSHIP_CLASS = "PROTECTS";

export const VIRTUAL_NETWORK_SUBNET_RELATIONSHIP_TYPE =
  "azure_vnet_contains_subnet";
export const VIRTUAL_NETWORK_SUBNET_RELATIONSHIP_CLASS = "CONTAINS";

export const VIRTUAL_MACHINE_NETWORK_INTERFACE_RELATIONSHIP_TYPE =
  "azure_vm_uses_network_interface";
export const VIRTUAL_MACHINE_NETWORK_INTERFACE_RELATIONSHIP_CLASS = "USES";

export interface VirtualMachineNetworkInterfaceRelationship
  extends RelationshipFromIntegration {
  vmId: string;
}

export const VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_TYPE =
  "azure_vm_uses_public_ip";
export const VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_CLASS = "USES";

export interface VirtualMachinePublicIPAddressRelationship
  extends RelationshipFromIntegration {
  vmId: string;
}
