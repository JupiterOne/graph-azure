import { VirtualMachine } from '@azure/arm-compute/esm/models';
import { NetworkInterface } from '@azure/arm-network/esm/models';
import {
  Entity,
  getRawData,
  Step,
  IntegrationStepExecutionContext,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';

import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import {
  STEP_RM_COMPUTE_VIRTUAL_MACHINES,
  VIRTUAL_MACHINE_ENTITY_TYPE,
} from '../compute/constants';
import {
  STEP_RM_NETWORK_INTERFACES,
  STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES,
  STEP_RM_NETWORK_VIRTUAL_NETWORKS,
} from '../network/constants';
import {
  STEP_RM_COMPUTE_NETWORK_RELATIONSHIPS,
  InterserviceRelationships,
} from './constants';

export async function buildComputeNetworkRelationships(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: VIRTUAL_MACHINE_ENTITY_TYPE },
    async (vmEntity: Entity) => {
      const vmData = getRawData<VirtualMachine>(vmEntity);
      if (!vmData) {
        throw new Error(
          'Iterating virtual machine entities, raw data is missing!',
        );
      }

      for (const nicWithId of vmData.networkProfile?.networkInterfaces || []) {
        const nicEntity = await jobState.findEntity(nicWithId.id as string);
        if (!nicEntity) {
          logger.warn(
            {
              vmId: vmData.id,
              nicId: nicWithId.id,
            },
            'Could not find network interface in job state',
          );
          continue;
        }

        await jobState.addRelationship(
          createDirectRelationship({
            from: vmEntity,
            _class: InterserviceRelationships.VM_USES_NIC._class,
            to: nicEntity,
            properties: {
              _type: InterserviceRelationships.VM_USES_NIC._type,
            },
          }),
        );

        const nic = getRawData<NetworkInterface>(nicEntity);
        if (!nic) {
          logger.warn(
            {
              _key: nicEntity._key,
              _type: nicEntity._type,
            },
            'Could not get raw data for entity',
          );
          continue;
        }

        for (const ipConfiguration of nic.ipConfigurations || []) {
          if (ipConfiguration.publicIPAddress) {
            const publicIpEntity = await jobState.findEntity(
              ipConfiguration.publicIPAddress.id as string,
            );
            if (publicIpEntity) {
              await jobState.addRelationship(
                createDirectRelationship({
                  from: vmEntity,
                  _class: InterserviceRelationships.VM_USES_PUBLIC_IP._class,
                  to: publicIpEntity,
                  properties: {
                    _type: InterserviceRelationships.VM_USES_PUBLIC_IP._type,
                  },
                }),
              );
            } else {
              logger.warn(
                {
                  vmId: vmData.id,
                  publicIpId: ipConfiguration.publicIPAddress.id,
                },
                'Could not find public IP address in job state',
              );
            }
          }

          if (ipConfiguration.subnet) {
            const subnetEntity = await jobState.findEntity(
              ipConfiguration.subnet.id as string,
            );
            if (subnetEntity) {
              await jobState.addRelationship(
                createDirectRelationship({
                  from: subnetEntity,
                  _class: InterserviceRelationships.SUBNET_HAS_VM._class,
                  to: vmEntity,
                  properties: {
                    _type: InterserviceRelationships.SUBNET_HAS_VM._type,
                  },
                }),
              );
            } else {
              logger.warn(
                {
                  vmId: vmData.id,
                  subnetId: ipConfiguration.subnet.id,
                },
                'Could not find subnet in job state',
              );
            }
          }
        }
      }
    },
  );
}

export const interserviceSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: STEP_RM_COMPUTE_NETWORK_RELATIONSHIPS,
    name: 'Compute Network Relationships',
    entities: [],
    relationships: [
      InterserviceRelationships.VM_USES_NIC,
      InterserviceRelationships.VM_USES_PUBLIC_IP,
      InterserviceRelationships.SUBNET_HAS_VM,
    ],
    dependsOn: [
      STEP_RM_COMPUTE_VIRTUAL_MACHINES,
      STEP_RM_NETWORK_INTERFACES,
      STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES,
      STEP_RM_NETWORK_VIRTUAL_NETWORKS,
    ],
    executionHandler: buildComputeNetworkRelationships,
  },
];
