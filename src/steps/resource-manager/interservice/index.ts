import { VirtualMachine } from '@azure/arm-compute/esm/models';
import { NetworkInterface } from '@azure/arm-network/esm/models';
import {
  Entity,
  getRawData,
  JobState,
  Relationship,
} from '@jupiterone/integration-sdk-core';

import { IntegrationStepContext } from '../../../types';
import { STEP_AD_ACCOUNT } from '../../active-directory';
import {
  STEP_RM_COMPUTE_VIRTUAL_MACHINES,
  VIRTUAL_MACHINE_ENTITY_TYPE,
} from '../compute';
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

  const networkInterfaces: NetworkInterface[] = await loadNetworkInterfaces(
    jobState,
  );

  await jobState.iterateEntities(
    { _type: VIRTUAL_MACHINE_ENTITY_TYPE },
    async (vmEntity: Entity) => {
      const relationships: Relationship[] = [];

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

      await jobState.addRelationships(relationships);
    },
  );
}

async function loadNetworkInterfaces(
  jobState: JobState,
): Promise<NetworkInterface[]> {
  const networkInterfaces: NetworkInterface[] = [];
  await jobState.iterateEntities(
    { _type: NETWORK_INTERFACE_ENTITY_TYPE },
    (nic) => {
      const nicRawData = getRawData<NetworkInterface>(nic);
      if (!nicRawData) {
        throw new Error('Iterating network interfaces, raw data is missing!');
      }
      networkInterfaces.push(nicRawData);
    },
  );
  return networkInterfaces;
}

function findVirtualMachineNetworkInterfaces(
  vm: VirtualMachine,
  nics: NetworkInterface[],
): NetworkInterface[] {
  const vmNics: NetworkInterface[] = [];
  vm.networkProfile?.networkInterfaces?.forEach((nic) => {
    const match = nics.find((e) => !!e.id && e.id === nic.id);
    if (match) {
      vmNics.push(match);
    }
  });
  console.log(JSON.stringify(vmNics, null, 2));
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
      STEP_RM_COMPUTE_VIRTUAL_MACHINES,
      STEP_RM_NETWORK_INTERFACES,
      STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES,
    ],
    executionHandler: buildComputeNetworkRelationships,
  },
];
