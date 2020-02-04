import { VirtualMachine } from "@azure/arm-compute/esm/models";
import {
  NetworkInterface,
  NetworkSecurityGroup,
  PublicIPAddress,
  Subnet,
  VirtualNetwork,
} from "@azure/arm-network/esm/models";
import {
  createIntegrationRelationship,
  IntegrationRelationship,
  RelationshipDirection,
  EntityFromIntegration,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { Group, GroupMember, MemberType, User } from "../azure";
import {
  ACCOUNT_ENTITY_TYPE,
  ACCOUNT_GROUP_RELATIONSHIP_CLASS,
  ACCOUNT_GROUP_RELATIONSHIP_TYPE,
  ACCOUNT_USER_RELATIONSHIP_CLASS,
  ACCOUNT_USER_RELATIONSHIP_TYPE,
  AccountEntity,
  GROUP_ENTITY_CLASS,
  GROUP_ENTITY_TYPE,
  GROUP_MEMBER_ENTITY_CLASS,
  GROUP_MEMBER_ENTITY_TYPE,
  GROUP_MEMBER_RELATIONSHIP_CLASS,
  GROUP_MEMBER_RELATIONSHIP_TYPE,
  NETWORK_INTERFACE_ENTITY_TYPE,
  PUBLIC_IP_ADDRESS_ENTITY_TYPE,
  SECURITY_GROUP_ENTITY_TYPE,
  SECURITY_GROUP_NIC_RELATIONSHIP_CLASS,
  SECURITY_GROUP_NIC_RELATIONSHIP_TYPE,
  SECURITY_GROUP_SUBNET_RELATIONSHIP_CLASS,
  SECURITY_GROUP_SUBNET_RELATIONSHIP_TYPE,
  SUBNET_ENTITY_TYPE,
  SUBNET_VIRTUAL_MACHINE_RELATIONSHIP_CLASS,
  SUBNET_VIRTUAL_MACHINE_RELATIONSHIP_TYPE,
  USER_ENTITY_CLASS,
  USER_ENTITY_TYPE,
  VIRTUAL_MACHINE_ENTITY_TYPE,
  VIRTUAL_MACHINE_NIC_RELATIONSHIP_CLASS,
  VIRTUAL_MACHINE_NIC_RELATIONSHIP_TYPE,
  VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_CLASS,
  VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_TYPE,
  VIRTUAL_NETWORK_ENTITY_TYPE,
  VIRTUAL_NETWORK_SUBNET_RELATIONSHIP_CLASS,
  VIRTUAL_NETWORK_SUBNET_RELATIONSHIP_TYPE,
  SQL_SERVER_DATABASE_RELATIONSHIP_CLASS,
  SQL_SERVER_DATABASE_RELATIONSHIP_TYPE,
} from "../jupiterone";
import {
  generateEntityKey,
  generateRelationshipKey,
} from "../utils/generateKeys";

export function createAccountGroupRelationship(
  account: AccountEntity,
  group: Group,
): IntegrationRelationship {
  const parentKey = account._key;
  const childKey = generateEntityKey(GROUP_ENTITY_TYPE, group.id);
  const key = generateRelationshipKey(parentKey, childKey);

  return createIntegrationRelationship({
    _class: ACCOUNT_GROUP_RELATIONSHIP_CLASS,
    fromKey: parentKey,
    fromType: ACCOUNT_ENTITY_TYPE,
    toKey: childKey,
    toType: GROUP_ENTITY_TYPE,
    properties: {
      _key: key,
      _type: ACCOUNT_GROUP_RELATIONSHIP_TYPE,
    },
  });
}

export function createAccountUserRelationship(
  account: AccountEntity,
  user: User,
): IntegrationRelationship {
  const fromKey = account._key;
  const toKey = generateEntityKey(USER_ENTITY_TYPE, user.id);
  const _key = generateRelationshipKey(fromKey, toKey);

  return createIntegrationRelationship({
    _class: ACCOUNT_USER_RELATIONSHIP_CLASS,
    fromType: ACCOUNT_ENTITY_TYPE,
    fromKey,
    toType: USER_ENTITY_TYPE,
    toKey,
    properties: {
      _key,
      _type: ACCOUNT_USER_RELATIONSHIP_TYPE,
    },
  });
}

export function createGroupMemberRelationship(
  group: Group,
  member: GroupMember,
): IntegrationRelationship {
  const memberEntityType = getGroupMemberEntityType(member);
  const memberEntityClass = getGroupMemberEntityClass(member);

  const groupKey = generateEntityKey(GROUP_ENTITY_TYPE, group.id);
  const memberKey = generateEntityKey(memberEntityType, member.id);

  return createIntegrationRelationship({
    _class: GROUP_MEMBER_RELATIONSHIP_CLASS,
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
    properties: {
      _key: generateRelationshipKey(groupKey, memberKey),
      _type: GROUP_MEMBER_RELATIONSHIP_TYPE,
      groupId: group.id,
      memberId: member.id,
      memberType: member["@odata.type"],
    },
  });
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
): IntegrationRelationship {
  return createIntegrationRelationship({
    _class: SECURITY_GROUP_NIC_RELATIONSHIP_CLASS,
    fromKey: securityGroup.id as string,
    fromType: SECURITY_GROUP_ENTITY_TYPE,
    toKey: nic.id as string,
    toType: NETWORK_INTERFACE_ENTITY_TYPE,
    properties: {
      _key: `${securityGroup.id}_protects_${nic.id}`,
      _type: SECURITY_GROUP_NIC_RELATIONSHIP_TYPE,
    },
  });
}

export function createNetworkSecurityGroupSubnetRelationship(
  securityGroup: NetworkSecurityGroup,
  subnet: Subnet,
): IntegrationRelationship {
  return createIntegrationRelationship({
    _class: SECURITY_GROUP_SUBNET_RELATIONSHIP_CLASS,
    fromKey: securityGroup.id as string,
    fromType: SECURITY_GROUP_ENTITY_TYPE,
    toKey: subnet.id as string,
    toType: SUBNET_ENTITY_TYPE,
    properties: {
      _key: `${securityGroup.id}_protects_${subnet.id}`,
      _type: SECURITY_GROUP_SUBNET_RELATIONSHIP_TYPE,
    },
  });
}

export function createSubnetVirtualMachineRelationship(
  subnet: Subnet,
  vm: VirtualMachine,
): IntegrationRelationship {
  return createIntegrationRelationship({
    _class: SUBNET_VIRTUAL_MACHINE_RELATIONSHIP_CLASS,
    fromKey: subnet.id as string,
    fromType: SUBNET_ENTITY_TYPE,
    toKey: vm.id as string,
    toType: VIRTUAL_MACHINE_ENTITY_TYPE,
    properties: {
      _key: `${subnet.id}_has_${vm.id}`,
      _type: SUBNET_VIRTUAL_MACHINE_RELATIONSHIP_TYPE,
    },
  });
}

export function createVirtualNetworkSubnetRelationship(
  vnet: VirtualNetwork,
  subnet: Subnet,
): IntegrationRelationship {
  return createIntegrationRelationship({
    _class: VIRTUAL_NETWORK_SUBNET_RELATIONSHIP_CLASS,
    fromKey: vnet.id as string,
    fromType: VIRTUAL_NETWORK_ENTITY_TYPE,
    toKey: subnet.id as string,
    toType: SUBNET_ENTITY_TYPE,
    properties: {
      _key: `${vnet.id}_contains_${subnet.id}`,
      _type: VIRTUAL_NETWORK_SUBNET_RELATIONSHIP_TYPE,
    },
  });
}

export function createVirtualMachinePublicIPAddressRelationship(
  vm: VirtualMachine,
  ipAddress: PublicIPAddress,
): IntegrationRelationship {
  return createIntegrationRelationship({
    _class: VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_CLASS,
    fromKey: vm.id as string,
    fromType: VIRTUAL_MACHINE_ENTITY_TYPE,
    toKey: ipAddress.id as string,
    toType: PUBLIC_IP_ADDRESS_ENTITY_TYPE,
    properties: {
      _key: `${vm.id}_uses_${ipAddress.id}`,
      _type: VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_TYPE,
      vmId: vm.vmId as string,
    },
  });
}

export function createVirtualMachineNetworkInterfaceRelationship(
  vm: VirtualMachine,
  nic: NetworkInterface,
): IntegrationRelationship {
  return createIntegrationRelationship({
    _class: VIRTUAL_MACHINE_NIC_RELATIONSHIP_CLASS,
    fromKey: vm.id as string,
    fromType: VIRTUAL_MACHINE_ENTITY_TYPE,
    toKey: nic.id as string,
    toType: NETWORK_INTERFACE_ENTITY_TYPE,
    properties: {
      _key: `${vm.id}_uses_${nic.id}`,
      _type: VIRTUAL_MACHINE_NIC_RELATIONSHIP_TYPE,
      vmId: vm.vmId as string,
    },
  });
}

export function createSqlServerDatabaseRelationship(
  server: EntityFromIntegration,
  database: EntityFromIntegration,
): IntegrationRelationship {
  return createIntegrationRelationship({
    _class: SQL_SERVER_DATABASE_RELATIONSHIP_CLASS,
    fromKey: server._key,
    fromType: server._type,
    toKey: database._key,
    toType: database._type,
    properties: {
      _type: SQL_SERVER_DATABASE_RELATIONSHIP_TYPE,
    },
  });
}
