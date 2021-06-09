import {
  DataDisk,
  Disk,
  Gallery,
  GalleryImage,
  OSDisk,
  VirtualMachine,
} from '@azure/arm-compute/esm/models';
import { convertProperties } from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import {
  createDiskEntity,
  createGalleryEntity,
  createSharedImage,
  createVirtualMachineEntity,
  createVirtualMachineExtensionEntity,
  testFunctions,
  VirtualMachineExtensionSharedProperties,
} from './converters';

const { usesManagedDisks } = testFunctions;

const webLinker = createAzureWebLinker('something.onmicrosoft.com');

describe('createDiskEntity', () => {
  test('properties transferred', () => {
    const data: Disk = {
      name: 'j1devOsDisk',
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/J1DEV/providers/Microsoft.Compute/disks/j1devOsDisk',
      type: 'Microsoft.Compute/disks',
      location: 'eastus',
      tags: {
        environment: 'j1dev',
      },
      sku: {
        name: 'Premium_LRS',
        tier: 'Premium',
      },
      osType: 'Linux',
      hyperVGeneration: 'V1',
      creationData: {
        createOption: 'FromImage',
        imageReference: {
          id:
            '/Subscriptions/45231f81-377d-441c-af2b-e409bd355507/Providers/Microsoft.Compute/Locations/eastus/Publishers/canonical/ArtifactTypes/VMImage/Offers/ubuntuserver/Skus/16.04.0-lts/Versions/16.04.201912170',
        },
      },
      diskSizeGB: 30,
      diskIOPSReadWrite: 120,
      diskMBpsReadWrite: 25,
      encryption: {
        type: 'EncryptionAtRestWithPlatformKey',
      },
      timeCreated: new Date('2020-01-06T19:24:46.3139845+00:00'),
      provisioningState: 'Succeeded',
      diskState: 'Unattached',
      diskSizeBytes: 32213303296,
      uniqueId: 'd113289a-e22c-4660-8e82-0f191d72a98b',
    };

    expect(createDiskEntity(webLinker, data)).toEqual({
      ...convertProperties(data),
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/J1DEV/providers/Microsoft.Compute/disks/j1devOsDisk',
      _type: 'azure_managed_disk',
      _class: ['DataStore', 'Disk'],
      _rawData: [{ name: 'default', rawData: data }],
      displayName: 'j1devOsDisk',
      resourceGroup: 'j1dev',
      uniqueId: 'd113289a-e22c-4660-8e82-0f191d72a98b',
      type: 'Microsoft.Compute/disks',
      region: 'eastus',
      createdOn: new Date('2020-01-06T19:24:46.3139845+00:00').getTime(),
      webLink: webLinker.portalResourceUrl(
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/J1DEV/providers/Microsoft.Compute/disks/j1devOsDisk',
      ),
      'tag.environment': 'j1dev',
      encrypted: true,
      encryption: 'EncryptionAtRestWithPlatformKey',
      state: 'unattached',
      attached: false,
    });
  });
});

