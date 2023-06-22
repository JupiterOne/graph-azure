import {
  Entity,
  IntegrationStepExecutionContext,
  Relationship,
  createDirectRelationship,
  RelationshipClass,
  getRawData,
  generateRelationshipKey,
  createMappedRelationship,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, AzureIntegrationStep } from '../../../types';
import { getAccountEntity } from '../../active-directory';
import {
  SERVICE_PRINCIPAL_ENTITY_TYPE,
  STEP_AD_ACCOUNT,
} from '../../active-directory/constants';
import { ComputeClient } from './client';
import { steps, entities, relationships } from './constants';
import {
  createDiskEntity,
  createGalleryEntity,
  createImageEntity,
  createSharedImage,
  createSharedImageVersion,
  createVirtualMachineEntity,
  createVirtualMachineExtensionEntity,
  createVMScaleSetsEntity,
  getVirtualMachineExtensionKey,
  VirtualMachineExtensionSharedProperties,
} from './converters';
import createResourceGroupResourceRelationship, {
  createResourceGroupResourceRelationshipMetadata,
} from '../utils/createResourceGroupResourceRelationship';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources/constants';
import {
  Gallery,
  GalleryImage,
  GalleryImageVersion,
  VirtualMachine,
  VirtualMachineScaleSet,
  VirtualMachinesInstanceViewResponse,
} from '@azure/arm-compute/esm/models';
import {
  entities as storageEntities,
  steps as storageSteps,
} from '../storage/constants';
import { StorageAccount } from '@azure/arm-storage/esm/models';
import { getResourceGroupName } from '../utils/matchers';

export async function fetchGalleries(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ComputeClient(instance.config, logger);

  await client.iterateGalleries(async (gallery) => {
    const galleryEntity = createGalleryEntity(webLinker, gallery);
    await jobState.addEntity(galleryEntity);

    await createResourceGroupResourceRelationship(
      executionContext,
      galleryEntity,
    );
  });
}

export async function fetchGalleryImages(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ComputeClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: entities.GALLERY._type },
    async (galleryEntity) => {
      const gallery = getRawData<Gallery>(galleryEntity)!;
      await client.iterateGalleryImages(
        {
          id: gallery.id!,
          name: gallery.name!,
        },
        async (image) => {
          const sharedImageEntity = createSharedImage(webLinker, image);
          await jobState.addEntity(sharedImageEntity);

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.CONTAINS,
              from: galleryEntity,
              to: sharedImageEntity,
            }),
          );
        },
      );
    },
  );
}

export async function fetchGalleryImageVersions(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ComputeClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: entities.SHARED_IMAGE._type },
    async (sharedImageEntity) => {
      const sharedImage = getRawData<GalleryImage>(sharedImageEntity)!;
      await client.iterateGalleryImageVersions(
        {
          id: sharedImage.id!,
          name: sharedImage.name!,
        },
        async (imageVersion) => {
          const imageVersionEntity = createSharedImageVersion(
            webLinker,
            imageVersion,
          );
          await jobState.addEntity(imageVersionEntity);

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: sharedImageEntity,
              to: imageVersionEntity,
            }),
          );
        },
      );
    },
  );
}

export async function buildGalleryImageVersionSourceRelationships(
  executionContext: IntegrationStepExecutionContext,
): Promise<void> {
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    {
      _type: entities.SHARED_IMAGE_VERSION._type,
    },
    async (imageVersionEntity) => {
      const imageVersion = getRawData<GalleryImageVersion>(imageVersionEntity);

      const sourceId = imageVersion?.storageProfile.source?.id;
      if (!sourceId) return;

      const sourceEntity = await jobState.findEntity(sourceId);

      if (sourceEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            from: sourceEntity,
            _class: RelationshipClass.GENERATED,
            to: imageVersionEntity,
          }),
        );
      } else {
        /**
         * The Azure API returns entity IDs with inconsistent casing. For example,
         * the `sourceId` here is the UUID of an Azure virtual machine. However, in tests,
         * we see that the ID of `azure_vm` entities are returned with all CAPS resource group,
         * while the source ID from imageVersion.storageProfile.source.id is all lowercase
         * resource group.
         *
         * To ensure this mapped relationship can be generated across subscription instances,
         * we explicitly lowercase the `sourceId` property here, as well as the `_key` of azure_vm.
         */
        const lowerCaseSourceId = sourceId.toLowerCase();

        await jobState.addRelationship(
          createMappedRelationship({
            source: imageVersionEntity,
            _class: RelationshipClass.GENERATED,
            target: {
              _type: 'azure_image_source', // I think this is always going to be azure_vm but I'm not sure.
              _key: lowerCaseSourceId,
            },
            targetFilterKeys: [['_key']],
            relationshipDirection: RelationshipDirection.REVERSE,
            skipTargetCreation: false,
          }),
        );
      }
    },
  );
}

