import { VirtualMachine } from "@azure/arm-compute/esm/models";
import {
  NetworkInterface,
  PublicIPAddress,
} from "@azure/arm-network/esm/models";

import { createAzureWebLinker } from "../azure";
import { NetworkInterfaceEntity, PublicIPAddressEntity } from "../jupiterone";
import {
  createNetworkInterfaceEntity,
  createPublicIPAddressEntity,
  createVirtualMachineEntity,
} from "./resources";

const webLinker = createAzureWebLinker("something.onmicrosoft.com");

describe("createNetworkInterfaceEntity", () => {
  test("properties transferred", () => {
    const data: NetworkInterface = {
      name: "j1dev",
      id:
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev",
      etag: 'W/"39076d6b-2dd2-4096-9af4-8df45d4fa312"',
      location: "eastus",
      tags: {
        environment: "j1dev",
      },
      provisioningState: "Succeeded",
      resourceGuid: "ab964820-ee40-4f8d-bfd9-0349b8b4f316",
      ipConfigurations: [
        {
          name: "j1devConfiguration",
          id:
            "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev/ipConfigurations/j1devConfiguration",
          etag: 'W/"39076d6b-2dd2-4096-9af4-8df45d4fa312"',
          provisioningState: "Succeeded",
          privateIPAddress: "10.0.2.4",
          privateIPAllocationMethod: "Dynamic",
          publicIPAddress: {
            id:
              "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev",
          },
          subnet: {
            id:
              "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev",
          },
          primary: true,
          privateIPAddressVersion: "IPv4",
        },
      ],
      dnsSettings: {
        dnsServers: [],
        appliedDnsServers: [],
        internalDomainNameSuffix:
          "iqtrdnvdttbudhqhotjymog2pe.bx.internal.cloudapp.net",
      },
      macAddress: "00-0D-3A-14-85-87",
      enableAcceleratedNetworking: false,
      enableIPForwarding: false,
      networkSecurityGroup: {
        id:
          "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev",
      },
      primary: true,
      virtualMachine: {
        id:
          "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Compute/virtualMachines/j1dev",
      },
      hostedWorkloads: [],
      tapConfigurations: [],
      type: "Microsoft.Network/networkInterfaces",
    };

    const entity: NetworkInterfaceEntity = {
      _key:
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev",
      _type: "azure_nic",
      _class: "NetworkInterface",
      _rawData: [{ name: "default", rawData: data }],
      resourceGuid: "ab964820-ee40-4f8d-bfd9-0349b8b4f316",
      displayName: "j1dev",
      virtualMachineId:
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Compute/virtualMachines/j1dev",
      type: "Microsoft.Network/networkInterfaces",
      region: "eastus",
      publicIp: undefined,
      publicIpAddress: undefined,
      privateIp: ["10.0.2.4"],
      privateIpAddress: ["10.0.2.4"],
      macAddress: "00-0D-3A-14-85-87",
      securityGroupId:
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev",
      ipForwarding: false,
      webLink: webLinker.portalResourceUrl(
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev",
      ),
    };

    expect(createNetworkInterfaceEntity(webLinker, data)).toEqual(entity);
  });
});

describe("createPublicIPAddressEntity", () => {
  test("properties transferred", () => {
    const data: PublicIPAddress = {
      name: "j1dev",
      id:
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev",
      etag: 'W/"0d9bdc1d-3e57-42eb-8a6b-9be1241ef5bc"',
      location: "eastus",
      tags: {
        environment: "j1dev",
      },
      provisioningState: "Succeeded",
      resourceGuid: "d908c31d-c93a-4359-987f-8cfdd1b65a61",
      ipAddress: "13.90.252.212",
      publicIPAddressVersion: "IPv4",
      publicIPAllocationMethod: "Dynamic",
      idleTimeoutInMinutes: 4,
      ipTags: [],
      ipConfiguration: {
        id:
          "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev/ipConfigurations/j1devConfiguration",
      },
      type: "Microsoft.Network/publicIPAddresses",
      sku: {
        name: "Basic",
      },
    };

    const entity: PublicIPAddressEntity = {
      _key:
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev",
      _type: "azure_public_ip",
      _class: "IpAddress",
      _rawData: [{ name: "default", rawData: data }],
      resourceGuid: "d908c31d-c93a-4359-987f-8cfdd1b65a61",
      displayName: "j1dev",
      type: "Microsoft.Network/publicIPAddresses",
      region: "eastus",
      publicIp: "13.90.252.212",
      publicIpAddress: "13.90.252.212",
      public: true,
      webLink: webLinker.portalResourceUrl(
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev",
      ),
    };

    expect(createPublicIPAddressEntity(webLinker, data)).toEqual(entity);
  });
});

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

    expect(createVirtualMachineEntity(webLinker, data)).toEqual({
      _key:
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/J1DEV/providers/Microsoft.Compute/virtualMachines/j1dev",
      _type: "azure_vm",
      _class: "Host",
      _rawData: [{ name: "default", rawData: data }],
      displayName: "j1dev",
      vmId: "2ed98ec3-b9a4-4126-926e-081889e3bc3a",
      type: "Microsoft.Compute/virtualMachines",
      region: "eastus",
      vmSize: "Standard_DS1_v2",
      webLink: webLinker.portalResourceUrl(
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/J1DEV/providers/Microsoft.Compute/virtualMachines/j1dev",
      ),
    });
  });
});
