import map from 'lodash.map';

import { VirtualMachine } from '@azure/arm-compute/esm/models';
import { NetworkInterface } from '@azure/arm-network/esm/models';
import {
  Entity,
  getRawData,
  JobState,
  Relationship,
} from '@jupiterone/integration-sdk';

import { IntegrationStepContext } from '../../../types';
import { STEP_AD_ACCOUNT } from '../../active-directory';
import { VIRTUAL_MACHINE_ENTITY_TYPE } from '../compute';
import {
  NETWORK_INTERFACE_ENTITY_TYPE,
  STEP_RM_NETWORK_INTERFACES,
  STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES,
} from '../network';
import {
  STEP_RM_COMPUTE_NETWORK_RELATIONSHIPS,
  SUBNET_VIRTUAL_MACHINE_RELATIONSHIP_TYPE,
  VIRTUAL_MACHINE_NIC_RELATIONSHIP_TYPE,
  VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_TYPE,
} from './constants';
import {
  createSubnetVirtualMachineRelationship,
  createVirtualMachineNetworkInterfaceRelationship,
  createVirtualMachinePublicIPAddressRelationship,
} from './converters';

export * from './constants';

export async function buildComputeNetworkRelationships(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState } = executionContext;

  const networkInterfaces: NetworkInterface[] = loadNetworkInterfaces(jobState);
  const relationships: Relationship[] = [];

  await jobState.iterateEntities(
    { _type: VIRTUAL_MACHINE_ENTITY_TYPE },
    (vmEntity: Entity) => {
      const vmData = getRawData<VirtualMachine>(vmEntity);
      if (!vmData) {
        throw new Error(
          'Iterating virtual machine entities, raw data is missing!',
        );
      }

      const nicData = findVirtualMachineNetworkInterfaces(
        vmData,
        networkInterfaces,
      );
      for (const nic of nicData) {
        relationships.push(
          createVirtualMachineNetworkInterfaceRelationship(vmData, nic),
        );
        for (const c of nic.ipConfigurations || []) {
          if (c.subnet) {
            relationships.push(
              createSubnetVirtualMachineRelationship(c.subnet, vmData),
            );
          }
          if (c.publicIPAddress) {
            relationships.push(
              createVirtualMachinePublicIPAddressRelationship(
                vmData,
                c.publicIPAddress,
              ),
            );
          }
        }
      }
    },
  );
}

function loadNetworkInterfaces(jobState: JobState): NetworkInterface[] {
  const networkInterfaces: NetworkInterface[] = [];
  jobState.iterateEntities({ _type: NETWORK_INTERFACE_ENTITY_TYPE }, (nic) => {
    networkInterfaces.push(nic);
  });
  return networkInterfaces;
}

function findVirtualMachineNetworkInterfaces(
  vm: VirtualMachine,
  nics: NetworkInterface[],
): NetworkInterface[] {
  const vmNics: NetworkInterface[] = [];
  if (vm.networkProfile) {
    map(vm.networkProfile.networkInterfaces, (n) =>
      nics.find((e) => e.id === n.id),
    ).forEach((e) => e && vmNics.push(e));
  }
  return vmNics;
}

export const interserviceSteps = [
  {
    id: STEP_RM_COMPUTE_NETWORK_RELATIONSHIPS,
    name: 'Compute Network Relationships',
    types: [
      SUBNET_VIRTUAL_MACHINE_RELATIONSHIP_TYPE,
      VIRTUAL_MACHINE_NIC_RELATIONSHIP_TYPE,
      VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_TYPE,
    ],
    dependsOn: [
      STEP_AD_ACCOUNT,
      STEP_RM_NETWORK_INTERFACES,
      STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES,
    ],
    executionHandler: buildComputeNetworkRelationships,
  },
];