describe('createVirtualMachineEntity', () => {
  test('properties transferred', () => {
    const data: VirtualMachine = {
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/J1DEV/providers/Microsoft.Compute/virtualMachines/j1dev',
      name: 'j1dev',
      type: 'Microsoft.Compute/virtualMachines',
      location: 'eastus',
      tags: {
        environment: 'j1dev',
      },
      hardwareProfile: {
        vmSize: 'Standard_DS1_v2',
      },
      storageProfile: {
        imageReference: {
          publisher: 'Canonical',
          offer: 'UbuntuServer',
          sku: '16.04.0-LTS',
          version: 'latest',
        },
        osDisk: {
          osType: 'Linux',
          name: 'j1devOsDisk',
          caching: 'ReadWrite',
          writeAcceleratorEnabled: false,
          createOption: 'FromImage',
          diskSizeGB: 30,
          managedDisk: {
            id:
              '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Compute/disks/j1devOsDisk',
            storageAccountType: 'Premium_LRS',
          },
        },
        dataDisks: [],
      },
      osProfile: {
        computerName: 'myvm',
        adminUsername: 'azureuser',
        linuxConfiguration: {
          disablePasswordAuthentication: true,
          ssh: {
            publicKeys: [
              {
                path: '/home/azureuser/.ssh/authorized_keys',
                keyData:
                  'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCXZM0BFwNpwIM4thhnI8ZqgVSuyrm6TUKGD+8CQ+rIDhP6qZ/MH+lPSBAW8HAcufQGE/icreNFTgjcBxdllXOoETT7SNgKBNc9xoHvr94FXhBZIh/guws1MwyhNwbuWWdx9xB9b1hNGkh7T++DjCTyydjtG1C/24DXf6gm/bc8UbSuWlECQhNWor0ASYBRVajzvGqjbub42eSj+hgthoxZaX5iAXDHvQVbVIYmwPxxsnrC+ORN8WNpqXCuVvoBAIXbXT+1zLDk1E9ByGZ/jctnPGpKFreu2gV80kKRpAdKO5k2Z/0ylrwb3iV6fq+Edbv5CO2dcj8R/W2ZSlQSkku/nDis1Mo4KB1jTMlWEujzIp437SO3bcT2BeyxBbEOhyKNcPok++2cizL6wX2BVyK1qCKSvSlRQ6JNIHYRjAfnUChHac6xeuWVSWLazQIcPjyUAFS/amhtfBfzHFBDdSaY0VXEOLye2wZW7kejMSQp5heM3VtLytX2vgBPvPPsCwwPS8iSW3IY5cnYaviRp2oVqxkft/vTYT6SBu4YaDa1NfZjFGXnbZTUkWoarugWV2W/6OfEQv2RtjfetXf+/8hpDsrtJfTKw/z7dvhpR42UExYB4ks10Fqm0FORUbnI/Zh0HvsorHhoMo5FTZIOOBQkwB2Wgs93EcGrNYqYY6sEjw==',
              },
            ],
          },
          provisionVMAgent: true,
        },
        secrets: [],
        allowExtensionOperations: true,
      },
      networkProfile: {
        networkInterfaces: [
          {
            id:
              '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev',
            primary: false,
          },
        ],
      },
      diagnosticsProfile: {
        bootDiagnostics: {
          enabled: true,
          storageUri: 'https://diag8526a0bd6bb85418.blob.core.windows.net/',
        },
      },
      provisioningState: 'Succeeded',
      vmId: '2ed98ec3-b9a4-4126-926e-081889e3bc3a',
    };

    expect(createVirtualMachineEntity(webLinker, data)).toEqual({
      ...convertProperties(data),
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourcegroups/j1dev/providers/microsoft.compute/virtualmachines/j1dev',
      _type: 'azure_vm',
      _class: ['Host'],
      _rawData: [{ name: 'default', rawData: data }],
      displayName: 'j1dev',
      vmId: '2ed98ec3-b9a4-4126-926e-081889e3bc3a',
      type: 'Microsoft.Compute/virtualMachines',
      adminUser: 'azureuser',
      disablePasswordAuthentication: true,
      osName: 'UbuntuServer',
      platform: 'linux',
      resourceGroup: 'j1dev',
      region: 'eastus',
      state: 'Succeeded',
      usesManagedDisks: true,
      vmSize: 'Standard_DS1_v2',
      webLink: webLinker.portalResourceUrl(
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/J1DEV/providers/Microsoft.Compute/virtualMachines/j1dev',
      ),
      'tag.environment': 'j1dev',
    });
  });
});

describe('usesManagedDisks', () => {
  test('should return false if os disk = undefined & data disks = undefined', () => {
    // this case isn't strictly possible, since VMs do need an OS disk to operate.
    expect(usesManagedDisks(undefined, undefined)).toBe(false);
  });

  test('should return true if using managed OS disk & data disks', () => {
    const osDisk: OSDisk = { managedDisk: {}, createOption: 'FromImage' };
    const dataDisks: DataDisk[] = [
      { managedDisk: {}, lun: 0, createOption: 'FromImage' },
    ];
    expect(usesManagedDisks(osDisk, dataDisks)).toBe(true);
  });

  test('should return true if using managed OS disk (dataDisks = undefined)', () => {
    const osDisk: OSDisk = { managedDisk: {}, createOption: 'FromImage' };
    const dataDisks = undefined;
    expect(usesManagedDisks(osDisk, dataDisks)).toBe(true);
  });

  test('should return true if using managed OS disk (dataDisks = [])', () => {
    const osDisk: OSDisk = { managedDisk: {}, createOption: 'FromImage' };
    const dataDisks: DataDisk[] = [];
    expect(usesManagedDisks(osDisk, dataDisks)).toBe(true);
  });

  test('should return false if not using managed OS disk but managed data disks', () => {
    const osDisk: OSDisk = { createOption: 'FromImage' };
    const dataDisks: DataDisk[] = [
      { managedDisk: {}, lun: 0, createOption: 'FromImage' },
    ];
    expect(usesManagedDisks(osDisk, dataDisks)).toBe(false);
  });

  test('should return false if using one non-managed data disk but managed OS disk & other data disks', () => {
    const osDisk: OSDisk = { managedDisk: {}, createOption: 'FromImage' };
    const dataDisks: DataDisk[] = [
      { managedDisk: {}, lun: 0, createOption: 'FromImage' },
      { lun: 1, createOption: 'FromImage' },
    ];
    expect(usesManagedDisks(osDisk, dataDisks)).toBe(false);
  });
});

