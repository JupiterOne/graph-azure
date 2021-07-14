import { Disk, VirtualMachine } from '@azure/arm-compute/esm/models';
import { StorageAccount } from '@azure/arm-storage/esm/models';
import { getRawData, Relationship } from '@jupiterone/integration-sdk-core';
import {
  buildGalleryImageVersionSourceRelationships,
  buildVirtualMachineDiskRelationships,
  buildVirtualMachineImageRelationships,
  buildVirtualMachineManagedIdentityRelationships,
  fetchGalleries,
  fetchGalleryImages,
  fetchGalleryImageVersions,
  fetchVirtualMachineExtensions,
  fetchVirtualMachineImages,
  fetchVirtualMachines,
} from '.';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { filterGraphObjects } from '../../../../test/helpers/filterGraphObjects';
import {
  getMockAccountEntity,
  getMockResourceGroupEntity,
} from '../../../../test/helpers/getMockEntity';
import {
  getMatchRequestsBy,
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { configFromEnv } from '../../../../test/integrationInstanceConfig';
import { createAzureWebLinker } from '../../../azure';
import { IntegrationConfig } from '../../../types';
import {
  ACCOUNT_ENTITY_TYPE,
  fetchServicePrincipals,
  SERVICE_PRINCIPAL_ENTITY_TYPE,
} from '../../active-directory';
import { createStorageAccountEntity } from '../storage/converters';
import {
  entities,
  relationships,
  VIRTUAL_MACHINE_ENTITY_CLASS,
  VIRTUAL_MACHINE_ENTITY_TYPE,
  VIRTUAL_MACHINE_IMAGE_ENTITY_TYPE,
} from './constants';
import { createDiskEntity, createVirtualMachineEntity } from './converters';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

describe('rm-compute-galleries', () => {
  function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);
    const resourceGroupEntity = getMockResourceGroupEntity(
      'j1dev',
      '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev',
    );

    return { accountEntity, resourceGroupEntity };
  }

  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-compute-galleries',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const { accountEntity, resourceGroupEntity } = getSetupEntities(
      configFromEnv,
    );
    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [resourceGroupEntity],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchGalleries(context);

    const galleryEntities = context.jobState.collectedEntities;

    expect(galleryEntities.length).toBeGreaterThan(0);
    expect(galleryEntities).toMatchGraphObjectSchema({
      _class: entities.GALLERY._class,
    });

    expect(context.jobState.collectedRelationships.length).toBe(1);
    expect(
      context.jobState.collectedRelationships,
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: {
            const: relationships.RESOURCE_GROUP_HAS_GALLERY._type,
          },
        },
      },
    });
  });
});

describe('rm-compute-shared-images', () => {
  async function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);
    const context = createMockAzureStepExecutionContext({
      instanceConfig: config,
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });
    await fetchGalleries(context);
    const j1devGalleryEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === entities.GALLERY._type,
    );
    expect(j1devGalleryEntities).toHaveLength(1);

    return { accountEntity, galleryEntity: j1devGalleryEntities[0] };
  }

  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-compute-shared-images',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const { accountEntity, galleryEntity } = await getSetupEntities(
      configFromEnv,
    );
    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [galleryEntity],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });
    await fetchGalleryImages(context);
    const sharedImageEntities = context.jobState.collectedEntities;
    expect(sharedImageEntities.length).toBeGreaterThan(0);
    expect(sharedImageEntities).toMatchGraphObjectSchema({
      _class: entities.SHARED_IMAGE_VERSION._class,
    });

    expect(context.jobState.collectedRelationships.length).toBe(1);
    expect(
      context.jobState.collectedRelationships,
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: {
            const: relationships.IMAGE_GALLERY_CONTAINS_SHARED_IMAGE._type,
          },
        },
      },
    });
  });
});

describe('rm-compute-shared-image-versions', () => {
  async function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);
    const context = createMockAzureStepExecutionContext({
      instanceConfig: config,
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });
    await fetchGalleries(context);
    const galleryEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === entities.GALLERY._type,
    );
    expect(galleryEntities.length).toBeGreaterThan(0);

    await fetchGalleryImages(context);
    const galleryImageEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === entities.SHARED_IMAGE._type,
    );
    expect(galleryImageEntities.length).toBeGreaterThan(0);

    return { accountEntity, galleryImageEntity: galleryImageEntities[0] };
  }

  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-compute-shared-image-versions',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const { accountEntity, galleryImageEntity } = await getSetupEntities(
      configFromEnv,
    );
    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [galleryImageEntity],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchGalleryImageVersions(context);

    const imageVersionEntities = context.jobState.collectedEntities;

    expect(imageVersionEntities.length).toBeGreaterThan(0);
    expect(imageVersionEntities).toMatchGraphObjectSchema({
      _class: entities.SHARED_IMAGE_VERSION._class,
    });

    const imageVersionRelationships = context.jobState.collectedRelationships;

    expect(imageVersionRelationships.length).toBe(1);
    expect(imageVersionRelationships).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: {
            const: relationships.SHARED_IMAGE_HAS_VERSION._type,
          },
        },
      },
    });
  });
});

