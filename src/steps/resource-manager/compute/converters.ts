import {
  DataDisk,
  Disk,
  Image,
  OSDisk,
  VirtualMachine,
  VirtualMachineExtension,
} from '@azure/arm-compute/esm/models';
import {
  assignTags,
  convertProperties,
  createIntegrationEntity,
  Entity,
  getTime,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import { resourceGroupName } from '../../../azure/utils';
import {
  DISK_ENTITY_CLASS,
  DISK_ENTITY_TYPE,
  entities,
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
    usesManagedDisks: usesManagedDisks(
      data.storageProfile?.osDisk,
      data.storageProfile?.dataDisks,
    ),
    webLink: webLinker.portalResourceUrl(data.id),
  };

  assignTags(entity, data.tags);

  return entity;
}

function usesManagedDisks(osDisk?: OSDisk, dataDisks?: DataDisk[]) {
  function usesManagedDisk(disk: OSDisk | DataDisk | undefined) {
    return disk?.managedDisk !== undefined;
  }

  return (
    usesManagedDisk(osDisk) &&
    (dataDisks || []).every((d) => usesManagedDisk(d))
  );
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
    encryption: data.encryption?.type,
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

export type VirtualMachineExtensionSharedProperties = Omit<
  VirtualMachineExtension,
  'id' | 'location' | 'provisioningState'
>;

export function createVirtualMachineExtensionEntity(
  data: VirtualMachineExtensionSharedProperties,
) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: getVirtualMachineExtensionKey(data),
        _type: entities.VIRTUAL_MACHINE_EXTENSION._type,
        _class: entities.VIRTUAL_MACHINE_EXTENSION._class,
        name: data.name,
      },
    },
  });
}

export function getVirtualMachineExtensionKey(
  data: VirtualMachineExtensionSharedProperties,
) {
  return `vm-extension:${data.publisher || 'unknown-publisher'}:${data.name!}`;
}

export const testFunctions = {
  usesManagedDisks,
};
