import { VirtualMachine } from "@azure/arm-compute/esm/models";
import {
  NetworkInterface,
  NetworkSecurityGroup,
  PublicIPAddress,
  Subnet,
  VirtualNetwork,
} from "@azure/arm-network/esm/models";
import {
  RelationshipDirection,
  RelationshipFromIntegration,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { Group, GroupMember, MemberType, User } from "../azure";
import {
  ACCOUNT_GROUP_RELATIONSHIP_CLASS,
  ACCOUNT_GROUP_RELATIONSHIP_TYPE,
  ACCOUNT_USER_RELATIONSHIP_CLASS,
  ACCOUNT_USER_RELATIONSHIP_TYPE,
  AccountEntity,
  AccountGroupRelationship,
  AccountUserRelationship,
  GROUP_ENTITY_CLASS,
  GROUP_ENTITY_TYPE,
  GROUP_MEMBER_ENTITY_CLASS,
  GROUP_MEMBER_ENTITY_TYPE,
  GROUP_MEMBER_RELATIONSHIP_CLASS,
  GROUP_MEMBER_RELATIONSHIP_TYPE,
  GroupMemberRelationship,
  SECURITY_GROUP_NIC_RELATIONSHIP_CLASS,
  SECURITY_GROUP_NIC_RELATIONSHIP_TYPE,
  SECURITY_GROUP_SUBNET_RELATIONSHIP_CLASS,
  SECURITY_GROUP_SUBNET_RELATIONSHIP_TYPE,
  SUBNET_VIRTUAL_MACHINE_RELATIONSHIP_CLASS,
  SUBNET_VIRTUAL_MACHINE_RELATIONSHIP_TYPE,
  USER_ENTITY_CLASS,
  USER_ENTITY_TYPE,
  VIRTUAL_MACHINE_NIC_RELATIONSHIP_CLASS,
  VIRTUAL_MACHINE_NIC_RELATIONSHIP_TYPE,
  VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_CLASS,
  VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_TYPE,
  VIRTUAL_NETWORK_SUBNET_RELATIONSHIP_CLASS,
  VIRTUAL_NETWORK_SUBNET_RELATIONSHIP_TYPE,
  VirtualMachineNetworkInterfaceRelationship,
  VirtualMachinePublicIPAddressRelationship,
} from "../jupiterone";
import {
  generateEntityKey,
  generateRelationshipKey,
} from "../utils/generateKeys";

export function createAccountGroupRelationship(
  account: AccountEntity,
  group: Group,
): AccountGroupRelationship {
  const parentKey = account._key;
  const childKey = generateEntityKey(GROUP_ENTITY_TYPE, group.id);
  const key = generateRelationshipKey(parentKey, childKey);

  return {
    _class: ACCOUNT_GROUP_RELATIONSHIP_CLASS,
    _fromEntityKey: parentKey,
    _key: key,
    _type: ACCOUNT_GROUP_RELATIONSHIP_TYPE,
    _toEntityKey: childKey,
  };
}
export function createAccountUserRelationship(
  account: AccountEntity,
  user: User,
): AccountUserRelationship {
  const parentKey = account._key;
  const childKey = generateEntityKey(USER_ENTITY_TYPE, user.id);
  const key = generateRelationshipKey(parentKey, childKey);

  return {
    _class: ACCOUNT_USER_RELATIONSHIP_CLASS,
    _fromEntityKey: parentKey,
    _key: key,
    _type: ACCOUNT_USER_RELATIONSHIP_TYPE,
    _toEntityKey: childKey,
  };
}

export function createGroupMemberRelationship(
  group: Group,
  member: GroupMember,
): GroupMemberRelationship {
  const memberEntityType = getGroupMemberEntityType(member);
  const memberEntityClass = getGroupMemberEntityClass(member);

  const groupKey = generateEntityKey(GROUP_ENTITY_TYPE, group.id);
  const memberKey = generateEntityKey(memberEntityType, member.id);

  return {
    _class: GROUP_MEMBER_RELATIONSHIP_CLASS,
    _key: generateRelationshipKey(groupKey, memberKey),
    _type: GROUP_MEMBER_RELATIONSHIP_TYPE,
    _mapping: {
      relationshipDirection: RelationshipDirection.FORWARD,
      sourceEntityKey: groupKey,
      targetFilterKeys: [["_type", "_key"]],
      targetEntity: {
        _key: memberKey,
        _type: memberEntityType,
        _class: memberEntityClass,
        displayName: member.displayName,
        jobTitle: member.jobTitle,
        email: member.mail,
      },
    },
    groupId: group.id,
    memberId: member.id,
    memberType: member["@odata.type"],
  };
}

function getGroupMemberEntityType(member: GroupMember): string {
  switch (member["@odata.type"]) {
    case MemberType.USER:
      return USER_ENTITY_TYPE;
    case MemberType.GROUP:
      return GROUP_ENTITY_TYPE;
    default:
      return GROUP_MEMBER_ENTITY_TYPE;
  }
}

function getGroupMemberEntityClass(member: GroupMember): string {
  switch (member["@odata.type"]) {
    case MemberType.USER:
      return USER_ENTITY_CLASS;
    case MemberType.GROUP:
      return GROUP_ENTITY_CLASS;
    default:
      return GROUP_MEMBER_ENTITY_CLASS;
  }
}

export function createNetworkSecurityGroupNicRelationship(
  securityGroup: NetworkSecurityGroup,
  nic: NetworkInterface,
): RelationshipFromIntegration {
  return {
    _key: `${securityGroup.id}_protects_${nic.id}`,
    _type: SECURITY_GROUP_NIC_RELATIONSHIP_TYPE,
    _class: SECURITY_GROUP_NIC_RELATIONSHIP_CLASS,
    _fromEntityKey: securityGroup.id as string,
    _toEntityKey: nic.id as string,
    displayName: "PROTECTS",
  };
}

export function createNetworkSecurityGroupSubnetRelationship(
  securityGroup: NetworkSecurityGroup,
  subnet: Subnet,
): RelationshipFromIntegration {
  return {
    _key: `${securityGroup.id}_protects_${subnet.id}`,
    _type: SECURITY_GROUP_SUBNET_RELATIONSHIP_TYPE,
    _class: SECURITY_GROUP_SUBNET_RELATIONSHIP_CLASS,
    _fromEntityKey: securityGroup.id as string,
    _toEntityKey: subnet.id as string,
    displayName: "PROTECTS",
  };
}

export function createSubnetVirtualMachineRelationship(
  subnet: Subnet,
  vm: VirtualMachine,
): RelationshipFromIntegration {
  return {
    _key: `${subnet.id}_has_${vm.id}`,
    _type: SUBNET_VIRTUAL_MACHINE_RELATIONSHIP_TYPE,
    _class: SUBNET_VIRTUAL_MACHINE_RELATIONSHIP_CLASS,
    _fromEntityKey: subnet.id as string,
    _toEntityKey: vm.id as string,
    displayName: "HAS",
  };
}

export function createVirtualNetworkSubnetRelationship(
  vnet: VirtualNetwork,
  subnet: Subnet,
): RelationshipFromIntegration {
  return {
    _key: `${vnet.id}_contains_${subnet.id}`,
    _type: VIRTUAL_NETWORK_SUBNET_RELATIONSHIP_TYPE,
    _class: VIRTUAL_NETWORK_SUBNET_RELATIONSHIP_CLASS,
    _fromEntityKey: vnet.id as string,
    _toEntityKey: subnet.id as string,
    displayName: "CONTAINS",
  };
}

export function createVirtualMachinePublicIPAddressRelationship(
  vm: VirtualMachine,
  ipAddress: PublicIPAddress,
): VirtualMachinePublicIPAddressRelationship {
  return {
    _key: `${vm.id}_uses_${ipAddress.id}`,
    _type: VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_TYPE,
    _class: VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_CLASS,
    _fromEntityKey: vm.id as string,
    _toEntityKey: ipAddress.id as string,
    displayName: "USES",
    vmId: vm.vmId as string,
  };
}

export function createVirtualMachineNetworkInterfaceRelationship(
  vm: VirtualMachine,
  nic: NetworkInterface,
): VirtualMachineNetworkInterfaceRelationship {
  return {
    _key: `${vm.id}_uses_${nic.id}`,
    _type: VIRTUAL_MACHINE_NIC_RELATIONSHIP_TYPE,
    _class: VIRTUAL_MACHINE_NIC_RELATIONSHIP_CLASS,
    _fromEntityKey: vm.id as string,
    _toEntityKey: nic.id as string,
    displayName: "USES",
    vmId: vm.vmId as string,
  };
}
