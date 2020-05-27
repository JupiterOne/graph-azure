import { VirtualMachine } from '@azure/arm-compute/esm/models';
import {
  NetworkInterface,
  PublicIPAddress,
  Subnet,
} from '@azure/arm-network/esm/models';
import {
  createIntegrationRelationship,
  Relationship,
} from '@jupiterone/integration-sdk';

import { VIRTUAL_MACHINE_ENTITY_TYPE } from '../compute';
import {
  NETWORK_INTERFACE_ENTITY_TYPE,
  PUBLIC_IP_ADDRESS_ENTITY_TYPE,
  SUBNET_ENTITY_TYPE,
} from '../network';
import { VIRTUAL_MACHINE_NIC_RELATIONSHIP_TYPE } from './constants';

export function createVirtualMachineNetworkInterfaceRelationship(
  vm: VirtualMachine,
  nic: NetworkInterface,
): Relationship {
  return createIntegrationRelationship({
    _class: 'USES',
    fromKey: vm.id as string,
    fromType: VIRTUAL_MACHINE_ENTITY_TYPE,
    toKey: nic.id as string,
    toType: NETWORK_INTERFACE_ENTITY_TYPE,
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
  return createIntegrationRelationship({
    _class: 'HAS',
    fromKey: subnet.id as string,
    fromType: SUBNET_ENTITY_TYPE,
    toKey: vm.id as string,
    toType: VIRTUAL_MACHINE_ENTITY_TYPE,
  });
}

export function createVirtualMachinePublicIPAddressRelationship(
  vm: VirtualMachine,
  ipAddress: PublicIPAddress,
): Relationship {
  return createIntegrationRelationship({
    _class: 'USES',
    fromKey: vm.id as string,
    fromType: VIRTUAL_MACHINE_ENTITY_TYPE,
    toKey: ipAddress.id as string,
    toType: PUBLIC_IP_ADDRESS_ENTITY_TYPE,
    properties: {
      vmId: vm.vmId as string,
    },
  });
}
