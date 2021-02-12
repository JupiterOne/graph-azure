import {
  AzureFirewall,
  NetworkInterface,
  NetworkSecurityGroup,
  PublicIPAddress,
  Subnet,
  VirtualNetwork,
} from '@azure/arm-network/esm/models';
import { Relationship } from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../../azure';
import { NetworkEntities } from '../constants';
import {
  createAzureFirewallEntity,
  createNetworkInterfaceEntity,
  createNetworkSecurityGroupEntity,
  createNetworkSecurityGroupNicRelationship,
  createNetworkSecurityGroupSubnetRelationship,
  createPublicIPAddressEntity,
  createSubnetEntity,
  createVirtualNetworkEntity,
  createVirtualNetworkSubnetRelationship,
} from './index';

const webLinker = createAzureWebLinker('something.onmicrosoft.com');

describe('createAzureFirewallEntity', () => {
  test('properties transferred', () => {
    const data: AzureFirewall = {
      additionalProperties: {},
      applicationRuleCollections: [],
      etag: expect.any(String),
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/azureFirewalls/j1dev_firewall',
      ipConfigurations: [
        {
          etag: expect.any(String),
          id:
            '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/azureFirewalls/j1dev_firewall/azureFirewallIpConfigurations/configuration',
          name: 'configuration',
          privateIPAddress: '10.0.1.4',
          provisioningState: 'Succeeded',
          publicIPAddress: {
            id:
              '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev_az_fw_pub_ip',
          },
          subnet: {
            id:
              '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_az_fw_vm/subnets/AzureFirewallSubnet',
          },
          type:
            'Microsoft.Network/azureFirewalls/azureFirewallIpConfigurations',
        },
      ],
      location: 'eastus',
      name: 'j1dev_firewall',
      natRuleCollections: [],
      networkRuleCollections: [],
      provisioningState: 'Succeeded',
      sku: { name: 'AZFW_VNet', tier: 'Standard' },
      tags: {},
      threatIntelMode: 'Alert',
      type: 'Microsoft.Network/azureFirewalls',
    };

    expect(createAzureFirewallEntity(webLinker, data)).toEqual({
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/azureFirewalls/j1dev_firewall',
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/azureFirewalls/j1dev_firewall',
      _class: NetworkEntities.AZURE_FIREWALL._class,
      _type: NetworkEntities.AZURE_FIREWALL._type,
      category: ['network'],
      createdOn: undefined,
      displayName: 'j1dev_firewall',
      name: 'j1dev_firewall',
      _rawData: [{ name: 'default', rawData: data }],
      provisioningState: 'Succeeded',
      region: 'eastus',
      threatIntelMode: 'Alert',
      type: 'Microsoft.Network/azureFirewalls',
      webLink:
        'https://portal.azure.com/#@something.onmicrosoft.com/resource/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/azureFirewalls/j1dev_firewall',
    });
  });
});

