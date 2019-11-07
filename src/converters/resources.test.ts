import { VirtualMachine } from "@azure/arm-compute/esm/models";
import {
  NetworkInterface,
  NetworkSecurityGroup,
  PublicIPAddress,
  Subnet,
  VirtualNetwork,
} from "@azure/arm-network/esm/models";

import { createAzureWebLinker } from "../azure";
import {
  NetworkInterfaceEntity,
  PublicIPAddressEntity,
  VirtualMachineEntity,
} from "../jupiterone";
import {
  createNetworkInterfaceEntity,
  createNetworkSecurityGroupEntity,
  createPublicIPAddressEntity,
  createSubnetEntity,
  createVirtualMachineEntity,
  createVirtualNetworkEntity,
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
      resourceGroup: "j1dev",
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

    expect(createNetworkInterfaceEntity(webLinker, data)).toEqual({
      ...entity,
      "tag.environment": "j1dev",
      tags: ["j1dev"],
    });
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
      resourceGroup: "j1dev",
      displayName: "j1dev",
      type: "Microsoft.Network/publicIPAddresses",
      region: "eastus",
      publicIp: "13.90.252.212",
      publicIpAddress: "13.90.252.212",
      public: true,
      webLink: webLinker.portalResourceUrl(
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev",
      ),
      sku: "Basic",
    };

    expect(createPublicIPAddressEntity(webLinker, data)).toEqual({
      ...entity,
      "tag.environment": "j1dev",
      tags: ["j1dev"],
    });
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

    const entity: VirtualMachineEntity = {
      _key:
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/J1DEV/providers/Microsoft.Compute/virtualMachines/j1dev",
      _type: "azure_vm",
      _class: "Host",
      _rawData: [{ name: "default", rawData: data }],
      displayName: "j1dev",
      vmId: "2ed98ec3-b9a4-4126-926e-081889e3bc3a",
      type: "Microsoft.Compute/virtualMachines",
      resourceGroup: "j1dev",
      region: "eastus",
      vmSize: "Standard_DS1_v2",
      webLink: webLinker.portalResourceUrl(
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/J1DEV/providers/Microsoft.Compute/virtualMachines/j1dev",
      ),
    };

    expect(createVirtualMachineEntity(webLinker, data)).toEqual({
      ...entity,
      "tag.environment": "j1dev",
      tags: ["j1dev"],
    });
  });
});

