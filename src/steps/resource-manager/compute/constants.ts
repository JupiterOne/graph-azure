import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { SERVICE_PRINCIPAL_ENTITY_TYPE } from '../../active-directory';

import { entities as storageEntities } from '../storage/constants';
import { createResourceGroupResourceRelationshipMetadata } from '../utils/createResourceGroupResourceRelationship';

// Step IDs
export const STEP_RM_COMPUTE_VIRTUAL_MACHINE_IMAGES =
  'rm-compute-virtual-machine-images';
export const STEP_RM_COMPUTE_VIRTUAL_MACHINE_DISKS =
  'rm-compute-virutal-machine-disks';
export const STEP_RM_COMPUTE_VIRTUAL_MACHINES = 'rm-compute-virtual-machines';

export const steps = {
  GALLERIES: 'rm-compute-galleries',
  SHARED_IMAGES: 'rm-compute-shared-images',
  SHARED_IMAGE_VERSIONS: 'rm-compute-shared-image-versions',
  VIRTUAL_MACHINE_EXTENSIONS: 'rm-compute-virtual-machine-extensions',
  VIRTUAL_MACHINE_DISK_RELATIONSHIPS:
    'rm-compute-virtual-machine-disk-relationships',
  VIRTUAL_MACHINE_IMAGE_RELATIONSHIPS:
    'rm-compute-virtual-machine-image-relationships',
  VIRTUAL_MACHINE_MANAGED_IDENTITY_RELATIONSHIPS:
    'rm-compute-virtual-machine-managed-identity-relationships',
};

// Graph object
export const VIRTUAL_MACHINE_ENTITY_TYPE = 'azure_vm';
export const VIRTUAL_MACHINE_ENTITY_CLASS = ['Host'];

export const VIRTUAL_MACHINE_IMAGE_ENTITY_TYPE = 'azure_image';
export const VIRTUAL_MACHINE_IMAGE_ENTITY_CLASS = ['Image'];

export const DISK_ENTITY_TYPE = 'azure_managed_disk';
export const DISK_ENTITY_CLASS = ['DataStore', 'Disk'];

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
};

export const VIRTUAL_MACHINE_DISK_RELATIONSHIP_CLASS = RelationshipClass.USES;
export const VIRTUAL_MACHINE_DISK_RELATIONSHIP_TYPE = generateRelationshipType(
  VIRTUAL_MACHINE_DISK_RELATIONSHIP_CLASS,
  VIRTUAL_MACHINE_ENTITY_TYPE,
  DISK_ENTITY_TYPE,
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
    sourceType: VIRTUAL_MACHINE_ENTITY_TYPE,
    _class: RelationshipClass.USES,
    targetType: entities.VIRTUAL_MACHINE_EXTENSION._type,
  },
  VIRTUAL_MACHINE_USES_IMAGE: {
    _type: 'azure_vm_uses_image',
    sourceType: VIRTUAL_MACHINE_ENTITY_TYPE,
    _class: RelationshipClass.USES,
    targetType: VIRTUAL_MACHINE_IMAGE_ENTITY_TYPE,
  },
  VIRTUAL_MACHINE_USES_SHARED_IMAGE: {
    _type: 'azure_vm_uses_shared_image',
    sourceType: VIRTUAL_MACHINE_ENTITY_TYPE,
    _class: RelationshipClass.USES,
    targetType: entities.SHARED_IMAGE._type,
  },
  VIRTUAL_MACHINE_USES_SHARED_IMAGE_VERSION: {
    _type: 'azure_vm_uses_shared_image_version',
    sourceType: VIRTUAL_MACHINE_ENTITY_TYPE,
    _class: RelationshipClass.USES,
    targetType: entities.SHARED_IMAGE_VERSION._type,
  },
  VIRTUAL_MACHINE_USES_UNMANAGED_DISK: {
    _type: 'azure_vm_uses_storage_account',
    sourceType: VIRTUAL_MACHINE_ENTITY_TYPE,
    _class: RelationshipClass.USES,
    targetType: storageEntities.STORAGE_ACCOUNT._type,
  },
  VIRTUAL_MACHINE_USES_MANAGED_DISK: {
    _type: VIRTUAL_MACHINE_DISK_RELATIONSHIP_TYPE,
    sourceType: VIRTUAL_MACHINE_ENTITY_TYPE,
    _class: VIRTUAL_MACHINE_DISK_RELATIONSHIP_CLASS,
    targetType: DISK_ENTITY_TYPE,
  },
  VIRTUAL_MACHINE_USES_MANAGED_IDENTITY: {
    _type: 'azure_vm_uses_managed_identity',
    sourceType: VIRTUAL_MACHINE_ENTITY_TYPE,
    _class: RelationshipClass.USES,
    targetType: SERVICE_PRINCIPAL_ENTITY_TYPE,
  },
};