describe('createNetworkInterfaceEntity', () => {
  test('properties transferred', () => {
    const data: NetworkInterface = {
      name: 'j1dev',
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev',
      etag: 'W/"39076d6b-2dd2-4096-9af4-8df45d4fa312"',
      location: 'eastus',
      tags: {
        environment: 'j1dev',
      },
      provisioningState: 'Succeeded',
      resourceGuid: 'ab964820-ee40-4f8d-bfd9-0349b8b4f316',
      ipConfigurations: [
        {
          name: 'j1devConfiguration',
          id:
            '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev/ipConfigurations/j1devConfiguration',
          etag: 'W/"39076d6b-2dd2-4096-9af4-8df45d4fa312"',
          provisioningState: 'Succeeded',
          privateIPAddress: '10.0.2.4',
          privateIPAllocationMethod: 'Dynamic',
          publicIPAddress: {
            id:
              '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev',
          },
          subnet: {
            id:
              '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev',
          },
          primary: true,
          privateIPAddressVersion: 'IPv4',
        },
      ],
      dnsSettings: {
        dnsServers: [],
        appliedDnsServers: [],
        internalDomainNameSuffix:
          'iqtrdnvdttbudhqhotjymog2pe.bx.internal.cloudapp.net',
      },
      macAddress: '00-0D-3A-14-85-87',
      enableAcceleratedNetworking: false,
      enableIPForwarding: false,
      networkSecurityGroup: {
        id:
          '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev',
      },
      primary: true,
      virtualMachine: {
        id:
          '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Compute/virtualMachines/j1dev',
      },
      hostedWorkloads: [],
      tapConfigurations: [],
      type: 'Microsoft.Network/networkInterfaces',
    };

    expect(
      createNetworkInterfaceEntity(webLinker, data, ['192.168.0.1']),
    ).toEqual({
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev',
      _type: 'azure_nic',
      _class: 'NetworkInterface',
      _rawData: [{ name: 'default', rawData: data }],
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev',
      resourceGuid: 'ab964820-ee40-4f8d-bfd9-0349b8b4f316',
      resourceGroup: 'j1dev',
      displayName: 'j1dev',
      virtualMachineId:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Compute/virtualMachines/j1dev',
      type: 'Microsoft.Network/networkInterfaces',
      region: 'eastus',
      publicIp: ['192.168.0.1'],
      publicIpAddress: ['192.168.0.1'],
      privateIp: ['10.0.2.4'],
      privateIpAddress: ['10.0.2.4'],
      macAddress: '00-0D-3A-14-85-87',
      securityGroupId:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev',
      ipForwarding: false,
      webLink: webLinker.portalResourceUrl(
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev',
      ),
      'tag.environment': 'j1dev',
    });
  });
});

describe('createPublicIPAddressEntity', () => {
  test('properties transferred', () => {
    const data: PublicIPAddress = {
      name: 'j1dev',
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev',
      etag: 'W/"0d9bdc1d-3e57-42eb-8a6b-9be1241ef5bc"',
      location: 'eastus',
      tags: {
        environment: 'j1dev',
      },
      provisioningState: 'Succeeded',
      resourceGuid: 'd908c31d-c93a-4359-987f-8cfdd1b65a61',
      ipAddress: '13.90.252.212',
      publicIPAddressVersion: 'IPv4',
      publicIPAllocationMethod: 'Dynamic',
      idleTimeoutInMinutes: 4,
      ipTags: [],
      ipConfiguration: {
        id:
          '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev/ipConfigurations/j1devConfiguration',
      },
      type: 'Microsoft.Network/publicIPAddresses',
      sku: {
        name: 'Basic',
      },
    };

    expect(createPublicIPAddressEntity(webLinker, data)).toEqual({
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev',
      _type: 'azure_public_ip',
      _class: 'IpAddress',
      _rawData: [{ name: 'default', rawData: data }],
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev',
      resourceGuid: 'd908c31d-c93a-4359-987f-8cfdd1b65a61',
      resourceGroup: 'j1dev',
      displayName: 'j1dev',
      type: 'Microsoft.Network/publicIPAddresses',
      region: 'eastus',
      publicIp: '13.90.252.212',
      publicIpAddress: '13.90.252.212',
      public: true,
      webLink: webLinker.portalResourceUrl(
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev',
      ),
      sku: 'Basic',
      'tag.environment': 'j1dev',
    });
  });
});