describe('createGalleryEntity', () => {
  test('properties transferred', () => {
    const data: Gallery = {
      name: 'testImageGallery',
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/J1DEV/providers/Microsoft.Compute/galleries/testImageGallery',
      type: 'Microsoft.Compute/galleries',
      location: 'eastus',
      provisioningState: 'Succeeded',
      description: 'Some description',
      tags: {},
    };

    expect(createGalleryEntity(webLinker, data)).toEqual({
      name: 'testImageGallery',
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/J1DEV/providers/Microsoft.Compute/galleries/testImageGallery',
      description: 'Some description',
      _key:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/J1DEV/providers/Microsoft.Compute/galleries/testImageGallery',
      _type: 'azure_gallery',
      _class: ['Repository'],
      displayName: 'testImageGallery',
      region: 'eastus',
      location: 'eastus',
      state: 'Succeeded',
      type: 'Microsoft.Compute/galleries',
      createdOn: undefined,
      classification: null,
      encrypted: false,
      resourceGroup: 'j1dev',
      webLink: webLinker.portalResourceUrl(
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/J1DEV/providers/Microsoft.Compute/galleries/testImageGallery',
      ),
      _rawData: [{ name: 'default', rawData: data }],
    });
  });
});

describe('createSharedImageEntity', () => {
  test('properties transferred', () => {
    const data: GalleryImage = {
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/J1DEV/providers/Microsoft.Compute/galleries/testImageGallery/images/test-image-definition',
      name: 'test-image-definition',
      type: 'Microsoft.Compute/galleries/images',
      location: 'eastus',
      tags: {},
      osType: 'Linux',
      osState: 'Generalized',
      description: 'Some description',
      hyperVGeneration: 'V1',
      identifier: { publisher: 'ndowmon', offer: 'ndowmon', sku: 'ndowmon' },
      provisioningState: 'Succeeded',
      endOfLifeDate: new Date(1621366301861),
      eula: 'Some eula',
    };

    expect(createSharedImage(webLinker, data)).toEqual({
      name: 'test-image-definition',
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/J1DEV/providers/Microsoft.Compute/galleries/testImageGallery/images/test-image-definition',
      description: 'Some description',
      _key:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/J1DEV/providers/Microsoft.Compute/galleries/testImageGallery/images/test-image-definition',
      _type: 'azure_shared_image',
      _class: ['Image'],
      displayName: 'test-image-definition',
      region: 'eastus',
      osState: 'Generalized',
      osType: 'Linux',
      eula: 'Some eula',
      state: 'Succeeded',
      type: 'Microsoft.Compute/galleries/images',
      endOfLifeDate: 1621366301861,
      createdOn: undefined,
      resourceGroup: 'j1dev',
      webLink: webLinker.portalResourceUrl(
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/J1DEV/providers/Microsoft.Compute/galleries/testImageGallery/images/test-image-definition',
      ),
      _rawData: [{ name: 'default', rawData: data }],
    });
  });
});

describe('createVirtualMachineExtensionEntity', () => {
  test('properties transferred', () => {
    const data: VirtualMachineExtensionSharedProperties = {
      name: 'TeamServicesAgentExtension',
      id:
        '/subscriptions/d2c1ab8d-f64d-43e2-bca3-ea3b8130679d/resourceGroups/kenan-free-trial/providers/Microsoft.Compute/virtualMachines/kenan-free-trial/extensions/TeamServicesAgentExtension',
      type: 'Microsoft.Compute/virtualMachines/extensions',
      autoUpgradeMinorVersion: true,
      publisher: 'Microsoft.VisualStudio.Services',
      virtualMachineExtensionType: 'TeamServicesAgentLinux',
      typeHandlerVersion: '1.0',
      settings: {
        VSTSAccountName: 'kenanwarrenj1',
        TeamProject: 'Test Project',
        DeploymentGroup: 'test-deployment',
        AgentName: 'kenan-free-trial',
        Tags: '',
      },
    };

    expect(createVirtualMachineExtensionEntity(data)).toEqual({
      _key:
        '/subscriptions/d2c1ab8d-f64d-43e2-bca3-ea3b8130679d/resourceGroups/kenan-free-trial/providers/Microsoft.Compute/virtualMachines/kenan-free-trial/extensions/TeamServicesAgentExtension',
      _type: 'azure_vm_extension',
      _class: ['Application'],
      id:
        '/subscriptions/d2c1ab8d-f64d-43e2-bca3-ea3b8130679d/resourceGroups/kenan-free-trial/providers/Microsoft.Compute/virtualMachines/kenan-free-trial/extensions/TeamServicesAgentExtension',
      displayName: 'TeamServicesAgentExtension',
      extType: 'TeamServicesAgentLinux',
      name: 'TeamServicesAgentExtension',
      publisher: 'Microsoft.VisualStudio.Services',
      'settings.agentName': 'kenan-free-trial',
      'settings.deploymentGroup': 'test-deployment',
      'settings.tags': '',
      'settings.teamProject': 'Test Project',
      'settings.vstsAccountName': 'kenanwarrenj1',
      createdOn: undefined,
      _rawData: [{ name: 'default', rawData: data }],
    });
  });
});