describe("createNetworkSecurityGroupEntity", () => {
  test("properties transferred", () => {
    const data: NetworkSecurityGroup = {
      name: "j1dev",
      id:
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev",
      etag: 'W/"276c40f4-6483-4bce-9fce-b0d710c4fd92"',
      type: "Microsoft.Network/networkSecurityGroups",
      location: "eastus",
      tags: {
        environment: "j1dev",
      },
      provisioningState: "Succeeded",
      resourceGuid: "48b6006f-a105-4a29-9466-8fccd73b4e79",
      securityRules: [
        {
          name: "SSH",
          id:
            "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/securityRules/SSH",
          etag: 'W/"276c40f4-6483-4bce-9fce-b0d710c4fd92"',
          provisioningState: "Succeeded",
          protocol: "Tcp",
          sourcePortRange: "*",
          destinationPortRange: "22",
          sourceAddressPrefix: "*",
          destinationAddressPrefix: "*",
          access: "Allow",
          priority: 1001,
          direction: "Inbound",
          sourcePortRanges: [],
          destinationPortRanges: [],
          sourceAddressPrefixes: [],
          destinationAddressPrefixes: [],
        },
      ],
      defaultSecurityRules: [
        {
          name: "AllowVnetInBound",
          id:
            "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/AllowVnetInBound",
          etag: 'W/"276c40f4-6483-4bce-9fce-b0d710c4fd92"',
          provisioningState: "Succeeded",
          description: "Allow inbound traffic from all VMs in VNET",
          protocol: "*",
          sourcePortRange: "*",
          destinationPortRange: "*",
          sourceAddressPrefix: "VirtualNetwork",
          destinationAddressPrefix: "VirtualNetwork",
          access: "Allow",
          priority: 65000,
          direction: "Inbound",
          sourcePortRanges: [],
          destinationPortRanges: [],
          sourceAddressPrefixes: [],
          destinationAddressPrefixes: [],
        },
        {
          name: "AllowAzureLoadBalancerInBound",
          id:
            "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/AllowAzureLoadBalancerInBound",
          etag: 'W/"276c40f4-6483-4bce-9fce-b0d710c4fd92"',
          provisioningState: "Succeeded",
          description: "Allow inbound traffic from azure load balancer",
          protocol: "*",
          sourcePortRange: "*",
          destinationPortRange: "*",
          sourceAddressPrefix: "AzureLoadBalancer",
          destinationAddressPrefix: "*",
          access: "Allow",
          priority: 65001,
          direction: "Inbound",
          sourcePortRanges: [],
          destinationPortRanges: [],
          sourceAddressPrefixes: [],
          destinationAddressPrefixes: [],
        },
        {
          name: "DenyAllInBound",
          id:
            "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/DenyAllInBound",
          etag: 'W/"276c40f4-6483-4bce-9fce-b0d710c4fd92"',
          provisioningState: "Succeeded",
          description: "Deny all inbound traffic",
          protocol: "*",
          sourcePortRange: "*",
          destinationPortRange: "*",
          sourceAddressPrefix: "*",
          destinationAddressPrefix: "*",
          access: "Deny",
          priority: 65500,
          direction: "Inbound",
          sourcePortRanges: [],
          destinationPortRanges: [],
          sourceAddressPrefixes: [],
          destinationAddressPrefixes: [],
        },
        {
          name: "AllowVnetOutBound",
          id:
            "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/AllowVnetOutBound",
          etag: 'W/"276c40f4-6483-4bce-9fce-b0d710c4fd92"',
          provisioningState: "Succeeded",
          description: "Allow outbound traffic from all VMs to all VMs in VNET",
          protocol: "*",
          sourcePortRange: "*",
          destinationPortRange: "*",
          sourceAddressPrefix: "VirtualNetwork",
          destinationAddressPrefix: "VirtualNetwork",
          access: "Allow",
          priority: 65000,
          direction: "Outbound",
          sourcePortRanges: [],
          destinationPortRanges: [],
          sourceAddressPrefixes: [],
          destinationAddressPrefixes: [],
        },
        {
          name: "AllowInternetOutBound",
          id:
            "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/AllowInternetOutBound",
          etag: 'W/"276c40f4-6483-4bce-9fce-b0d710c4fd92"',
          provisioningState: "Succeeded",
          description: "Allow outbound traffic from all VMs to Internet",
          protocol: "*",
          sourcePortRange: "*",
          destinationPortRange: "*",
          sourceAddressPrefix: "*",
          destinationAddressPrefix: "Internet",
          access: "Allow",
          priority: 65001,
          direction: "Outbound",
          sourcePortRanges: [],
          destinationPortRanges: [],
          sourceAddressPrefixes: [],
          destinationAddressPrefixes: [],
        },
        {
          name: "DenyAllOutBound",
          id:
            "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/DenyAllOutBound",
          etag: 'W/"276c40f4-6483-4bce-9fce-b0d710c4fd92"',
          provisioningState: "Succeeded",
          description: "Deny all outbound traffic",
          protocol: "*",
          sourcePortRange: "*",
          destinationPortRange: "*",
          sourceAddressPrefix: "*",
          destinationAddressPrefix: "*",
          access: "Deny",
          priority: 65500,
          direction: "Outbound",
          sourcePortRanges: [],
          destinationPortRanges: [],
          sourceAddressPrefixes: [],
          destinationAddressPrefixes: [],
        },
      ],
      networkInterfaces: [
        {
          id:
            "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev",
        },
      ],
    };

    const entity = {
      _key:
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev",
      _type: "azure_security_group",
      _class: ["Firewall"],
      _rawData: [{ name: "default", rawData: data }],
      name: "j1dev",
      displayName: "j1dev",
      resourceGroup: "j1dev",
      region: "eastus",
      environment: "j1dev",
      webLink: webLinker.portalResourceUrl(
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev",
      ),
      category: "network",
      "tag.environment": "j1dev",
      tags: ["j1dev"],
    };

    expect(createNetworkSecurityGroupEntity(webLinker, data)).toEqual(entity);
  });
});