describe('createNetworkSecurityGroupEntity', () => {
  const data: NetworkSecurityGroup = {
    name: 'j1dev',
    id:
      '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev',
    etag: 'W/"276c40f4-6483-4bce-9fce-b0d710c4fd92"',
    type: 'Microsoft.Network/networkSecurityGroups',
    location: 'eastus',
    tags: {
      environment: 'j1dev',
    },
    provisioningState: 'Succeeded',
    resourceGuid: '48b6006f-a105-4a29-9466-8fccd73b4e79',
    securityRules: [
      {
        name: 'SSH',
        id:
          '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/securityRules/SSH',
        etag: 'W/"276c40f4-6483-4bce-9fce-b0d710c4fd92"',
        provisioningState: 'Succeeded',
        protocol: 'Tcp',
        sourcePortRange: '*',
        destinationPortRange: '22',
        sourceAddressPrefix: '*',
        destinationAddressPrefix: '*',
        access: 'Allow',
        priority: 1001,
        direction: 'Inbound',
        sourcePortRanges: [],
        destinationPortRanges: [],
        sourceAddressPrefixes: [],
        destinationAddressPrefixes: [],
      },
    ],
    defaultSecurityRules: [
      {
        name: 'AllowVnetInBound',
        id:
          '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/AllowVnetInBound',
        etag: 'W/"276c40f4-6483-4bce-9fce-b0d710c4fd92"',
        provisioningState: 'Succeeded',
        description: 'Allow inbound traffic from all VMs in VNET',
        protocol: '*',
        sourcePortRange: '*',
        destinationPortRange: '*',
        sourceAddressPrefix: 'VirtualNetwork',
        destinationAddressPrefix: 'VirtualNetwork',
        access: 'Allow',
        priority: 65000,
        direction: 'Inbound',
        sourcePortRanges: [],
        destinationPortRanges: [],
        sourceAddressPrefixes: [],
        destinationAddressPrefixes: [],
      },
      {
        name: 'AllowAzureLoadBalancerInBound',
        id:
          '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/AllowAzureLoadBalancerInBound',
        etag: 'W/"276c40f4-6483-4bce-9fce-b0d710c4fd92"',
        provisioningState: 'Succeeded',
        description: 'Allow inbound traffic from azure load balancer',
        protocol: '*',
        sourcePortRange: '*',
        destinationPortRange: '*',
        sourceAddressPrefix: 'AzureLoadBalancer',
        destinationAddressPrefix: '*',
        access: 'Allow',
        priority: 65001,
        direction: 'Inbound',
        sourcePortRanges: [],
        destinationPortRanges: [],
        sourceAddressPrefixes: [],
        destinationAddressPrefixes: [],
      },
      {
        name: 'DenyAllInBound',
        id:
          '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/DenyAllInBound',
        etag: 'W/"276c40f4-6483-4bce-9fce-b0d710c4fd92"',
        provisioningState: 'Succeeded',
        description: 'Deny all inbound traffic',
        protocol: '*',
        sourcePortRange: '*',
        destinationPortRange: '*',
        sourceAddressPrefix: '*',
        destinationAddressPrefix: '*',
        access: 'Deny',
        priority: 65500,
        direction: 'Inbound',
        sourcePortRanges: [],
        destinationPortRanges: [],
        sourceAddressPrefixes: [],
        destinationAddressPrefixes: [],
      },
      {
        name: 'AllowVnetOutBound',
        id:
          '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/AllowVnetOutBound',
        etag: 'W/"276c40f4-6483-4bce-9fce-b0d710c4fd92"',
        provisioningState: 'Succeeded',
        description: 'Allow outbound traffic from all VMs to all VMs in VNET',
        protocol: '*',
        sourcePortRange: '*',
        destinationPortRange: '*',
        sourceAddressPrefix: 'VirtualNetwork',
        destinationAddressPrefix: 'VirtualNetwork',
        access: 'Allow',
        priority: 65000,
        direction: 'Outbound',
        sourcePortRanges: [],
        destinationPortRanges: [],
        sourceAddressPrefixes: [],
        destinationAddressPrefixes: [],
      },
      {
        name: 'AllowInternetOutBound',
        id:
          '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/AllowInternetOutBound',
        etag: 'W/"276c40f4-6483-4bce-9fce-b0d710c4fd92"',
        provisioningState: 'Succeeded',
        description: 'Allow outbound traffic from all VMs to Internet',
        protocol: '*',
        sourcePortRange: '*',
        destinationPortRange: '*',
        sourceAddressPrefix: '*',
        destinationAddressPrefix: 'Internet',
        access: 'Allow',
        priority: 65001,
        direction: 'Outbound',
        sourcePortRanges: [],
        destinationPortRanges: [],
        sourceAddressPrefixes: [],
        destinationAddressPrefixes: [],
      },
      {
        name: 'DenyAllOutBound',
        id:
          '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/DenyAllOutBound',
        etag: 'W/"276c40f4-6483-4bce-9fce-b0d710c4fd92"',
        provisioningState: 'Succeeded',
        description: 'Deny all outbound traffic',
        protocol: '*',
        sourcePortRange: '*',
        destinationPortRange: '*',
        sourceAddressPrefix: '*',
        destinationAddressPrefix: '*',
        access: 'Deny',
        priority: 65500,
        direction: 'Outbound',
        sourcePortRanges: [],
        destinationPortRanges: [],
        sourceAddressPrefixes: [],
        destinationAddressPrefixes: [],
      },
    ],
    networkInterfaces: [
      {
        id:
          '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev',
      },
    ],
    subnets: [
      {
        id:
          '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev',
      },
    ],
  };

  const entity = {
    _key:
      '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev',
    _type: 'azure_security_group',
    _class: ['Firewall'],
    _rawData: [{ name: 'default', rawData: data }],
    createdOn: undefined,
    id:
      '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev',
    name: 'j1dev',
    displayName: 'j1dev',
    resourceGroup: 'j1dev',
    region: 'eastus',
    environment: 'j1dev',
    webLink: webLinker.portalResourceUrl(
      '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev',
    ),
    category: ['network', 'host'],
    isWideOpen: false,
    'tag.environment': 'j1dev',
  };

  test('properties transferred', () => {
    expect(createNetworkSecurityGroupEntity(webLinker, data)).toEqual(entity);
  });

  test('category when only networkInterfaces', () => {
    expect(
      createNetworkSecurityGroupEntity(webLinker, { ...data, subnets: [] }),
    ).toMatchObject({ category: ['host'] });
  });

  test('category when only subnets', () => {
    expect(
      createNetworkSecurityGroupEntity(webLinker, {
        ...data,
        networkInterfaces: [],
      }),
    ).toMatchObject({ category: ['network'] });
  });
});

