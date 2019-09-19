import { VirtualMachine } from "@azure/arm-compute/esm/models";

import { createAzureWebLinker } from "../azure";
import { createVirtualMachineEntity } from "./resources";

const webLinker = createAzureWebLinker("something.onmicrosoft.com");

describe("createVirtualMachineEntity", () => {
  test("properties transferred", async () => {
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

    expect(createVirtualMachineEntity(webLinker, data)).toEqual({
      _key: "azure_vm_2ed98ec3-b9a4-4126-926e-081889e3bc3a",
      _type: "azure_vm",
      _class: "Host",
      _rawData: [{ name: "default", rawData: data }],
      displayName: "j1dev",
      vmId: "2ed98ec3-b9a4-4126-926e-081889e3bc3a",
      type: "Microsoft.Compute/virtualMachines",
      location: "eastus",
      vmSize: "Standard_DS1_v2",
      webLink: webLinker.portalResourceUrl(
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/J1DEV/providers/Microsoft.Compute/virtualMachines/j1dev",
      ),
    });
  });
});