export async function fetchVirtualMachines(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ComputeClient(instance.config, logger);

  await client.iterateVirtualMachines(async (vm) => {
    let instanceView:
      | VirtualMachinesInstanceViewResponse
      | undefined = undefined;
    try {
      instanceView = await client.fetchInstanceView(
        vm.name,
        getResourceGroupName(vm.id || ''),
      );
    } catch (err) {
      logger.warn(
        {
          err,
          name: vm.name,
          resourceGroup: getResourceGroupName(vm.id || ''),
        },
        'Warning: unable to fetch virtual machine instance view.',
      );
    }

    const virtualMachineEntity = createVirtualMachineEntity(
      webLinker,
      vm,
      instanceView,
    );
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
    { _type: entities.VIRTUAL_MACHINE._type },
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
          _key: generateRelationshipKey(
            RelationshipClass.USES,
            vmEntity,
            vhdUri,
          ),
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
    { _type: entities.VIRTUAL_MACHINE._type },
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

export async function buildVirtualMachineImageRelationships(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState } = executionContext;
  const relationships: Relationship[] = [];

  await jobState.iterateEntities(
    { _type: entities.VIRTUAL_MACHINE._type },
    async (vmEntity) => {
      const vm = getRawData<VirtualMachine>(vmEntity);
      const imageReference = vm?.storageProfile?.imageReference;
      const imageRefId = imageReference?.id;
      if (!imageRefId) {
        return;
      }
      const imageEntity = await jobState.findEntity(imageRefId);
      if (imageEntity) {
        relationships.push(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            from: vmEntity,
            to: imageEntity,
          }),
        );
      }

      if (imageReference?.id && imageReference.exactVersion) {
        // The presence of an `exactVersion` property indicates this is a gallery image.
        //
        // Example vm.storageProfile.imageReference:
        // imageReference: {
        //   "id": "/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Compute/galleries/testImageGallery/images/test-image-definition",
        //   "exactVersion": "0.0.0"
        // }
        //
        // Example gallery image version "id":
        // "/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Compute/galleries/testImageGallery/images/test-image-definition/versions/0.0.0"
        //
        const galleryImageVersionId =
          imageReference.id + '/versions/' + imageReference.exactVersion;
        const galleryImageVersionEntity = await jobState.findEntity(
          galleryImageVersionId,
        );
        if (galleryImageVersionEntity) {
          relationships.push(
            createDirectRelationship({
              _class: RelationshipClass.USES,
              from: vmEntity,
              to: galleryImageVersionEntity,
            }),
          );
        }
      }
    },
  );

  await jobState.addRelationships(relationships);
}

