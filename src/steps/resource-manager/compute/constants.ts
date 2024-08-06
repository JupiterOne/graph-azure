import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { entities as storageEntities } from '../storage/constants';
import { createResourceGroupResourceRelationshipMetadata } from '../utils/createResourceGroupResourceRelationship';
import { ANY_RESOURCE } from '../constants';
import { ADEntities } from '../../active-directory/constants';

// Step IDs
export const steps = {
  GALLERIES: 'rm-compute-galleries',
  SHARED_IMAGES: 'rm-compute-shared-images',
  SHARED_IMAGE_VERSIONS: 'rm-compute-shared-image-versions',
  SHARED_IMAGE_VERSION_SOURCE_RELATIONSHIPS:
    'rm-compute-shared-image-version-source-relationships',
  VIRTUAL_MACHINE_EXTENSIONS: 'rm-compute-virtual-machine-extensions',
  VIRTUAL_MACHINE_DISK_RELATIONSHIPS:
    'rm-compute-virtual-machine-disk-relationships',
  VIRTUAL_MACHINE_IMAGE_RELATIONSHIPS:
    'rm-compute-virtual-machine-image-relationships',
  VIRTUAL_MACHINE_MANAGED_IDENTITY_RELATIONSHIPS:
    'rm-compute-virtual-machine-managed-identity-relationships',
  VIRTUAL_MACHINE_SCALE_SETS: 'rm-compute-virtual-machines-scale-sets',
  COMPUTE_VIRTUAL_MACHINE_IMAGES: 'rm-compute-virtual-machine-images',
  COMPUTE_VIRTUAL_MACHINE_DISKS: 'rm-compute-virutal-machine-disks',
  COMPUTE_VIRTUAL_MACHINES: 'rm-compute-virtual-machines',
  VIRTUAL_MACHINE_SCALE_SETS_RELATIONSHIPS:
    'rm-virtual-machines-scale-sets-relationships',
  VM_SCALE_SETS_IMAGE_RELATIONSHIPS:
    'rm-virtual-machines-scale-sets-image-relationships',
};

// Graph object

export const entities = {
  GALLERY: {
    _type: 'azure_gallery',
    _class: ['Repository'],
    resourceName: '[RM] Gallery',
  },
  SHARED_IMAGE: {
    _type: 'azure_shared_image',
    _class: ['Image'],
    resourceName: '[RM] Shared Image',
  },
  SHARED_IMAGE_VERSION: {
    _type: 'azure_shared_image_version',
    _class: ['Image'],
    resourceName: '[RM] Shared Image Version',
  },
  VIRTUAL_MACHINE_EXTENSION: {
    _type: 'azure_vm_extension',
    _class: ['Application'],
    resourceName: '[RM] Virtual Machine Extension',
  },
  VIRTUAL_MACHINE_IMAGE: {
    resourceName: '[RM] Image',
    _type: 'azure_image',
    _class: ['Image'],
  },
  DISK: {
    resourceName: '[RM] Azure Managed Disk',
    _type: 'azure_managed_disk',
    _class: ['DataStore', 'Disk'],
    disableClassMatch: true,
  },
  VIRTUAL_MACHINE: {
    resourceName: '[RM] Virtual Machine',
    _type: 'azure_vm',
    _class: ['Host'],
  },
  VIRTUAL_MACHINE_SCALE_SET: {
    resourceName: '[RM] Virtual Machine Scale Set',
    _type: 'azure_vm_scale_set',
    _class: ['Deployment', 'Group'],
  },
};

export const VIRTUAL_MACHINE_DISK_RELATIONSHIP_CLASS = RelationshipClass.USES;
export const VIRTUAL_MACHINE_DISK_RELATIONSHIP_TYPE = generateRelationshipType(
  VIRTUAL_MACHINE_DISK_RELATIONSHIP_CLASS,
  entities.VIRTUAL_MACHINE._type,
  entities.DISK._type,
);

