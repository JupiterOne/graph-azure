import { Disk, VirtualMachine } from '@azure/arm-compute/esm/models';
import {
  createVirtualMachineDiskRelationships,
  fetchVirtualMachineDisks,
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
import {
  DISK_ENTITY_TYPE,
  entities,
  relationships,
  VIRTUAL_MACHINE_DISK_RELATIONSHIP_TYPE,
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
  async function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: config,
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchVirtualMachineDisks(context);
    const virtualMachineDiskEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === DISK_ENTITY_TYPE,
    );
    expect(virtualMachineDiskEntities.length).toBeGreaterThan(0);

    return {
      accountEntity,
      virtualMachineDiskEntities,
    };
  }
  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-compute-virtual-machines',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });
    const {
      accountEntity,
      virtualMachineDiskEntities,
    } = await getSetupEntities(configFromEnv);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [...virtualMachineDiskEntities],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchVirtualMachines(context);

    const virtualMachineEntities = context.jobState.collectedEntities;

    expect(virtualMachineEntities.length).toBeGreaterThan(0);
    expect(virtualMachineEntities).toMatchGraphObjectSchema({
      _class: VIRTUAL_MACHINE_ENTITY_CLASS,
    });

    const virtualMachineDiskRelationships =
      context.jobState.collectedRelationships;

    expect(virtualMachineDiskRelationships.length).toBeGreaterThan(0);
    expect(virtualMachineDiskRelationships).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: { const: VIRTUAL_MACHINE_DISK_RELATIONSHIP_TYPE },
        },
      },
    });
  });
});

describe('createVirtualMachineDiskRelationships', () => {
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

  const webLinker = createAzureWebLinker('www.default-domain.com');
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
      entities: [diskEntity],
    });

    const response = await createVirtualMachineDiskRelationships(
      virtualMachine,
      vmEntity,
      context,
    );

    expect(response).toEqual([
      {
        _key:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/J1DEV/providers/Microsoft.Compute/virtualMachines/j1dev|uses|/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/J1DEV/providers/Microsoft.Compute/disks/j1dev_OsDisk_1_7f47e29fbfbe4fec8432d07d3d03fa34',
        _type: 'azure_vm_uses_managed_disk',
        _class: 'USES',
        _fromEntityKey:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/J1DEV/providers/Microsoft.Compute/virtualMachines/j1dev',
        _toEntityKey:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/J1DEV/providers/Microsoft.Compute/disks/j1dev_OsDisk_1_7f47e29fbfbe4fec8432d07d3d03fa34',
        displayName: 'USES',
        osDisk: true,
      },
    ]);
    expect(response[0]._toEntityKey).not.toEqual(
      virtualMachine.storageProfile?.osDisk?.managedDisk?.id,
    );
  });

  test('should log if disk is not in job state', async () => {
    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [],
    });

    const loggerErrorSpy = jest.spyOn(context.logger, 'error');

    const response = await createVirtualMachineDiskRelationships(
      virtualMachine,
      vmEntity,
      context,
    );

    expect(response).toEqual([]);
    expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
    expect(loggerErrorSpy).toHaveBeenCalledWith(
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