describe('createVirtualNetworkEntity', () => {
  test('properties transferred', () => {
    const data: VirtualNetwork = {
      name: 'j1dev',
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev',
      etag: 'W/"4f9fb61f-5fa0-49c1-afbe-4c7d93bcab4c"',
      type: 'Microsoft.Network/virtualNetworks',
      location: 'eastus',
      tags: {
        environment: 'j1dev',
      },
      provisioningState: 'Succeeded',
      resourceGuid: 'db9a7800-856d-4758-8f1d-8bbd7c77a11c',
      addressSpace: {
        addressPrefixes: ['10.0.0.0/16'],
      },
      dhcpOptions: {
        dnsServers: [],
      },
      subnets: [
        {
          name: 'j1dev',
          id:
            '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev',
          etag: 'W/"4f9fb61f-5fa0-49c1-afbe-4c7d93bcab4c"',
          provisioningState: 'Succeeded',
          addressPrefix: '10.0.2.0/24',
          ipConfigurations: [
            {
              id:
                '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev/ipConfigurations/j1devConfiguration',
            },
          ],
          serviceEndpoints: [],
          delegations: [],
          privateEndpointNetworkPolicies: 'Enabled',
          privateLinkServiceNetworkPolicies: 'Enabled',
        },
      ],
      virtualNetworkPeerings: [],
      enableDdosProtection: false,
      enableVmProtection: false,
    };

    const entity = {
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev',
      _type: 'azure_vnet',
      _class: ['Network'],
      _rawData: [{ name: 'default', rawData: data }],
      createdOn: undefined,
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev',
      name: 'j1dev',
      displayName: 'j1dev (10.0.0.0/16)',
      resourceGroup: 'j1dev',
      region: 'eastus',
      environment: 'j1dev',
      webLink: webLinker.portalResourceUrl(
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev',
      ),
      CIDR: '10.0.0.0/16',
      internal: true,
      public: false,
      'tag.environment': 'j1dev',
    };

    expect(createVirtualNetworkEntity(webLinker, data)).toEqual(entity);
  });
});

