import { VirtualMachine } from '@azure/arm-compute/esm/models';
import { NetworkInterface } from '@azure/arm-network/esm/models';
import {
  Entity,
  getRawData,
  JobState,
  Relationship,
  Step,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { STEP_AD_ACCOUNT } from '../../active-directory';
import {
  STEP_RM_COMPUTE_VIRTUAL_MACHINES,
  VIRTUAL_MACHINE_ENTITY_TYPE,
} from '../compute';
import {
  STEP_RM_NETWORK_INTERFACES,
  STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES,
  NetworkEntities,
} from '../network/constants';
import {
  STEP_RM_COMPUTE_NETWORK_RELATIONSHIPS,
  SUBNET_VIRTUAL_MACHINE_RELATIONSHIP_TYPE,
  VIRTUAL_MACHINE_NIC_RELATIONSHIP_TYPE,
  VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_TYPE,
  SUBNET_VIRTUAL_MACHINE_RELATIONSHIP_CLASS,
  VIRTUAL_MACHINE_NIC_RELATIONSHIP_CLASS,
  VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_CLASS,
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

      // A nic with multiple ipConfigurations in the same subnet should not
      // generate more than one subnet -> vm relationship.
      const subnetVmRelationshipKeys = new Set<string>();

      for (const nic of nicData) {
        relationships.push(
          createVirtualMachineNetworkInterfaceRelationship(vmData, nic),
        );
        for (const c of nic.ipConfigurations || []) {
          if (c.subnet) {
            const subnetVmRelationship = createSubnetVirtualMachineRelationship(
              c.subnet,
              vmData,
            );
            if (!subnetVmRelationshipKeys.has(subnetVmRelationship._key)) {
              relationships.push(subnetVmRelationship);
              subnetVmRelationshipKeys.add(subnetVmRelationship._key);
            }
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
    { _type: NetworkEntities.NETWORK_INTERFACE._type },
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

export const interserviceSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: STEP_RM_COMPUTE_NETWORK_RELATIONSHIPS,
    name: 'Compute Network Relationships',
    entities: [],
    relationships: [
      {
        _type: SUBNET_VIRTUAL_MACHINE_RELATIONSHIP_TYPE,
        sourceType: NetworkEntities.SUBNET._type,
        _class: SUBNET_VIRTUAL_MACHINE_RELATIONSHIP_CLASS,
        targetType: VIRTUAL_MACHINE_ENTITY_TYPE,
      },
      {
        _type: VIRTUAL_MACHINE_NIC_RELATIONSHIP_TYPE,
        sourceType: VIRTUAL_MACHINE_ENTITY_TYPE,
        _class: VIRTUAL_MACHINE_NIC_RELATIONSHIP_CLASS,
        targetType: NetworkEntities.NETWORK_INTERFACE._type,
      },
      {
        _type: VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_TYPE,
        sourceType: VIRTUAL_MACHINE_ENTITY_TYPE,
        _class: VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_CLASS,
        targetType: NetworkEntities.PUBLIC_IP_ADDRESS._type,
      },
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