export async function buildVirtualMachineManagedIdentityRelationships(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = executionContext;

  await jobState.iterateEntities(
    { _type: entities.VIRTUAL_MACHINE._type },
    async (vmEntity) => {
      const vm = getRawData<VirtualMachine>(vmEntity);

      if (
        vm?.identity?.type === 'SystemAssigned' ||
        vm?.identity?.type === 'SystemAssigned, UserAssigned'
      ) {
        if (!vm.identity.principalId) {
          logger.warn(
            {
              vmId: vm.id,
              vmIdentity: vm.identity,
            },
            'Cannot create mapped relationship between virtual machine & system assigned managed identity; principal ID must be defined',
          );
        } else {
          await jobState.addRelationship(
            createMappedRelationship({
              _class: RelationshipClass.ASSIGNED,
              source: vmEntity,
              target: {
                _type: SERVICE_PRINCIPAL_ENTITY_TYPE,
                _key: vm.identity.principalId,
              },
              properties: {
                managedIdentityType: 'SystemAssigned',
              },
            }),
          );
        }
      }

      if (
        vm?.identity?.type === 'UserAssigned' ||
        vm?.identity?.type === 'SystemAssigned, UserAssigned'
      ) {
        if (!vm.identity.userAssignedIdentities) {
          logger.warn(
            {
              vmId: vm.id,
              vmIdentity: vm.identity,
            },
            'Cannot create mapped relationship between virtual machine & user assigned managed identity; userAssignedEntities must be defined',
          );
        } else {
          for (const [azureId, userAssignedIdentity] of Object.entries(
            vm.identity.userAssignedIdentities,
          )) {
            if (!userAssignedIdentity.principalId) {
              logger.warn(
                {
                  vmId: vm.id,
                  vmIdentity: vm.identity,
                  azureId,
                  userAssignedIdentity,
                },
                'Cannot create mapped relationship between virtual machine & user assigned managed identity; principal ID must be defined',
              );
            } else {
              await jobState.addRelationship(
                createMappedRelationship({
                  _class: RelationshipClass.ASSIGNED,
                  source: vmEntity,
                  target: {
                    _type: SERVICE_PRINCIPAL_ENTITY_TYPE,
                    _key: userAssignedIdentity.principalId,
                  },
                  properties: {
                    managedIdentityType: 'UserAssigned',
                    clientId: userAssignedIdentity.clientId,
                    azureId,
                  },
                }),
              );
            }
          }
        }
      }
    },
  );
}

export async function fetchVirtualMachineScaleSets(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ComputeClient(instance.config, logger);

  await client.iterateVirtualMachinesScaleSets(async (vmScaleSets) => {
    const vmScaleSetsEntity = createVMScaleSetsEntity(webLinker, vmScaleSets);
    await jobState.addEntity(vmScaleSetsEntity);
    await createResourceGroupResourceRelationship(
      executionContext,
      vmScaleSetsEntity,
    );
  });
}
export async function buildVMScaleSetsRelationship(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState } = executionContext;
  const relationships: Relationship[] = [];

  await jobState.iterateEntities(
    { _type: entities.VIRTUAL_MACHINE._type },
    async (vmEntity) => {
      const vm = getRawData<VirtualMachine>(vmEntity);
      if (!vm) {
        return;
      }
      let scaleSetId = vm.virtualMachineScaleSet?.id;
      if (!scaleSetId) {
        const vmIdEnd = `/virtualMachines/${(vm as any).instanceId}`;
        if ((vm as any).instanceId && vm.id?.endsWith(vmIdEnd)) {
          scaleSetId = vm.id.substring(0, vm.id.length - vmIdEnd.length);
          //some VMs can be related to the VMss by the id
          //https://learn.microsoft.com/en-us/dotnet/api/microsoft.azure.management.compute.models.virtualmachinescalesetvm?view=azure-dotnet
        } else {
          return;
        }
      }
      const scaleSetEntity = await jobState.findEntity(scaleSetId);
      if (scaleSetEntity) {
        relationships.push(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            from: vmEntity,
            to: scaleSetEntity,
          }),
        );
      }
    },
  );
  await jobState.addRelationships(relationships);
}
export async function buildVMScaleSetsImageRelationship(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState } = executionContext;
  const relationships: Relationship[] = [];

  await jobState.iterateEntities(
    { _type: entities.VIRTUAL_MACHINE_SCALE_SET._type },
    async (vmssEntity) => {
      const vmss = getRawData<VirtualMachineScaleSet>(vmssEntity);
      const imageRefId =
        vmss?.virtualMachineProfile?.storageProfile?.imageReference?.id;
      if (!imageRefId) {
        return;
      }
      const imageEntity = await jobState.findEntity(imageRefId);
      if (imageEntity) {
        relationships.push(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            from: vmssEntity,
            to: imageEntity,
          }),
        );
      }
    },
  );
  await jobState.addRelationships(relationships);
}
export async function buildVMScaleSetsImageVersionRelationship(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState } = executionContext;
  const relationships: Relationship[] = [];

  await jobState.iterateEntities(
    { _type: entities.VIRTUAL_MACHINE_SCALE_SET._type },
    async (vmssEntity) => {
      const vmss = getRawData<VirtualMachineScaleSet>(vmssEntity);
      const imageReference =
        vmss?.virtualMachineProfile?.storageProfile?.imageReference;
      const imageRefId = imageReference?.id;
      if (!imageRefId) {
        return;
      }

      const galleryImageVersionEntity = await jobState.findEntity(imageRefId);
      if (
        galleryImageVersionEntity &&
        galleryImageVersionEntity?._type == entities.SHARED_IMAGE_VERSION._type
      ) {
        relationships.push(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            from: vmssEntity,
            to: galleryImageVersionEntity,
          }),
        );
      }
    },
  );
  await jobState.addRelationships(relationships);
}

