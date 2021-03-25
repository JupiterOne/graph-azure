import {
  Entity,
  Step,
  IntegrationStepExecutionContext,
  Relationship,
  createDirectRelationship,
  RelationshipClass,
  getRawData,
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
  VIRTUAL_MACHINE_ENTITY_TYPE,
  VIRTUAL_MACHINE_IMAGE_ENTITY_TYPE,
  VIRTUAL_MACHINE_ENTITY_CLASS,
  DISK_ENTITY_CLASS,
  VIRTUAL_MACHINE_IMAGE_ENTITY_CLASS,
  steps,
  entities,
  relationships,
} from './constants';
import {
  createDiskEntity,
  createImageEntity,
  createVirtualMachineEntity,
  createVirtualMachineExtensionEntity,
  getVirtualMachineExtensionKey,
  VirtualMachineExtensionSharedProperties,
} from './converters';
import createResourceGroupResourceRelationship, {
  createResourceGroupResourceRelationshipMetadata,
} from '../utils/createResourceGroupResourceRelationship';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources';
import { VirtualMachine } from '@azure/arm-compute/esm/models';
import {
  entities as storageEntities,
  steps as storageSteps,
} from '../storage/constants';
import { StorageAccount } from '@azure/arm-storage/esm/models';

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
  });
}

export async function buildVirtualMachineDiskRelationships(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, jobState } = executionContext;

  const blobHostnameStorageAccountMap: { [blobHostname: string]: Entity } = {};
  await jobState.iterateEntities(
    { _type: storageEntities.STORAGE_ACCOUNT._type },
    (storageAccountEntity) => {
      const storageAccount = getRawData<StorageAccount>(storageAccountEntity);

      const storageAccountBlobEndpoint = storageAccount?.primaryEndpoints?.blob;

      if (!storageAccountBlobEndpoint) {
        logger.warn(
          {
            storageAccountId: storageAccount?.id,
            storageAccountBlobEndpoint,
          },
          'Could not find blob endpoint for storage account; not adding storage account to blobEndpointStorageAccountMap',
        );
        return;
      }

      const blobHostname = new URL(storageAccountBlobEndpoint).hostname;
      blobHostnameStorageAccountMap[blobHostname] = storageAccountEntity;
    },
  );

  await jobState.iterateEntities(
    { _type: VIRTUAL_MACHINE_ENTITY_TYPE },
    async (vmEntity) => {
      const vm = getRawData<VirtualMachine>(vmEntity);

      if (vm?.storageProfile) {
        await jobState.addRelationships(
          await createVirtualMachineDiskRelationships(
            vm,
            vmEntity,
            executionContext,
            blobHostnameStorageAccountMap,
          ),
        );
      }
    },
  );
}

