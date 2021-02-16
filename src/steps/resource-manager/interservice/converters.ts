import { VirtualMachine } from '@azure/arm-compute/esm/models';
import {
  NetworkInterface,
  PublicIPAddress,
  Subnet,
} from '@azure/arm-network/esm/models';
import {
  createDirectRelationship,
  Relationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { VIRTUAL_MACHINE_ENTITY_TYPE } from '../compute';
import { NetworkEntities } from '../network/constants';
import { VIRTUAL_MACHINE_NIC_RELATIONSHIP_TYPE } from './constants';

export function createVirtualMachineNetworkInterfaceRelationship(
  vm: VirtualMachine,
  nic: NetworkInterface,
): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.USES,
    fromKey: vm.id as string,
    fromType: VIRTUAL_MACHINE_ENTITY_TYPE,
    toKey: nic.id as string,
    toType: NetworkEntities.NETWORK_INTERFACE._type,
    properties: {
      _type: VIRTUAL_MACHINE_NIC_RELATIONSHIP_TYPE,
      vmId: vm.vmId as string,
    },
  });
}

export function createSubnetVirtualMachineRelationship(
  subnet: Subnet,
  vm: VirtualMachine,
): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.HAS,
    fromKey: subnet.id as string,
    fromType: NetworkEntities.SUBNET._type,
    toKey: vm.id as string,
    toType: VIRTUAL_MACHINE_ENTITY_TYPE,
  });
}

export function createVirtualMachinePublicIPAddressRelationship(
  vm: VirtualMachine,
  ipAddress: PublicIPAddress,
): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.USES,
    fromKey: vm.id as string,
    fromType: VIRTUAL_MACHINE_ENTITY_TYPE,
    toKey: ipAddress.id as string,
    toType: NetworkEntities.PUBLIC_IP_ADDRESS._type,
    properties: {
      vmId: vm.vmId as string,
    },
  });
}