describe('rm-compute-virtual-machines', () => {
  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-compute-virtual-machines',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      setData: {
        [ACCOUNT_ENTITY_TYPE]: getMockAccountEntity(configFromEnv),
      },
    });

    await fetchVirtualMachines(context);

    const virtualMachineEntities = context.jobState.collectedEntities;

    expect(virtualMachineEntities.length).toBeGreaterThan(0);
    expect(virtualMachineEntities).toMatchGraphObjectSchema({
      _class: VIRTUAL_MACHINE_ENTITY_CLASS,
    });

    expect(context.jobState.collectedRelationships.length).toBe(0);
  });
});

describe('rm-compute-virtual-machine-disk-relationships', () => {
  const webLinker = createAzureWebLinker('www.default-domain.com');

  describe('managed disk', () => {
    describe('os disk', () => {
      const virtualMachine: VirtualMachine = {
        id:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/J1DEV/providers/Microsoft.Compute/virtualMachines/j1dev',
        location: 'eastus',
        storageProfile: {
          osDisk: {
            createOption: 'FromImage',
            managedDisk: {
              id:
                '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Compute/disks/j1dev_OsDisk_1_7f47e29fbfbe4fec8432d07d3d03fa34',
            },
          },
        },
      };

      const vmEntity = createVirtualMachineEntity(webLinker, virtualMachine);

      test('should create relationship if disk in job state', async () => {
        const disk: Disk = {
          id:
            '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/J1DEV/providers/Microsoft.Compute/disks/j1dev_OsDisk_1_7f47e29fbfbe4fec8432d07d3d03fa34',
          location: 'eastus',
          creationData: {
            createOption: 'FromImage',
          },
        };

        const diskEntity = createDiskEntity(webLinker, disk);

        const context = createMockAzureStepExecutionContext({
          instanceConfig: configFromEnv,
          entities: [diskEntity, vmEntity],
        });

        await buildVirtualMachineDiskRelationships(context);

        expect(context.jobState.collectedEntities.length).toBe(0);

        expect(context.jobState.collectedRelationships.length).toBe(1);
        expect(
          context.jobState.collectedRelationships,
        ).toMatchDirectRelationshipSchema({
          schema: {
            properties: {
              _type: {
                const: relationships.VIRTUAL_MACHINE_USES_MANAGED_DISK._type,
              },
              osDisk: { const: true },
            },
          },
        });
        expect(
          context.jobState.collectedRelationships[0]._toEntityKey,
        ).not.toEqual(virtualMachine.storageProfile?.osDisk?.managedDisk?.id);
      });

      test('should log if disk is not in job state', async () => {
        const context = createMockAzureStepExecutionContext({
          instanceConfig: configFromEnv,
          entities: [vmEntity],
        });

        const loggerWarnSpy = jest.spyOn(context.logger, 'warn');

        await buildVirtualMachineDiskRelationships(context);

        expect(context.jobState.collectedEntities).toEqual([]);
        expect(context.jobState.collectedRelationships).toEqual([]);
        expect(loggerWarnSpy).toHaveBeenCalledWith(
          {
            diskType: 'osDisk',
            managedDiskId:
              '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Compute/disks/j1dev_OsDisk_1_7f47e29fbfbe4fec8432d07d3d03fa34',
            virtualMachineId:
              '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/J1DEV/providers/Microsoft.Compute/virtualMachines/j1dev',
          },
          'Could not find managed disk defined by virtual machine.',
        );
      });
    });

    describe('data disk', () => {
      const virtualMachine: VirtualMachine = {
        id:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/J1DEV/providers/Microsoft.Compute/virtualMachines/j1dev',
        location: 'eastus',
        storageProfile: {
          dataDisks: [
            {
              lun: 0,
              createOption: 'FromImage',
              managedDisk: {
                id:
                  '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Compute/disks/j1dev_OsDisk_1_7f47e29fbfbe4fec8432d07d3d03fa34',
              },
            },
          ],
        },
      };

      const vmEntity = createVirtualMachineEntity(webLinker, virtualMachine);

      test('should create relationship if disk in job state', async () => {
        const disk: Disk = {
          id:
            '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/J1DEV/providers/Microsoft.Compute/disks/j1dev_OsDisk_1_7f47e29fbfbe4fec8432d07d3d03fa34',
          location: 'eastus',
          creationData: {
            createOption: 'FromImage',
          },
        };

        const diskEntity = createDiskEntity(webLinker, disk);

        const context = createMockAzureStepExecutionContext({
          instanceConfig: configFromEnv,
          entities: [diskEntity, vmEntity],
        });

        await buildVirtualMachineDiskRelationships(context);

        expect(context.jobState.collectedEntities.length).toBe(0);

        expect(context.jobState.collectedRelationships.length).toBe(1);
        expect(
          context.jobState.collectedRelationships,
        ).toMatchDirectRelationshipSchema({
          schema: {
            properties: {
              _type: {
                const: relationships.VIRTUAL_MACHINE_USES_MANAGED_DISK._type,
              },
              dataDisk: { const: true },
            },
          },
        });
        expect(
          context.jobState.collectedRelationships[0]._toEntityKey,
        ).not.toEqual(virtualMachine.storageProfile?.osDisk?.managedDisk?.id);
      });

      test('should log if disk is not in job state', async () => {
        const context = createMockAzureStepExecutionContext({
          instanceConfig: configFromEnv,
          entities: [vmEntity],
        });

        const loggerWarnSpy = jest.spyOn(context.logger, 'warn');

        await buildVirtualMachineDiskRelationships(context);

        expect(context.jobState.collectedEntities).toEqual([]);
        expect(context.jobState.collectedRelationships).toEqual([]);
        expect(loggerWarnSpy).toHaveBeenCalledWith(
          {
            diskType: 'dataDisk',
            managedDiskId:
              '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Compute/disks/j1dev_OsDisk_1_7f47e29fbfbe4fec8432d07d3d03fa34',
            virtualMachineId:
              '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/J1DEV/providers/Microsoft.Compute/virtualMachines/j1dev',
          },
          'Could not find managed disk defined by virtual machine.',
        );
      });
    });
  });

  describe('unmanaged disk', () => {
    describe('os disk', () => {
      const virtualMachine: VirtualMachine = {
        id:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/J1DEV/providers/Microsoft.Compute/virtualMachines/j1dev',
        location: 'eastus',
        storageProfile: {
          osDisk: {
            createOption: 'FromImage',
            vhd: {
              uri:
                'https://j1dev.blob.core.windows.net/vhds/non-managed-os20210321180131.vhd',
            },
          },
        },
      };

      const vmEntity = createVirtualMachineEntity(webLinker, virtualMachine);

      test('should create relationship if disk in job state', async () => {
        const storageAccount: StorageAccount = {
          id: 'some-storage-account-id',
          location: 'eastus',
          primaryEndpoints: {
            blob: 'https://j1dev.blob.core.windows.net/',
          },
        };

        const storageAccountEntity = createStorageAccountEntity(
          webLinker,
          storageAccount,
          { blob: {} },
        );

        const context = createMockAzureStepExecutionContext({
          instanceConfig: configFromEnv,
          entities: [storageAccountEntity, vmEntity],
        });

        await buildVirtualMachineDiskRelationships(context);

        expect(context.jobState.collectedEntities.length).toBe(0);

        expect(context.jobState.collectedRelationships.length).toBe(1);
        expect(
          context.jobState.collectedRelationships,
        ).toMatchDirectRelationshipSchema({
          schema: {
            properties: {
              _type: {
                const: relationships.VIRTUAL_MACHINE_USES_UNMANAGED_DISK._type,
              },
              osDisk: { const: true },
            },
          },
        });
      });

      test('should log if disk is not in job state', async () => {
        const context = createMockAzureStepExecutionContext({
          instanceConfig: configFromEnv,
          entities: [vmEntity],
        });

        const loggerWarnSpy = jest.spyOn(context.logger, 'warn');

        await buildVirtualMachineDiskRelationships(context);

        expect(context.jobState.collectedEntities).toEqual([]);
        expect(context.jobState.collectedRelationships).toEqual([]);
        expect(loggerWarnSpy).toHaveBeenCalledWith(
          {
            diskType: 'osDisk',
            vhdUri:
              'https://j1dev.blob.core.windows.net/vhds/non-managed-os20210321180131.vhd',
            storageAccountHostnames: [],
          },
          'Could not find storage account for unmanaged disk defined by virtual machine.',
        );
      });
    });

    describe('data disk', () => {
      const virtualMachine: VirtualMachine = {
        id:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/J1DEV/providers/Microsoft.Compute/virtualMachines/j1dev',
        location: 'eastus',
        storageProfile: {
          dataDisks: [
            {
              lun: 0,
              createOption: 'FromImage',
              vhd: {
                uri:
                  'https://j1dev.blob.core.windows.net/vhds/non-managed-os20210321180131.vhd',
              },
            },
          ],
        },
      };

      const vmEntity = createVirtualMachineEntity(webLinker, virtualMachine);

      test('should create relationship if disk in job state', async () => {
        const storageAccount: StorageAccount = {
          id: 'some-storage-account-id',
          location: 'eastus',
          primaryEndpoints: {
            blob: 'https://j1dev.blob.core.windows.net/',
          },
        };

        const storageAccountEntity = createStorageAccountEntity(
          webLinker,
          storageAccount,
          { blob: {} },
        );

        const context = createMockAzureStepExecutionContext({
          instanceConfig: configFromEnv,
          entities: [storageAccountEntity, vmEntity],
        });

        await buildVirtualMachineDiskRelationships(context);

        expect(context.jobState.collectedEntities.length).toBe(0);

        expect(context.jobState.collectedRelationships.length).toBe(1);
        expect(
          context.jobState.collectedRelationships,
        ).toMatchDirectRelationshipSchema({
          schema: {
            properties: {
              _type: {
                const: relationships.VIRTUAL_MACHINE_USES_UNMANAGED_DISK._type,
              },
              osDisk: { const: true },
            },
          },
        });
      });

      test('should log if disk is not in job state', async () => {
        const context = createMockAzureStepExecutionContext({
          instanceConfig: configFromEnv,
          entities: [vmEntity],
        });

        const loggerWarnSpy = jest.spyOn(context.logger, 'warn');

        await buildVirtualMachineDiskRelationships(context);

        expect(context.jobState.collectedEntities).toEqual([]);
        expect(context.jobState.collectedRelationships).toEqual([]);
        expect(loggerWarnSpy).toHaveBeenCalledWith(
          {
            diskType: 'dataDisk',
            vhdUri:
              'https://j1dev.blob.core.windows.net/vhds/non-managed-os20210321180131.vhd',
            storageAccountHostnames: [],
          },
          'Could not find storage account for unmanaged disk defined by virtual machine.',
        );
      });

      test('should create different relationship _keys when disk uses same storage account', async () => {
        const virtualMachineWithMultipleDataDisks = virtualMachine;

        virtualMachineWithMultipleDataDisks.storageProfile?.dataDisks?.push({
          lun: 1,
          createOption: 'FromImage',
          vhd: {
            uri:
              'https://j1dev.blob.core.windows.net/vhds/non-managed-os00000000000000.vhd',
          },
        });

        const vmWithMultipleDataDisksEntity = createVirtualMachineEntity(
          webLinker,
          virtualMachineWithMultipleDataDisks,
        );

        const storageAccount: StorageAccount = {
          id: 'some-storage-account-id',
          location: 'eastus',
          primaryEndpoints: {
            blob: 'https://j1dev.blob.core.windows.net/',
          },
        };

        const storageAccountEntity = createStorageAccountEntity(
          webLinker,
          storageAccount,
          { blob: {} },
        );

        const context = createMockAzureStepExecutionContext({
          instanceConfig: configFromEnv,
          entities: [storageAccountEntity, vmWithMultipleDataDisksEntity],
        });

        await buildVirtualMachineDiskRelationships(context);

        expect(context.jobState.collectedEntities.length).toBe(0);

        expect(context.jobState.collectedRelationships.length).toBe(2);
        expect(context.jobState.collectedRelationships[0]._key).not.toBe(
          context.jobState.collectedRelationships[1]._key,
        );
        expect(
          context.jobState.collectedRelationships,
        ).toMatchDirectRelationshipSchema({
          schema: {
            properties: {
              _type: {
                const: relationships.VIRTUAL_MACHINE_USES_UNMANAGED_DISK._type,
              },
              osDisk: { const: true },
            },
          },
        });
      });
    });
  });
});