describe("createVirtualNetworkEntity", () => {
  test("properties transferred", () => {
    const data: VirtualNetwork = {
      name: "j1dev",
      id:
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev",
      etag: 'W/"4f9fb61f-5fa0-49c1-afbe-4c7d93bcab4c"',
      type: "Microsoft.Network/virtualNetworks",
      location: "eastus",
      tags: {
        environment: "j1dev",
      },
      provisioningState: "Succeeded",
      resourceGuid: "db9a7800-856d-4758-8f1d-8bbd7c77a11c",
      addressSpace: {
        addressPrefixes: ["10.0.0.0/16"],
      },
      dhcpOptions: {
        dnsServers: [],
      },
      subnets: [
        {
          name: "j1dev",
          id:
            "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev",
          etag: 'W/"4f9fb61f-5fa0-49c1-afbe-4c7d93bcab4c"',
          provisioningState: "Succeeded",
          addressPrefix: "10.0.2.0/24",
          ipConfigurations: [
            {
              id:
                "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev/ipConfigurations/j1devConfiguration",
            },
          ],
          serviceEndpoints: [],
          delegations: [],
          privateEndpointNetworkPolicies: "Enabled",
          privateLinkServiceNetworkPolicies: "Enabled",
        },
      ],
      virtualNetworkPeerings: [],
      enableDdosProtection: false,
      enableVmProtection: false,
    };

    const entity = {
      _key:
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev",
      _type: "azure_vnet",
      _class: ["Network"],
      _rawData: [{ name: "default", rawData: data }],
      name: "j1dev",
      displayName: "j1dev (10.0.0.0/16)",
      resourceGroup: "j1dev",
      region: "eastus",
      environment: "j1dev",
      webLink: webLinker.portalResourceUrl(
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev",
      ),
      CIDR: "10.0.0.0/16",
      internal: true,
      public: false,
      "tag.environment": "j1dev",
      tags: ["j1dev"],
    };

    expect(createVirtualNetworkEntity(webLinker, data)).toEqual(entity);
  });
});

describe("createSubnetEntity", () => {
  test("properties transferred", () => {
    const data: Subnet = {
      name: "j1dev",
      id:
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev",
      etag: 'W/"4f9fb61f-5fa0-49c1-afbe-4c7d93bcab4c"',
      provisioningState: "Succeeded",
      addressPrefix: "10.0.2.0/24",
      ipConfigurations: [
        {
          id:
            "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev/ipConfigurations/j1devConfiguration",
        },
      ],
      serviceEndpoints: [],
      delegations: [],
      privateEndpointNetworkPolicies: "Enabled",
      privateLinkServiceNetworkPolicies: "Enabled",
    };

    const vnet: VirtualNetwork = {
      name: "j1dev",
      id:
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev",
      etag: 'W/"4f9fb61f-5fa0-49c1-afbe-4c7d93bcab4c"',
      type: "Microsoft.Network/virtualNetworks",
      location: "eastus",
      tags: {
        environment: "j1dev",
      },
      provisioningState: "Succeeded",
      resourceGuid: "db9a7800-856d-4758-8f1d-8bbd7c77a11c",
      addressSpace: {
        addressPrefixes: ["10.0.0.0/16"],
      },
      dhcpOptions: {
        dnsServers: [],
      },
      subnets: [data],
      virtualNetworkPeerings: [],
      enableDdosProtection: false,
      enableVmProtection: false,
    };

    const entity = {
      _key:
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev",
      _type: "azure_subnet",
      _class: ["Network"],
      _rawData: [{ name: "default", rawData: data }],
      name: "j1dev",
      displayName: "j1dev (10.0.2.0/24)",
      resourceGroup: "j1dev",
      region: "eastus",
      environment: "j1dev",
      webLink: webLinker.portalResourceUrl(
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev",
      ),
      CIDR: "10.0.2.0/24",
      internal: true,
      public: false,
    };

    expect(createSubnetEntity(webLinker, vnet, data)).toEqual(entity);
  });
});