export async function createVirtualMachineDiskRelationships(
  vm: VirtualMachine,
  vmEntity: Entity,
  context: IntegrationStepContext,
  blobHostnameStorageAccountMap: { [blobHostname: string]: Entity },
): Promise<Relationship[]> {
  enum DiskType {
    OS_DISK = 'osDisk',
    DATA_DISK = 'dataDisk',
  }

  async function createManagedDiskRelationship(options: {
    diskType: DiskType;
    diskId: string;
    vmEntity: Entity;
    context: IntegrationStepContext;
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
      logger.warn(
        {
          virtualMachineId: vmEntity.id,
          managedDiskId: diskId,
          diskType,
        },
        'Could not find managed disk defined by virtual machine.',
      );
    }
  }

  function createUnmanagedDiskRelationship(options: {
    diskType: DiskType;
    vmEntity: Entity;
    context: IntegrationStepContext;
    vhdUri: string;
  }): Relationship | undefined {
    const { diskType, vmEntity, vhdUri } = options;

    const blobHostname = new URL(vhdUri).hostname;
    const storageAccountEntity = blobHostnameStorageAccountMap[blobHostname];

    if (storageAccountEntity) {
      return createDirectRelationship({
        from: vmEntity,
        _class: RelationshipClass.USES,
        to: storageAccountEntity,
        properties: {
          vhdUri,
          diskType,
        },
      });
    } else {
      context.logger.warn(
        {
          vhdUri,
          diskType,
          storageAccountHostnames: Object.keys(blobHostnameStorageAccountMap),
        },
        'Could not find storage account for unmanaged disk defined by virtual machine.',
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
    } else if (vm.storageProfile.osDisk?.vhd?.uri) {
      const osDiskRelationship = createUnmanagedDiskRelationship({
        diskType: DiskType.OS_DISK,
        vmEntity,
        context,
        vhdUri: vm.storageProfile.osDisk.vhd.uri,
      });
      if (osDiskRelationship) {
        relationships.push(osDiskRelationship);
      }
    } else {
      context.logger.warn(
        {
          id: vm.id,
          'osDisk.managedDisk': vm.storageProfile.osDisk?.managedDisk,
          'osDisk.vhd': vm.storageProfile.osDisk?.vhd,
        },
        'No storage profile found for this VM OS disk.',
      );
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
      } else if (disk.vhd?.uri) {
        const dataDiskRelationship = createUnmanagedDiskRelationship({
          diskType: DiskType.DATA_DISK,
          vmEntity,
          context,
          vhdUri: disk.vhd.uri,
        });
        if (dataDiskRelationship) {
          relationships.push(dataDiskRelationship);
        }
      } else {
        context.logger.warn(
          {
            id: vm.id,
            'dataDisk.lun': disk.lun,
            'dataDisk.managedDisk': disk.managedDisk,
            'dataDisk.vhd': disk.vhd,
          },
          'No storage profile found for this VM Data disk.',
        );
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

export async function fetchVirtualMachineExtensions(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;

  const client = new ComputeClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: VIRTUAL_MACHINE_ENTITY_TYPE },
    async (vmEntity) => {
      await client.iterateVirtualMachineExtensions(
        {
          name: vmEntity.name as string,
          id: vmEntity.id as string,
        },
        async (vmExtension) => {
          const {
            id,
            location,
            provisioningState,
            ...vmExtensionSharedProperties
          } = vmExtension;
          const vmExtensionEntity = await findOrCreateVirtualMachineExtensionEntity(
            vmExtensionSharedProperties,
            executionContext,
          );

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.USES,
              from: vmEntity,
              to: vmExtensionEntity,
              properties: {
                id,
                location,
                provisioningState,
              },
            }),
          );
        },
      );
    },
  );
}

async function findOrCreateVirtualMachineExtensionEntity(
  extension: VirtualMachineExtensionSharedProperties,
  context: IntegrationStepContext,
): Promise<Entity> {
  let entity = await context.jobState.findEntity(
    getVirtualMachineExtensionKey(extension),
  );

  if (!entity) {
    entity = await context.jobState.addEntity(
      createVirtualMachineExtensionEntity(extension),
    );
  }

  return entity;
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
      createResourceGroupResourceRelationshipMetadata(
        VIRTUAL_MACHINE_ENTITY_TYPE,
      ),
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchVirtualMachines,
  },
  {
    id: steps.VIRTUAL_MACHINE_DISK_RELATIONSHIPS,
    name: 'Virtual Machine Disk Relationships',
    entities: [],
    relationships: [
      relationships.VIRTUAL_MACHINE_USES_UNMANAGED_DISK,
      relationships.VIRTUAL_MACHINE_USES_MANAGED_DISK,
    ],
    dependsOn: [
      STEP_RM_COMPUTE_VIRTUAL_MACHINES,
      STEP_RM_COMPUTE_VIRTUAL_MACHINE_DISKS,
      storageSteps.STORAGE_ACCOUNTS,
    ],
    executionHandler: buildVirtualMachineDiskRelationships,
  },
  {
    id: steps.VIRTUAL_MACHINE_EXTENSIONS,
    name: 'Virtual Machine Extensions',
    entities: [entities.VIRTUAL_MACHINE_EXTENSION],
    relationships: [],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_COMPUTE_VIRTUAL_MACHINES],
    executionHandler: fetchVirtualMachineExtensions,
  },
];
