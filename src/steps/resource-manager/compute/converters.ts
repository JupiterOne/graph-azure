import { Disk, Image, VirtualMachine } from '@azure/arm-compute/esm/models';
import {
  assignTags,
  convertProperties,
  createDirectRelationship,
  Entity,
  getTime,
  Relationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import { resourceGroupName } from '../../../azure/utils';
import {
  DISK_ENTITY_CLASS,
  DISK_ENTITY_TYPE,
  VIRTUAL_MACHINE_ENTITY_CLASS,
  VIRTUAL_MACHINE_ENTITY_TYPE,
  VIRTUAL_MACHINE_IMAGE_ENTITY_CLASS,
  VIRTUAL_MACHINE_IMAGE_ENTITY_TYPE,
} from './constants';

export function createVirtualMachineEntity(
  webLinker: AzureWebLinker,
  data: VirtualMachine,
): Entity {
  const osProperties = {};
  if (data.storageProfile) {
    Object.assign(osProperties, {
      platform: data.storageProfile.osDisk?.osType?.toLowerCase(),
      osName: data.storageProfile.imageReference?.offer,
      osVersion: data.storageProfile.imageReference?.exactVersion,
    });
  }
  if (data.osProfile) {
    Object.assign(osProperties, {
      adminUser: data.osProfile.adminUsername,
      disablePasswordAuthentication:
        data.osProfile.linuxConfiguration?.disablePasswordAuthentication,
      enableAutomaticUpdates:
        data.osProfile.windowsConfiguration?.enableAutomaticUpdates,
      timeZone: data.osProfile.windowsConfiguration?.timeZone,
    });
  }
  const entity = {
    ...convertProperties(data),
    ...osProperties,
    _key: data.id as string,
    _type: VIRTUAL_MACHINE_ENTITY_TYPE,
    _class: VIRTUAL_MACHINE_ENTITY_CLASS,
    _rawData: [{ name: 'default', rawData: data }],
    displayName: data.name,
    vmId: data.vmId,
    type: data.type,
    region: data.location,
    resourceGroup: resourceGroupName(data.id),
    state: data.provisioningState,
    vmSize: data.hardwareProfile && data.hardwareProfile.vmSize,
    webLink: webLinker.portalResourceUrl(data.id),
  };

  assignTags(entity, data.tags);

  return entity;
}

export function createDiskEntity(
  webLinker: AzureWebLinker,
  data: Disk,
): Entity {
  const entity = {
    ...convertProperties(data),
    _key: data.id as string,
    _type: DISK_ENTITY_TYPE,
    _class: DISK_ENTITY_CLASS,
    _rawData: [{ name: 'default', rawData: data }],
    displayName: data.name,
    region: data.location,
    resourceGroup: resourceGroupName(data.id),
    createdOn: getTime(data.timeCreated),
    webLink: webLinker.portalResourceUrl(data.id),
    encrypted: !!data.encryption?.type,
    state: data.diskState?.toLowerCase(),
    attached: data.diskState === 'Attached',
  };

  assignTags(entity, data.tags);

  return entity;
}

export function createImageEntity(
  webLinker: AzureWebLinker,
  data: Image,
): Entity {
  const entity = {
    ...convertProperties(data),
    _key: data.id as string,
    _type: VIRTUAL_MACHINE_IMAGE_ENTITY_TYPE,
    _class: VIRTUAL_MACHINE_IMAGE_ENTITY_CLASS,
    _rawData: [{ name: 'default', rawData: data }],
    displayName: data.name,
    region: data.location,
    resourceGroup: resourceGroupName(data.id),
    webLink: webLinker.portalResourceUrl(data.id),
  };

  assignTags(entity, data.tags);

  return entity;
}

export function createVirtualMachineDiskRelationships(
  vm: VirtualMachine,
): Relationship[] {
  const relationships: Relationship[] = [];

  if (vm.storageProfile) {
    if (vm.storageProfile.osDisk?.managedDisk?.id) {
      relationships.push(
        createDirectRelationship({
          _class: RelationshipClass.USES,
          fromKey: vm.id as string,
          fromType: VIRTUAL_MACHINE_ENTITY_TYPE,
          toKey: vm.storageProfile.osDisk.managedDisk.id,
          toType: DISK_ENTITY_TYPE,
          properties: {
            osDisk: true,
          },
        }),
      );
    }

    for (const disk of vm.storageProfile.dataDisks || []) {
      if (disk.managedDisk?.id) {
        relationships.push(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            fromKey: vm.id as string,
            fromType: VIRTUAL_MACHINE_ENTITY_TYPE,
            toKey: disk.managedDisk.id,
            toType: DISK_ENTITY_TYPE,
            properties: {
              dataDisk: true,
            },
          }),
        );
      }
    }
  }

  return relationships;
}