describe('createSubnetEntity', () => {
  test('properties transferred', () => {
    const data: Subnet = {
      name: 'j1dev',
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev',
      etag: 'W/"4f9fb61f-5fa0-49c1-afbe-4c7d93bcab4c"',
      provisioningState: 'Succeeded',
      addressPrefix: '10.0.2.0/24',
      ipConfigurations: [
        {
          id:
            '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev/ipConfigurations/j1devConfiguration',
        },
      ],
      serviceEndpoints: [],
      delegations: [],
      privateEndpointNetworkPolicies: 'Enabled',
      privateLinkServiceNetworkPolicies: 'Enabled',
    };

    const vnet: VirtualNetwork = {
      name: 'j1dev',
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev',
      etag: 'W/"4f9fb61f-5fa0-49c1-afbe-4c7d93bcab4c"',
      type: 'Microsoft.Network/virtualNetworks',
      location: 'eastus',
      tags: {
        environment: 'j1dev',
      },
      provisioningState: 'Succeeded',
      resourceGuid: 'db9a7800-856d-4758-8f1d-8bbd7c77a11c',
      addressSpace: {
        addressPrefixes: ['10.0.0.0/16'],
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
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev',
      _type: 'azure_subnet',
      _class: ['Network'],
      _rawData: [{ name: 'default', rawData: data }],
      createdOn: undefined,
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev',
      name: 'j1dev',
      displayName: 'j1dev (10.0.2.0/24)',
      resourceGroup: 'j1dev',
      region: 'eastus',
      environment: 'j1dev',
      webLink: webLinker.portalResourceUrl(
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev',
      ),
      CIDR: '10.0.2.0/24',
      internal: true,
      public: false,
    };

    expect(createSubnetEntity(webLinker, vnet, data)).toEqual(entity);
  });
});

describe('createNetworkSecurityGroupNicRelationship', () => {
  test('properties transferred', () => {
    const sg: NetworkSecurityGroup = {
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev',
    };

    const nic: NetworkInterface = {
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev',
    };

    const relationship: Relationship = {
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev|protects|/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev',
      _type: 'azure_security_group_protects_nic',
      _class: 'PROTECTS',
      _fromEntityKey:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev',
      _toEntityKey:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev',
      displayName: 'PROTECTS',
    };

    expect(createNetworkSecurityGroupNicRelationship(sg, nic)).toEqual(
      relationship,
    );
  });
});

describe('createVirtualNetworkSubnetRelationship', () => {
  test('properties transferred', () => {
    const subnet: Subnet = {
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev',
    };

    const vnet: VirtualNetwork = {
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev',
    };

    const relationship: Relationship = {
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev|contains|/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev',
      _type: 'azure_vnet_contains_subnet',
      _class: 'CONTAINS',
      _fromEntityKey:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev',
      _toEntityKey:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev',
      displayName: 'CONTAINS',
    };

    expect(createVirtualNetworkSubnetRelationship(vnet, subnet)).toEqual(
      relationship,
    );
  });
});

describe('createSecurityGroupSubnetRelationship', () => {
  test('properties transferred', () => {
    const sg: NetworkSecurityGroup = {
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev',
    };

    const subnet: Subnet = {
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev',
    };

    const relationship: Relationship = {
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev|protects|/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev',
      _type: 'azure_security_group_protects_subnet',
      _class: 'PROTECTS',
      _fromEntityKey:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev',
      _toEntityKey:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev',
      displayName: 'PROTECTS',
    };

    expect(createNetworkSecurityGroupSubnetRelationship(sg, subnet)).toEqual(
      relationship,
    );
  });
});