describe('rm-compute-virtual-machine-extensions', () => {
  async function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);
    const context = createMockAzureStepExecutionContext({
      instanceConfig: config,
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchVirtualMachines(context);

    const vmEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === VIRTUAL_MACHINE_ENTITY_TYPE,
    );

    return { accountEntity, vmEntities };
  }

  function hasDuplicates(array: any[]): boolean {
    return new Set(array).size !== array.length;
  }

  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-compute-virtual-machine-extensions',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const {
      accountEntity,
      vmEntities: virtualMachineEntities,
    } = await getSetupEntities(configFromEnv);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [...virtualMachineEntities],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchVirtualMachineExtensions(context);

    const vmExtensionEntities = context.jobState.collectedEntities;

    expect(vmExtensionEntities.length).toBeGreaterThan(0);
    expect(vmExtensionEntities).toMatchGraphObjectSchema({
      _class: entities.VIRTUAL_MACHINE_EXTENSION._class,
    });

    expect(hasDuplicates(vmExtensionEntities.map((e) => e.name))).toBe(false);

    const vmVmExtensionRelationships = context.jobState.collectedRelationships;

    expect(vmVmExtensionRelationships.length).toBeGreaterThan(0);
    expect(vmVmExtensionRelationships).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: { const: relationships.VIRTUAL_MACHINE_USES_EXTENSION._type },
        },
      },
    });
  });
});

