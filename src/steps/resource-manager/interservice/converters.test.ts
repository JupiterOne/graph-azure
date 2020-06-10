import { VirtualMachine } from '@azure/arm-compute/esm/models';
import {
  NetworkInterface,
  PublicIPAddress,
  Subnet,
} from '@azure/arm-network/esm/models';
import { Relationship } from '@jupiterone/integration-sdk-core';

import {
  createSubnetVirtualMachineRelationship,
  createVirtualMachineNetworkInterfaceRelationship,
  createVirtualMachinePublicIPAddressRelationship,
} from './converters';

describe('createVirtualMachineNetworkInterfaceRelationship', () => {
  test('properties transferred', () => {
    const vm: VirtualMachine = {
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/J1DEV/providers/Microsoft.Compute/virtualMachines/j1dev',
      vmId: 'd908c31d-c93a-4359-987f-8cfdd1b65a61',
      location: 'eastus',
    };

    const nic: NetworkInterface = {
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev',
    };

    const relationship: Relationship & { vmId: string } = {
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/J1DEV/providers/Microsoft.Compute/virtualMachines/j1dev|uses|/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev',
      _type: 'azure_vm_uses_nic',
      _class: 'USES',
      _fromEntityKey:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/J1DEV/providers/Microsoft.Compute/virtualMachines/j1dev',
      _toEntityKey:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev',
      displayName: 'USES',
      vmId: 'd908c31d-c93a-4359-987f-8cfdd1b65a61',
    };

    expect(createVirtualMachineNetworkInterfaceRelationship(vm, nic)).toEqual(
      relationship,
    );
  });
});

describe('createSubnetVirtualMachineRelationship', () => {
  test('properties transferred', () => {
    const subnet: Subnet = {
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev',
    };

    const vm: VirtualMachine = {
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/J1DEV/providers/Microsoft.Compute/virtualMachines/j1dev',
      vmId: 'd908c31d-c93a-4359-987f-8cfdd1b65a61',
      location: 'eastus',
    };

    const relationship: Relationship = {
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev|has|/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/J1DEV/providers/Microsoft.Compute/virtualMachines/j1dev',
      _type: 'azure_subnet_has_vm',
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev',
      _toEntityKey:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/J1DEV/providers/Microsoft.Compute/virtualMachines/j1dev',
      displayName: 'HAS',
    };

    expect(createSubnetVirtualMachineRelationship(subnet, vm)).toEqual(
      relationship,
    );
  });
});

describe('createVirtualMachinePublicIPAddressRelationship', () => {
  test('properties transferred', () => {
    const vm: VirtualMachine = {
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/J1DEV/providers/Microsoft.Compute/virtualMachines/j1dev',
      vmId: 'd908c31d-c93a-4359-987f-8cfdd1b65a61',
      location: 'eastus',
    };

    const ip: PublicIPAddress = {
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev',
    };

    const relationship: Relationship & { vmId: string } = {
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/J1DEV/providers/Microsoft.Compute/virtualMachines/j1dev|uses|/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev',
      _type: 'azure_vm_uses_public_ip',
      _class: 'USES',
      _fromEntityKey:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/J1DEV/providers/Microsoft.Compute/virtualMachines/j1dev',
      _toEntityKey:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev',
      displayName: 'USES',
      vmId: 'd908c31d-c93a-4359-987f-8cfdd1b65a61',
    };

    expect(createVirtualMachinePublicIPAddressRelationship(vm, ip)).toEqual(
      relationship,
    );
  });
});
