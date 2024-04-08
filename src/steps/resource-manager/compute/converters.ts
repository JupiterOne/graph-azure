import {
  DataDisk,
  Disk,
  Gallery,
  GalleryImage,
  GalleryImageVersion,
  Image,
  InstanceViewStatus,
  OSDisk,
  VirtualMachine,
  VirtualMachineExtension,
  VirtualMachineScaleSet,
  VirtualMachinesInstanceViewResponse,
} from '@azure/arm-compute/esm/models';
import {
  assignTags,
  convertProperties,
  createIntegrationEntity,
  Entity,
  getTime,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import { resourceGroupName } from '../../../azure/utils';
import { entities } from './constants';

function mapVirtualMachineStatus(status?: InstanceViewStatus) {
  if (status?.displayStatus === 'VM running') {
    return 'running';
  } else if (status?.displayStatus === 'VM deallocated') {
    return 'stopped';
  } else {
    return;
  }
}

export function createVirtualMachineEntity(
  asgs: any,
  webLinker: AzureWebLinker,
  data: VirtualMachine,
  instanceView?: VirtualMachinesInstanceViewResponse,
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

  let status: string | undefined = undefined;
  if (instanceView) {
    const vmStatus = instanceView.statuses?.find(
      (status) =>
        status.code?.includes('PowerState') && status.level === 'Info',
    );
    status = mapVirtualMachineStatus(vmStatus);
  }

  const entity = {
    ...convertProperties(data),
    ...osProperties,
    /**
     * Explicitly lowercasing the `_key` property due to inconsistent casing.
     *
     * See the SHARED_IMAGE_VERSION_SOURCE_RELATIONSHIPS step for more details.
     */
    _key: data.id!.toLowerCase(),
    _type: entities.VIRTUAL_MACHINE._type,
    _class: entities.VIRTUAL_MACHINE._class,
    _rawData: [{ name: 'default', rawData: data }],
    displayName: data.name,
    vmId: data.vmId,
    type: data.type,
    region: data.location,
    resourceGroup: resourceGroupName(data.id),
    provisioningState: data.provisioningState,
    state: status,
    active: status ? status === 'running' : undefined,
    vmSize: data.hardwareProfile && data.hardwareProfile.vmSize,
    usesManagedDisks: usesManagedDisks(
      data.storageProfile?.osDisk,
      data.storageProfile?.dataDisks,
    ),
    hostname: null,
    webLink: webLinker.portalResourceUrl(data.id),
    applicationSecurityGroup: asgs
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
    _type: entities.DISK._type,
    _class: entities.DISK._class,
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
    _type: entities.VIRTUAL_MACHINE_IMAGE._type,
    _class: entities.VIRTUAL_MACHINE_IMAGE._class,
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
  'location' | 'provisioningState'
>;

export function createVirtualMachineExtensionEntity(
  data: VirtualMachineExtensionSharedProperties,
) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id || getVirtualMachineExtensionKey(data),
        _type: entities.VIRTUAL_MACHINE_EXTENSION._type,
        _class: entities.VIRTUAL_MACHINE_EXTENSION._class,
        name: data.name,
        publisher: data.publisher,
        extType: data.virtualMachineExtensionType,
        ...convertProperties(data.settings, { prefix: 'settings' }),
      },
    },
  });
}

export function getVirtualMachineExtensionKey(
  data: VirtualMachineExtensionSharedProperties,
) {
  return `vm-extension:${data.publisher || 'unknown-publisher'}:${data.name!}`;
}

export function createGalleryEntity(webLinker: AzureWebLinker, data: Gallery) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id!,
        _type: entities.GALLERY._type,
        _class: entities.GALLERY._class,
        displayName: data.name,
        description: data.description,
        region: data.location,
        location: data.location,
        state: data.provisioningState,
        type: data.type,
        classification: null,
        encrypted: false,
        resourceGroup: resourceGroupName(data.id),
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}

