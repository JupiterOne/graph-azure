import { Disk, VirtualMachine } from '@azure/arm-compute/esm/models';
import { StorageAccount } from '@azure/arm-storage/esm/models';
import {
  buildVirtualMachineDiskRelationships,
  fetchVirtualMachineExtensions,
  fetchVirtualMachines,
} from '.';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { getMockAccountEntity } from '../../../../test/helpers/getMockAccountEntity';
import {
  getMatchRequestsBy,
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { configFromEnv } from '../../../../test/integrationInstanceConfig';
import { createAzureWebLinker } from '../../../azure';
import { IntegrationConfig } from '../../../types';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';
import { createStorageAccountEntity } from '../storage/converters';
import {
  entities,
  relationships,
  VIRTUAL_MACHINE_ENTITY_CLASS,
  VIRTUAL_MACHINE_ENTITY_TYPE,
} from './constants';
import { createDiskEntity, createVirtualMachineEntity } from './converters';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
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