describe('rm-compute-virtual-machine-image-relationships', () => {
  async function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);
    const context = createMockAzureStepExecutionContext({
      instanceConfig: config,
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchVirtualMachines(context);
    await fetchVirtualMachineImages(context);
    await fetchGalleries(context);
    await fetchGalleryImages(context);
    await fetchGalleryImageVersions(context);

    const vmEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === VIRTUAL_MACHINE_ENTITY_TYPE,
    );

    const vmImageEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === VIRTUAL_MACHINE_IMAGE_ENTITY_TYPE,
    );

    const sharedImageEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === entities.SHARED_IMAGE._type,
    );

    const sharedImageVersionEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === entities.SHARED_IMAGE_VERSION._type,
    );

    return {
      accountEntity,
      vmEntities,
      vmImageEntities,
      sharedImageEntities,
      sharedImageVersionEntities,
    };
  }

  function separateRelationships(collectedRelationships: Relationship[]) {
    const {
      targets: vmImageRelationships,
      rest: restAfterImage,
    } = filterGraphObjects(
      collectedRelationships,
      (r) => r._type === relationships.VIRTUAL_MACHINE_USES_IMAGE._type,
    );
    const {
      targets: sharedImageRelationships,
      rest: restAfterSharedImage,
    } = filterGraphObjects(
      restAfterImage,
      (r) => r._type === relationships.VIRTUAL_MACHINE_USES_SHARED_IMAGE._type,
    );
    const {
      targets: sharedImageVersionRelationships,
      rest: restAfterSharedImageVersion,
    } = filterGraphObjects(
      restAfterSharedImage,
      (r) =>
        r._type ===
        relationships.VIRTUAL_MACHINE_USES_SHARED_IMAGE_VERSION._type,
    );

    return {
      vmImageRelationships,
      sharedImageRelationships,
      sharedImageVersionRelationships,
      rest: restAfterSharedImageVersion,
    };
  }

  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-compute-virtual-machine-image-relationships',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const {
      accountEntity,
      vmEntities,
      vmImageEntities,
      sharedImageEntities,
      sharedImageVersionEntities,
    } = await getSetupEntities(configFromEnv);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [
        ...vmEntities,
        ...vmImageEntities,
        ...sharedImageEntities,
        ...sharedImageVersionEntities,
      ],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await buildVirtualMachineImageRelationships(context);

    expect(context.jobState.collectedEntities).toHaveLength(0);

    const {
      vmImageRelationships,
      sharedImageRelationships,
      sharedImageVersionRelationships,
      rest: restRelationships,
    } = separateRelationships(context.jobState.collectedRelationships);

    expect(vmImageRelationships.length).toBeGreaterThan(0);
    expect(vmImageRelationships).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: { const: relationships.VIRTUAL_MACHINE_USES_IMAGE._type },
        },
      },
    });

    expect(sharedImageRelationships.length).toBeGreaterThan(0);
    expect(sharedImageRelationships).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: {
            const: relationships.VIRTUAL_MACHINE_USES_SHARED_IMAGE._type,
          },
        },
      },
    });

    expect(sharedImageVersionRelationships.length).toBeGreaterThan(0);
    expect(sharedImageVersionRelationships).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: {
            const:
              relationships.VIRTUAL_MACHINE_USES_SHARED_IMAGE_VERSION._type,
          },
        },
      },
    });

    expect(restRelationships).toHaveLength(0);
  }, 10_000);
});