export const relationships = {
  RESOURCE_GROUP_HAS_GALLERY: createResourceGroupResourceRelationshipMetadata(
    entities.GALLERY._type,
  ),
  IMAGE_GALLERY_CONTAINS_SHARED_IMAGE: {
    _type: 'azure_gallery_contains_shared_image',
    sourceType: entities.GALLERY._type,
    _class: RelationshipClass.CONTAINS,
    targetType: entities.SHARED_IMAGE._type,
  },
  SHARED_IMAGE_HAS_VERSION: {
    _type: 'azure_shared_image_has_version',
    sourceType: entities.SHARED_IMAGE._type,
    _class: RelationshipClass.HAS,
    targetType: entities.SHARED_IMAGE_VERSION._type,
  },
  VIRTUAL_MACHINE_USES_EXTENSION: {
    _type: 'azure_vm_uses_extension',
    sourceType: entities.VIRTUAL_MACHINE._type,
    _class: RelationshipClass.USES,
    targetType: entities.VIRTUAL_MACHINE_EXTENSION._type,
  },
  VIRTUAL_MACHINE_USES_IMAGE: {
    _type: 'azure_vm_uses_image',
    sourceType: entities.VIRTUAL_MACHINE._type,
    _class: RelationshipClass.USES,
    targetType: entities.VIRTUAL_MACHINE_IMAGE._type,
  },
  VIRTUAL_MACHINE_USES_SHARED_IMAGE: {
    _type: 'azure_vm_uses_shared_image',
    sourceType: entities.VIRTUAL_MACHINE._type,
    _class: RelationshipClass.USES,
    targetType: entities.SHARED_IMAGE._type,
  },
  VIRTUAL_MACHINE_USES_SHARED_IMAGE_VERSION: {
    _type: 'azure_vm_uses_shared_image_version',
    sourceType: entities.VIRTUAL_MACHINE._type,
    _class: RelationshipClass.USES,
    targetType: entities.SHARED_IMAGE_VERSION._type,
  },
  VIRTUAL_MACHINE_GENERATED_SHARED_IMAGE_VERSION: {
    _type: 'azure_vm_generated_shared_image_version',
    sourceType: entities.VIRTUAL_MACHINE._type,
    _class: RelationshipClass.GENERATED,
    targetType: entities.SHARED_IMAGE_VERSION._type,
  },
  VIRTUAL_MACHINE_USES_UNMANAGED_DISK: {
    _type: 'azure_vm_uses_storage_account',
    sourceType: entities.VIRTUAL_MACHINE._type,
    _class: RelationshipClass.USES,
    targetType: storageEntities.STORAGE_ACCOUNT._type,
  },
  VIRTUAL_MACHINE_USES_MANAGED_DISK: {
    _type: VIRTUAL_MACHINE_DISK_RELATIONSHIP_TYPE,
    sourceType: entities.VIRTUAL_MACHINE._type,
    _class: VIRTUAL_MACHINE_DISK_RELATIONSHIP_CLASS,
    targetType: entities.DISK._type,
  },
  VIRTUAL_MACHINE_USES_MANAGED_IDENTITY: {
    _type: 'azure_vm_uses_managed_identity',
    sourceType: entities.VIRTUAL_MACHINE._type,
    _class: RelationshipClass.USES,
    targetType: ADEntities.SERVICE_PRINCIPAL._type,
  },
  VIRTUAL_MACHINE_USES_SCALE_SETS: {
    _type: 'azure_vm_uses_scale_set',
    sourceType: entities.VIRTUAL_MACHINE._type,
    _class: RelationshipClass.USES,
    targetType: entities.VIRTUAL_MACHINE_SCALE_SET._type,
  },
  VM_SCALE_SETS_USES_SHARED_IMAGE_VERSION: {
    _type: 'azure_vm_scale_set_uses_shared_image_version',
    sourceType: entities.VIRTUAL_MACHINE_SCALE_SET._type,
    _class: RelationshipClass.USES,
    targetType: entities.SHARED_IMAGE._type,
  },
  VM_SCALE_SETS_USES_SHARED_IMAGE: {
    _type: 'azure_vm_scale_set_uses_shared_image',
    sourceType: entities.VIRTUAL_MACHINE_SCALE_SET._type,
    _class: RelationshipClass.USES,
    targetType: entities.SHARED_IMAGE._type,
  },
  RESOURCE_GENERATED_IMAGE_SOURCE: {
    _type: 'mapping_source_generated_azure_image_source',
    sourceType: ANY_RESOURCE,
    _class: RelationshipClass.GENERATED,
    targetType: entities.SHARED_IMAGE_VERSION._type,
  },
  VM_USES_EXTENSIONS: {
    _type: 'azure_vm_uses_extension',
    sourceType: entities.VIRTUAL_MACHINE._type,
    _class: RelationshipClass.USES,
    targetType: entities.VIRTUAL_MACHINE_EXTENSION._type,
  },
};