export function createSharedImage(
  webLinker: AzureWebLinker,
  data: GalleryImage,
) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id!,
        _type: entities.SHARED_IMAGE._type,
        _class: entities.SHARED_IMAGE._class,
        displayName: data.name,
        description: data.description,
        region: data.location,
        endOfLifeDate: parseTimePropertyValue(data.endOfLifeDate),
        osType: data.osType,
        osState: data.osState,
        eula: data.eula,
        state: data.provisioningState,
        type: data.type,
        resourceGroup: resourceGroupName(data.id),
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}

export function createSharedImageVersion(
  webLinker: AzureWebLinker,
  data: GalleryImageVersion,
) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id!,
        _type: entities.SHARED_IMAGE_VERSION._type,
        _class: entities.SHARED_IMAGE_VERSION._class,
        id: data.id,
        location: data.location,
        name: data.name,
        type: data.type,
        publishedDate: parseTimePropertyValue(
          data.publishingProfile?.publishedDate,
        ),
        createdOn: parseTimePropertyValue(
          data.publishingProfile?.publishedDate,
        ),
        provisioningState: data.provisioningState,
        sourceId: data.storageProfile.source?.id,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}
export function createVMScaleSetsEntity(
  webLinker: AzureWebLinker,
  data: VirtualMachineScaleSet,
) {
  const entity = createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id!,
        _type: entities.VIRTUAL_MACHINE_SCALE_SET._type,
        _class: entities.VIRTUAL_MACHINE_SCALE_SET._class,
        id: data.id,
        location: data.location,
        name: data.name,
        type: data.type,
        provisioningState: data.provisioningState,
        doNotRunExtensionsOnOverprovisionedVMs:
          data.doNotRunExtensionsOnOverprovisionedVMs,
        automaticRepairsPolicy: data.automaticRepairsPolicy?.enabled,
        ultraSSDEnabled: data.additionalCapabilities?.ultraSSDEnabled,
        overprovision: data.overprovision,
        platformFaultDomainCount: data.platformFaultDomainCount,
        sku: data.sku?.name,
        instanceCount: data.sku?.capacity,
        automaticOSUpgrade:
          data.upgradePolicy?.automaticOSUpgradePolicy
            ?.enableAutomaticOSUpgrade,
        automaticOSRollback:
          data.upgradePolicy?.automaticOSUpgradePolicy
            ?.disableAutomaticRollback,
        upgradeMode: data.upgradePolicy?.mode,
        maxBatchInstancePercent:
          data.upgradePolicy?.rollingUpgradePolicy?.maxBatchInstancePercent,
        maxUnhealthyInstancePercent:
          data.upgradePolicy?.rollingUpgradePolicy?.maxUnhealthyInstancePercent,
        maxUnhealthyUpgradedInstancePercent:
          data.upgradePolicy?.rollingUpgradePolicy
            ?.maxUnhealthyUpgradedInstancePercent,
        pauseTimeBetweenBatches:
          data.upgradePolicy?.rollingUpgradePolicy?.pauseTimeBetweenBatches,
        proximityPlacementGroupId: data.proximityPlacementGroup?.id,
        scaleInRules: data.scaleInPolicy?.rules?.map((rule) => rule.toString()),
        singlePlacementGroup: data.singlePlacementGroup,
        zoneBalance: data.zoneBalance,
        zones: data.zones,
        //virtualMachineProfile

        'virtualMachineProfile.billingProfile.maxPrice':
          data.virtualMachineProfile?.billingProfile?.maxPrice,
        'virtualMachineProfile.diagnosticsProfile.bootDiagnostics.enabled':
          data.virtualMachineProfile?.diagnosticsProfile?.bootDiagnostics
            ?.enabled,
        'virtualMachineProfile.diagnosticsProfile.bootDiagnostics.storageUri':
          data.virtualMachineProfile?.diagnosticsProfile?.bootDiagnostics
            ?.storageUri,
        'virtualMachineProfile.evictionPolicy':
          data.virtualMachineProfile?.evictionPolicy,
        'virtualMachineProfile.extensionProfile.extensions':
          data.virtualMachineProfile?.extensionProfile?.extensions
            ?.map((extension) => extension.name)
            .filter((e) => !!e) as string[],
        'virtualMachineProfile.licenseType':
          data.virtualMachineProfile?.licenseType,
        'virtualMachineProfile.networkProfile.healthProbe.id':
          data.virtualMachineProfile?.networkProfile?.healthProbe?.id,
        'virtualMachineProfile.networkProfile.networkInterfaceConfigurations':
          data.virtualMachineProfile?.networkProfile?.networkInterfaceConfigurations?.map(
            (config) => config.name,
          ),
        'virtualMachineProfile.osProfile.linuxConfiguration.disablePasswordAuthentication':
          data.virtualMachineProfile?.osProfile?.linuxConfiguration
            ?.disablePasswordAuthentication,
        'virtualMachineProfile.osProfile.linuxConfiguration.provisionVMAgent':
          data.virtualMachineProfile?.osProfile?.linuxConfiguration
            ?.provisionVMAgent,
        'virtualMachineProfile.osProfile.linuxConfiguration.ssh.publicKeys':
          data.virtualMachineProfile?.osProfile?.linuxConfiguration?.ssh?.publicKeys
            ?.map((key) => key.path)
            .filter((e) => !!e) as string[],
        'virtualMachineProfile.osProfile.adminUsername':
          data.virtualMachineProfile?.osProfile?.adminUsername,
        'virtualMachineProfile.osProfile.computerNamePrefix':
          data.virtualMachineProfile?.osProfile?.computerNamePrefix,
        'virtualMachineProfile.osProfile.windowsConfiguration.enableAutomaticUpdates':
          data.virtualMachineProfile?.osProfile?.windowsConfiguration
            ?.enableAutomaticUpdates,
        'virtualMachineProfile.osProfile.windowsConfiguration.provisionVMAgent':
          data.virtualMachineProfile?.osProfile?.windowsConfiguration
            ?.provisionVMAgent,
        'virtualMachineProfile.priority':
          data.virtualMachineProfile?.priority?.toString(),
        'virtualMachineProfile.scheduledEventsProfile.terminateNotificationProfile.enable':
          data.virtualMachineProfile?.scheduledEventsProfile
            ?.terminateNotificationProfile?.enable,
        'virtualMachineProfile.scheduledEventsProfile.terminateNotificationProfile.notBeforeTimeout':
          data.virtualMachineProfile?.scheduledEventsProfile
            ?.terminateNotificationProfile?.notBeforeTimeout,
        'virtualMachineProfile.storageProfile.dataDisks':
          data.virtualMachineProfile?.storageProfile?.dataDisks
            ?.map((disk) => disk.name)
            .filter((e) => !!e) as string[],
        'virtualMachineProfile.storageProfile.imageReference.id':
          data.virtualMachineProfile?.storageProfile?.imageReference?.id,
        'virtualMachineProfile.storageProfile.imageReference.offer':
          data.virtualMachineProfile?.storageProfile?.imageReference?.offer,
        'virtualMachineProfile.storageProfile.imageReference.publisher':
          data.virtualMachineProfile?.storageProfile?.imageReference?.publisher,
        'virtualMachineProfile.storageProfile.imageReference.exactVersion':
          data.virtualMachineProfile?.storageProfile?.imageReference
            ?.exactVersion,
        'virtualMachineProfile.storageProfile.imageReference.sku':
          data.virtualMachineProfile?.storageProfile?.imageReference?.sku,
        'virtualMachineProfile.storageProfile.imageReference.version':
          data.virtualMachineProfile?.storageProfile?.imageReference?.version,

        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
  assignTags(entity, data.tags);
  return entity;
}
export const testFunctions = {
  usesManagedDisks,
};
export function makeResourceGroupUppercase(id: string) {
  const splittedId = id.split('/');
  const newId = splittedId.reduce((prev, current, index) => {
    if (index == 4) {
      return prev + '/' + current.toUpperCase();
    }
    return (prev ?? '') + '/' + current;
  });
  return newId;
}
