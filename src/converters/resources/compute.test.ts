import { Disk, VirtualMachine } from "@azure/arm-compute/esm/models";

import { createAzureWebLinker } from "../../azure";
import { VirtualMachineEntity, AzureRegionalEntity } from "../../jupiterone";
import { createVirtualMachineEntity, createDiskEntity } from "./compute";
import { convertProperties } from "@jupiterone/jupiter-managed-integration-sdk";

const webLinker = createAzureWebLinker("something.onmicrosoft.com");

describe("createVirtualMachineEntity", () => {
  test("properties transferred", () => {
    const data: VirtualMachine = {
      id:
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/J1DEV/providers/Microsoft.Compute/virtualMachines/j1dev",
      name: "j1dev",
      type: "Microsoft.Compute/virtualMachines",
      location: "eastus",
      tags: {
        environment: "j1dev",
      },
      hardwareProfile: {
        vmSize: "Standard_DS1_v2",
      },
      storageProfile: {
        imageReference: {
          publisher: "Canonical",
          offer: "UbuntuServer",
          sku: "16.04.0-LTS",
          version: "latest",
        },
        osDisk: {
          osType: "Linux",
          name: "j1devOsDisk",
          caching: "ReadWrite",
          writeAcceleratorEnabled: false,
          createOption: "FromImage",
          diskSizeGB: 30,
          managedDisk: {
            id:
              "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Compute/disks/j1devOsDisk",
            storageAccountType: "Premium_LRS",
          },
        },
        dataDisks: [],
      },
      osProfile: {
        computerName: "myvm",
        adminUsername: "azureuser",
        linuxConfiguration: {
          disablePasswordAuthentication: true,
          ssh: {
            publicKeys: [
              {
                path: "/home/azureuser/.ssh/authorized_keys",
                keyData:
                  "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCXZM0BFwNpwIM4thhnI8ZqgVSuyrm6TUKGD+8CQ+rIDhP6qZ/MH+lPSBAW8HAcufQGE/icreNFTgjcBxdllXOoETT7SNgKBNc9xoHvr94FXhBZIh/guws1MwyhNwbuWWdx9xB9b1hNGkh7T++DjCTyydjtG1C/24DXf6gm/bc8UbSuWlECQhNWor0ASYBRVajzvGqjbub42eSj+hgthoxZaX5iAXDHvQVbVIYmwPxxsnrC+ORN8WNpqXCuVvoBAIXbXT+1zLDk1E9ByGZ/jctnPGpKFreu2gV80kKRpAdKO5k2Z/0ylrwb3iV6fq+Edbv5CO2dcj8R/W2ZSlQSkku/nDis1Mo4KB1jTMlWEujzIp437SO3bcT2BeyxBbEOhyKNcPok++2cizL6wX2BVyK1qCKSvSlRQ6JNIHYRjAfnUChHac6xeuWVSWLazQIcPjyUAFS/amhtfBfzHFBDdSaY0VXEOLye2wZW7kejMSQp5heM3VtLytX2vgBPvPPsCwwPS8iSW3IY5cnYaviRp2oVqxkft/vTYT6SBu4YaDa1NfZjFGXnbZTUkWoarugWV2W/6OfEQv2RtjfetXf+/8hpDsrtJfTKw/z7dvhpR42UExYB4ks10Fqm0FORUbnI/Zh0HvsorHhoMo5FTZIOOBQkwB2Wgs93EcGrNYqYY6sEjw==",
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
              "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev",
            primary: false,
          },
        ],
      },
      diagnosticsProfile: {
        bootDiagnostics: {
          enabled: true,
          storageUri: "https://diag8526a0bd6bb85418.blob.core.windows.net/",
        },
      },
      provisioningState: "Succeeded",
      vmId: "2ed98ec3-b9a4-4126-926e-081889e3bc3a",
    };

    const entity: VirtualMachineEntity = {
      ...convertProperties(data),
      _key:
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/J1DEV/providers/Microsoft.Compute/virtualMachines/j1dev",
      _type: "azure_vm",
      _class: "Host",
      _rawData: [{ name: "default", rawData: data }],
      displayName: "j1dev",
      vmId: "2ed98ec3-b9a4-4126-926e-081889e3bc3a",
      type: "Microsoft.Compute/virtualMachines",
      adminUser: "azureuser",
      disablePasswordAuthentication: true,
      osName: "UbuntuServer",
      platform: "linux",
      resourceGroup: "j1dev",
      region: "eastus",
      state: "Succeeded",
      vmSize: "Standard_DS1_v2",
      webLink: webLinker.portalResourceUrl(
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/J1DEV/providers/Microsoft.Compute/virtualMachines/j1dev",
      ),
    };

    expect(createVirtualMachineEntity(webLinker, data)).toEqual({
      ...entity,
      "tag.environment": "j1dev",
    });
  });
});

describe("createDiskEntity", () => {
  test("properties transferred", () => {
    const data: Disk[] = [
      {
        creationData: {
          createOption: "FromImage",
          imageReference: {
            id:
              "/Subscriptions/655737a7-e4fa-4f19-8c60-194cc7a2ca11/Providers/Microsoft.Compute/Locations/eastus/Publishers/canonical/ArtifactTypes/VMImage/Offers/ubuntuserver/Skus/18.04-lts/Versions/18.04.202002080",
            lun: undefined,
          },
          sourceResourceId: undefined,
          sourceUniqueId: undefined,
          sourceUri: undefined,
          storageAccountId: undefined,
          uploadSizeBytes: undefined,
        },
        diskIOPSReadWrite: 120,
        diskMBpsReadWrite: 25,
        diskSizeBytes: 32213303296,
        diskSizeGB: 30,
        diskState: "Attached",
        encryptionSettingsCollection: undefined,
        hyperVGeneration: "V1",
        id:
          "/subscriptions/47189c37-a117-483e-b343-0fc4ed6e0d23/resourceGroups/XTEST/providers/Microsoft.Compute/disks/j1_disk1_766d195cebab4c24819e73a732fa221b",
        location: "eastus",
        managedBy:
          "/subscriptions/47189c37-a117-483e-b343-0fc4ed6e0d23/resourceGroups/xtest/providers/Microsoft.Compute/virtualMachines/j1",
        name: "j1_disk1_766d195cebab4c24819e73a732fa221b",
        osType: "Linux",
        provisioningState: "Succeeded",
        sku: {
          name: "StandardSSD_LRS",
          tier: "Standard",
        },
        tags: undefined,
        timeCreated: new Date("2020-02-13T14:06:15.012935+00:00"),
        type: "Microsoft.Compute/disks",
        uniqueId: "766d195c-ebab-4c24-819e-73a732fa221b",
        zones: undefined,
      },
    ];

    const entity: AzureRegionalEntity = {
      ...convertProperties(data[0]),
      _key:
        "/subscriptions/47189c37-a117-483e-b343-0fc4ed6e0d23/resourceGroups/XTEST/providers/Microsoft.Compute/disks/j1_disk1_766d195cebab4c24819e73a732fa221b",
      _type: "azure_managed_disk",
      _class: ["DataStore", "Disk"],
      _rawData: [{ name: "default", rawData: data[0] }],
      displayName: "j1_disk1_766d195cebab4c24819e73a732fa221b",
      resourceGroup: "xtest",
      uniqueId: "766d195c-ebab-4c24-819e-73a732fa221b",
      type: "Microsoft.Compute/disks",
      region: "eastus",
      createdOn: new Date("2020-02-13T14:06:15.012935+00:00").getTime(),
      webLink: webLinker.portalResourceUrl(
        "/subscriptions/47189c37-a117-483e-b343-0fc4ed6e0d23/resourceGroups/XTEST/providers/Microsoft.Compute/disks/j1_disk1_766d195cebab4c24819e73a732fa221b",
      ),
    };

    expect(createDiskEntity(webLinker, data[0])).toEqual(entity);
  });
});