describe('rm-compute-shared-image-version-source-relationships', () => {
  async function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);
    const context = createMockAzureStepExecutionContext({
      instanceConfig: config,
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchGalleries(context);
    await fetchGalleryImages(context);
    await fetchGalleryImageVersions(context);
    const imageVersionEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === entities.SHARED_IMAGE_VERSION._type,
    );
    expect(imageVersionEntities.length).toBeGreaterThan(0);

    await fetchVirtualMachines(context);
    const virtualMachineEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === VIRTUAL_MACHINE_ENTITY_TYPE,
    );
    expect(virtualMachineEntities.length).toBeGreaterThan(0);

    return {
      accountEntity,
      imageVersionEntity: imageVersionEntities[0],
      virtualMachineEntities,
    };
  }

  test('success - direct relationships', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-compute-shared-image-version-source-relationships',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const {
      accountEntity,
      imageVersionEntity,
      virtualMachineEntities,
    } = await getSetupEntities(configFromEnv);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [imageVersionEntity, ...virtualMachineEntities],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await buildGalleryImageVersionSourceRelationships(context);

    expect(context.jobState.collectedEntities).toHaveLength(0);

    const directImageSourceRelationships =
      context.jobState.collectedRelationships;

    expect(directImageSourceRelationships).toHaveLength(1);
    expect(directImageSourceRelationships).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: {
            const:
              relationships.VIRTUAL_MACHINE_GENERATED_SHARED_IMAGE_VERSION
                ._type,
          },
        },
      },
    });
  }, 10_000);

  test('success - mapped relationships', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-compute-shared-image-version-source-relationships',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const {
      accountEntity,
      imageVersionEntity,
      virtualMachineEntities,
    } = await getSetupEntities(configFromEnv);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [imageVersionEntity],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await buildGalleryImageVersionSourceRelationships(context);

    expect(context.jobState.collectedEntities).toHaveLength(0);

    const mappedImageSourceRelationships =
      context.jobState.collectedRelationships;

    expect(mappedImageSourceRelationships).toHaveLength(1);
    expect(mappedImageSourceRelationships).toTargetEntities(
      virtualMachineEntities,
    );
  }, 10_000);
});