export const computeSteps: AzureIntegrationStep[] = [
  {
    id: steps.GALLERIES,
    name: 'Galleries',
    entities: [entities.GALLERY],
    relationships: [relationships.RESOURCE_GROUP_HAS_GALLERY],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchGalleries,
    rolePermissions: ['Microsoft.Compute/galleries/read'],
  },
  {
    id: steps.SHARED_IMAGES,
    name: 'Gallery Shared Images',
    entities: [entities.SHARED_IMAGE],
    relationships: [relationships.IMAGE_GALLERY_CONTAINS_SHARED_IMAGE],
    dependsOn: [STEP_AD_ACCOUNT, steps.GALLERIES],
    executionHandler: fetchGalleryImages,
    rolePermissions: ['Microsoft.Compute/galleries/images/read'],
  },
  {
    id: steps.SHARED_IMAGE_VERSIONS,
    name: 'Gallery Shared Image Versions',
    entities: [entities.SHARED_IMAGE_VERSION],
    relationships: [relationships.SHARED_IMAGE_HAS_VERSION],
    dependsOn: [STEP_AD_ACCOUNT, steps.SHARED_IMAGES],
    executionHandler: fetchGalleryImageVersions,
    rolePermissions: ['Microsoft.Compute/galleries/images/versions/read'],
  },
  {
    id: steps.SHARED_IMAGE_VERSION_SOURCE_RELATIONSHIPS,
    name: 'Gallery Shared Image Version to Source Relationships',
    entities: [],
    relationships: [
      relationships.VIRTUAL_MACHINE_GENERATED_SHARED_IMAGE_VERSION,
    ],
    dependsOn: [steps.SHARED_IMAGE_VERSIONS, steps.COMPUTE_VIRTUAL_MACHINES],
    executionHandler: buildGalleryImageVersionSourceRelationships,
  },
  {
    id: steps.COMPUTE_VIRTUAL_MACHINE_IMAGES,
    name: 'Virtual Machine Disk Images',
    entities: [entities.VIRTUAL_MACHINE_IMAGE],
    relationships: [
      createResourceGroupResourceRelationshipMetadata(
        entities.VIRTUAL_MACHINE_IMAGE._type,
      ),
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchVirtualMachineImages,
    rolePermissions: ['Microsoft.Compute/images/read'],
  },
  {
    id: steps.COMPUTE_VIRTUAL_MACHINE_DISKS,
    name: 'Virtual Machine Disks',
    entities: [entities.DISK],
    relationships: [
      createResourceGroupResourceRelationshipMetadata(entities.DISK._type),
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchVirtualMachineDisks,
    rolePermissions: ['Microsoft.Compute/disks/read'],
  },
  {
    id: steps.COMPUTE_VIRTUAL_MACHINES,
    name: 'Virtual Machines',
    entities: [entities.VIRTUAL_MACHINE],
    relationships: [
      createResourceGroupResourceRelationshipMetadata(
        entities.VIRTUAL_MACHINE._type,
      ),
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchVirtualMachines,
    rolePermissions: ['Microsoft.Compute/virtualMachines/read'],
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
      steps.COMPUTE_VIRTUAL_MACHINES,
      steps.COMPUTE_VIRTUAL_MACHINE_DISKS,
      storageSteps.STORAGE_ACCOUNTS,
    ],
    executionHandler: buildVirtualMachineDiskRelationships,
  },
  {
    id: steps.VIRTUAL_MACHINE_EXTENSIONS,
    name: 'Virtual Machine Extensions',
    entities: [entities.VIRTUAL_MACHINE_EXTENSION],
    relationships: [],
    dependsOn: [STEP_AD_ACCOUNT, steps.COMPUTE_VIRTUAL_MACHINES],
    executionHandler: fetchVirtualMachineExtensions,
    rolePermissions: ['Microsoft.Compute/virtualMachines/extensions/read'],
  },
  {
    id: steps.VIRTUAL_MACHINE_IMAGE_RELATIONSHIPS,
    name: 'Virtual Machine Image and Shared Image Relationships',
    entities: [],
    relationships: [
      relationships.VIRTUAL_MACHINE_USES_IMAGE,
      relationships.VIRTUAL_MACHINE_USES_SHARED_IMAGE,
      relationships.VIRTUAL_MACHINE_USES_SHARED_IMAGE_VERSION,
    ],
    dependsOn: [
      steps.COMPUTE_VIRTUAL_MACHINES,
      steps.COMPUTE_VIRTUAL_MACHINE_IMAGES,
      steps.SHARED_IMAGES,
      steps.SHARED_IMAGE_VERSIONS,
    ],
    executionHandler: buildVirtualMachineImageRelationships,
  },
  {
    id: steps.VIRTUAL_MACHINE_MANAGED_IDENTITY_RELATIONSHIPS,
    name: 'Virtual Machine Managed Identity Relationships',
    entities: [],
    relationships: [relationships.VIRTUAL_MACHINE_USES_MANAGED_IDENTITY],
    dependsOn: [steps.COMPUTE_VIRTUAL_MACHINES],
    executionHandler: buildVirtualMachineManagedIdentityRelationships,
  },
  {
    id: steps.VIRTUAL_MACHINE_SCALE_SETS,
    name: 'Virtual Machine Scale Sets',
    entities: [entities.VIRTUAL_MACHINE_SCALE_SET],
    relationships: [
      createResourceGroupResourceRelationshipMetadata(
        entities.VIRTUAL_MACHINE_SCALE_SET._type,
      ),
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchVirtualMachineScaleSets,
    rolePermissions: ['Microsoft.Compute/virtualMachineScaleSets/read'],
  },
  {
    id: steps.VIRTUAL_MACHINE_SCALE_SETS_RELATIONSHIPS,
    name: 'Virtual Machine Scale Sets Reationships',
    entities: [],
    relationships: [relationships.VIRTUAL_MACHINE_USES_SCALE_SETS],
    dependsOn: [
      steps.VIRTUAL_MACHINE_SCALE_SETS,
      steps.COMPUTE_VIRTUAL_MACHINES,
    ],
    executionHandler: buildVMScaleSetsRelationship,
  },
  {
    id: steps.VM_SCALE_SETS_IMAGE_RELATIONSHIPS,
    name: 'Virtual Scale Sets Image Reationships',
    entities: [],
    relationships: [relationships.VM_SCALE_SETS_USES_SHARED_IMAGE],
    dependsOn: [
      steps.VIRTUAL_MACHINE_SCALE_SETS,
      steps.SHARED_IMAGES,
      steps.COMPUTE_VIRTUAL_MACHINE_IMAGES,
    ],
    executionHandler: buildVMScaleSetsImageRelationship,
  },
  {
    id: steps.VM_SCALE_SETS_IMAGE_VERSION_RELATIONSHIPS,
    name: 'Virtual Scale Sets Image Version Reationships',
    entities: [],
    relationships: [relationships.VM_SCALE_SETS_USES_SHARED_IMAGE_VERSION],
    dependsOn: [
      steps.VIRTUAL_MACHINE_SCALE_SETS,
      steps.SHARED_IMAGE_VERSIONS,
      steps.COMPUTE_VIRTUAL_MACHINE_IMAGES,
    ],
    executionHandler: buildVMScaleSetsImageVersionRelationship,
  },
];
