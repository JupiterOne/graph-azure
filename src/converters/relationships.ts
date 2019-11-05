import { VirtualMachine } from "@azure/arm-compute/esm/models";
import {
  PublicIPAddress,
  NetworkInterface,
  VirtualNetwork,
  Subnet,
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
  USER_ENTITY_CLASS,
  USER_ENTITY_TYPE,
  VirtualMachinePublicIPAddressRelationship,
  VirtualMachineNetworkInterfaceRelationship,
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

function getGroupMemberEntityType(member: GroupMember) {
  switch (member["@odata.type"]) {
    case MemberType.USER:
      return USER_ENTITY_TYPE;
    case MemberType.GROUP:
      return GROUP_ENTITY_TYPE;
    default:
      return GROUP_MEMBER_ENTITY_TYPE;
  }
}

function getGroupMemberEntityClass(member: GroupMember) {
  switch (member["@odata.type"]) {
    case MemberType.USER:
      return USER_ENTITY_CLASS;
    case MemberType.GROUP:
      return GROUP_ENTITY_CLASS;
    default:
      return GROUP_MEMBER_ENTITY_CLASS;
  }
}

export function createVirtualNetworkSubnetRelationship(
  vnet: VirtualNetwork,
  subnet: Subnet,
): RelationshipFromIntegration & { vnetId: string | undefined } {
  return {
    _key: `${vnet.id}_has_${subnet.id}`,
    _type: "azure_vnet_has_subnet",
    _class: "HAS",
    _fromEntityKey: vnet.id as string,
    _toEntityKey: subnet.id as string,
    displayName: "HAS",
    vnetId: vnet.id,
  };
}

export function createVirtualMachinePublicIPAddressRelationship(
  vm: VirtualMachine,
  ipAddress: PublicIPAddress,
): VirtualMachinePublicIPAddressRelationship {
  return {
    _key: `${vm.id}_uses_${ipAddress.id}`,
    _type: "azure_vm_uses_public_ip",
    _class: "USES",
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
    _type: "azure_vm_uses_network_interface",
    _class: "USES",
    _fromEntityKey: vm.id as string,
    _toEntityKey: nic.id as string,
    displayName: "USES",
    vmId: vm.vmId as string,
  };
}