describe('rm-compute-virtual-machine-managed-identity-relationships', () => {
  async function getSetupData(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);
    const context = createMockAzureStepExecutionContext({
      instanceConfig: config,
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchVirtualMachines(context);

    const vmEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === VIRTUAL_MACHINE_ENTITY_TYPE,
    );
    expect(vmEntities.length).toBeGreaterThan(0);
    const vms = vmEntities.map(
      (vmEntity) => getRawData<VirtualMachine>(vmEntity)!,
    );

    const systemAssignedIdentityCount = vms.filter((vm) =>
      ['SystemAssigned, UserAssigned', 'SystemAssigned'].includes(
        vm.identity?.type as string,
      ),
    ).length;
    expect(systemAssignedIdentityCount).toBeGreaterThan(0);

    const userAssignedIdentityCount = vms.reduce((lastCount, vm) => {
      const newUserAssignedEntities = vm.identity?.userAssignedIdentities || {};
      return lastCount + Object.keys(newUserAssignedEntities).length;
    }, 0);
    expect(userAssignedIdentityCount).toBeGreaterThan(0);

    await fetchServicePrincipals(context);

    const servicePrincipalEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === SERVICE_PRINCIPAL_ENTITY_TYPE,
    );
    expect(servicePrincipalEntities.length).toBeGreaterThan(0);

    return {
      accountEntity,
      vmEntities,
      systemAssignedIdentityCount,
      userAssignedIdentityCount,
      servicePrincipalEntities,
    };
  }

  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-compute-virtual-machine-managed-identity-relationships',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const {
      accountEntity,
      vmEntities,
      systemAssignedIdentityCount,
      userAssignedIdentityCount,
      servicePrincipalEntities,
    } = await getSetupData(configFromEnv);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: vmEntities,
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await buildVirtualMachineManagedIdentityRelationships(context);

    expect(context.jobState.collectedEntities).toHaveLength(0);

    expect(context.jobState.collectedRelationships).toHaveLength(
      systemAssignedIdentityCount + userAssignedIdentityCount,
    );
    expect(context.jobState.collectedRelationships).toTargetEntities(
      servicePrincipalEntities,
    );
  });
});
