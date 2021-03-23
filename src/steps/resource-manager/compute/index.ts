import {
  Entity,
  Step,
  IntegrationStepExecutionContext,
  Relationship,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { getAccountEntity, STEP_AD_ACCOUNT } from '../../active-directory';
import { ComputeClient } from './client';
import {
  DISK_ENTITY_TYPE,
  STEP_RM_COMPUTE_VIRTUAL_MACHINE_DISKS,
  STEP_RM_COMPUTE_VIRTUAL_MACHINE_IMAGES,
  STEP_RM_COMPUTE_VIRTUAL_MACHINES,
  VIRTUAL_MACHINE_DISK_RELATIONSHIP_TYPE,
  VIRTUAL_MACHINE_ENTITY_TYPE,
  VIRTUAL_MACHINE_IMAGE_ENTITY_TYPE,
  VIRTUAL_MACHINE_ENTITY_CLASS,
  DISK_ENTITY_CLASS,
  VIRTUAL_MACHINE_DISK_RELATIONSHIP_CLASS,
  VIRTUAL_MACHINE_IMAGE_ENTITY_CLASS,
} from './constants';
import {
  createDiskEntity,
  createImageEntity,
  createVirtualMachineEntity,
} from './converters';
import createResourceGroupResourceRelationship, {
  createResourceGroupResourceRelationshipMetadata,
} from '../utils/createResourceGroupResourceRelationship';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources';
import { VirtualMachine } from '@azure/arm-compute/esm/models';

export * from './constants';

export async function fetchVirtualMachines(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ComputeClient(instance.config, logger);

  await client.iterateVirtualMachines(async (vm) => {
    const virtualMachineEntity = createVirtualMachineEntity(webLinker, vm);
    await jobState.addEntity(virtualMachineEntity);

    await createResourceGroupResourceRelationship(
      executionContext,
      virtualMachineEntity,
    );

    if (vm.storageProfile) {
      await jobState.addRelationships(
        await createVirtualMachineDiskRelationships(
          vm,
          virtualMachineEntity,
          executionContext,
        ),
      );
    }
  });
}

export async function createVirtualMachineDiskRelationships(
  vm: VirtualMachine,
  vmEntity: Entity,
  context: IntegrationStepExecutionContext,
): Promise<Relationship[]> {
  enum DiskType {
    OS_DISK = 'osDisk',
    DATA_DISK = 'dataDisk',
  }

  async function createManagedDiskRelationship(options: {
    diskType: DiskType;
    diskId: string;
    vmEntity: Entity;
    context: IntegrationStepExecutionContext;
  }): Promise<Relationship | undefined> {
    const { diskType, diskId, vmEntity, context } = options;
    const { jobState, logger } = context;
    const managedDiskEntity = await jobState.findEntity(diskId);
    if (managedDiskEntity) {
      return createDirectRelationship({
        _class: RelationshipClass.USES,
        from: vmEntity,
        to: managedDiskEntity,
        properties: {
          [diskType]: true,
        },
      });
    } else {
      logger.error(
        {
          virtualMachineId: vmEntity.id,
          managedDiskId: diskId,
          diskType,
        },
        'Could not find managed disk defined by virtual machine.',
      );
    }
  }

  const relationships: Relationship[] = [];

  if (vm.storageProfile) {
    if (vm.storageProfile.osDisk?.managedDisk?.id) {
      const osDiskRelationship = await createManagedDiskRelationship({
        diskType: DiskType.OS_DISK,
        vmEntity,
        context,
        diskId: vm.storageProfile.osDisk.managedDisk.id,
      });
      if (osDiskRelationship) {
        relationships.push(osDiskRelationship);
      }
    }

    for (const disk of vm.storageProfile.dataDisks || []) {
      if (disk.managedDisk?.id) {
        const dataDiskRelationship = await createManagedDiskRelationship({
          diskType: DiskType.DATA_DISK,
          vmEntity,
          context,
          diskId: disk.managedDisk.id,
        });
        if (dataDiskRelationship) {
          relationships.push(dataDiskRelationship);
        }
      }
    }
  }

  return relationships;
}

export async function fetchVirtualMachineImages(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ComputeClient(instance.config, logger);

  await client.iterateVirtualMachineImages(async (vm) => {
    const imageEntity = createImageEntity(webLinker, vm);
    await jobState.addEntity(imageEntity);

    await createResourceGroupResourceRelationship(
      executionContext,
      imageEntity,
    );
  });
}

export async function fetchVirtualMachineDisks(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ComputeClient(instance.config, logger);

  await client.iterateVirtualMachineDisks(async (data) => {
    const diskEntity = createDiskEntity(webLinker, data);
    await jobState.addEntity(diskEntity);

    await createResourceGroupResourceRelationship(executionContext, diskEntity);
  });
}

export const computeSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: STEP_RM_COMPUTE_VIRTUAL_MACHINE_IMAGES,
    name: 'Virtual Machine Disk Images',
    entities: [
      {
        resourceName: '[RM] Image',
        _type: VIRTUAL_MACHINE_IMAGE_ENTITY_TYPE,
        _class: VIRTUAL_MACHINE_IMAGE_ENTITY_CLASS,
      },
    ],
    relationships: [
      createResourceGroupResourceRelationshipMetadata(
        VIRTUAL_MACHINE_IMAGE_ENTITY_TYPE,
      ),
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchVirtualMachineImages,
  },
  {
    id: STEP_RM_COMPUTE_VIRTUAL_MACHINE_DISKS,
    name: 'Virtual Machine Disks',
    entities: [
      {
        resourceName: '[RM] Azure Managed Disk',
        _type: DISK_ENTITY_TYPE,
        _class: DISK_ENTITY_CLASS,
      },
    ],
    relationships: [
      createResourceGroupResourceRelationshipMetadata(DISK_ENTITY_TYPE),
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchVirtualMachineDisks,
  },
  {
    id: STEP_RM_COMPUTE_VIRTUAL_MACHINES,
    name: 'Virtual Machines',
    entities: [
      {
        resourceName: '[RM] Virtual Machine',
        _type: VIRTUAL_MACHINE_ENTITY_TYPE,
        _class: VIRTUAL_MACHINE_ENTITY_CLASS,
      },
    ],
    relationships: [
      {
        _type: VIRTUAL_MACHINE_DISK_RELATIONSHIP_TYPE,
        sourceType: VIRTUAL_MACHINE_ENTITY_TYPE,
        _class: VIRTUAL_MACHINE_DISK_RELATIONSHIP_CLASS,
        targetType: DISK_ENTITY_TYPE,
      },
      createResourceGroupResourceRelationshipMetadata(
        VIRTUAL_MACHINE_ENTITY_TYPE,
      ),
    ],
    dependsOn: [
      STEP_AD_ACCOUNT,
      STEP_RM_COMPUTE_VIRTUAL_MACHINE_DISKS,
      STEP_RM_RESOURCES_RESOURCE_GROUPS,
    ],
    executionHandler: fetchVirtualMachines,
  },
];
