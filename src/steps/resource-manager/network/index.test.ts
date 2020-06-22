import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';

import { setupAzureRecording } from '../../../../test/helpers/recording';
import instanceConfig from '../../../../test/integrationInstanceConfig';
import { IntegrationConfig } from '../../../types';
import { fetchAccount } from '../../active-directory';
import {
  fetchLoadBalancers,
  fetchNetworkInterfaces,
  fetchNetworkSecurityGroups,
  fetchPublicIPAddresses,
  fetchVirtualNetworks,
} from './';

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

test('network steps', async () => {
  recording = setupAzureRecording({
    directory: __dirname,
    name: 'network-steps',
  });

  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig,
  });

  await fetchAccount(context);
  await fetchPublicIPAddresses(context);
  await fetchNetworkInterfaces(context);
  await fetchNetworkSecurityGroups(context);
  await fetchVirtualNetworks(context);
  await fetchLoadBalancers(context);

  expect(context.jobState.collectedEntities).toEqual([
    expect.objectContaining({
      _class: ['Account'],
      _key: 'azure_account_local-integration-instance',
      _rawData: [expect.objectContaining({ name: 'default' })],
      _type: 'azure_account',
      createdOn: undefined,
      defaultDomain: expect.any(String),
      displayName: 'Local Integration',
      id: 'a76fc728-0cba-45f0-a9eb-d45207e14513',
      name: 'Default Directory',
      organizationName: 'Default Directory',
      verifiedDomains: expect.any(Array),
    }),
    expect.objectContaining({
      _class: 'IpAddress',
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev',
      _rawData: [expect.objectContaining({ name: 'default' })],
      _type: 'azure_public_ip',
      displayName: 'j1dev',
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev',
      public: true,
      publicIp: '52.188.119.30',
      publicIpAddress: '52.188.119.30',
      region: 'eastus',
      resourceGroup: 'j1dev',
      resourceGuid: 'e91e06bc-4c1a-42e1-bf2e-87c2a36ebdd2',
      sku: 'Basic',
      'tag.environment': 'j1dev',
      type: 'Microsoft.Network/publicIPAddresses',
      webLink:
        'https://portal.azure.com/#@adamjupiteronehotmailcom.onmicrosoft.com/resource/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev',
    }),
    expect.objectContaining({
      _class: 'NetworkInterface',
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev',
      _rawData: [expect.objectContaining({ name: 'default' })],
      _type: 'azure_nic',
      displayName: 'j1dev',
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev',
      ipForwarding: false,
      macAddress: '00-0D-3A-98-B8-2E',
      privateIp: ['10.0.2.4'],
      privateIpAddress: ['10.0.2.4'],
      publicIp: ['52.188.119.30'],
      publicIpAddress: ['52.188.119.30'],
      region: 'eastus',
      resourceGroup: 'j1dev',
      resourceGuid: '9a2f2357-0821-48b7-89dc-7a6af8d31a95',
      securityGroupId:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev',
      'tag.environment': 'j1dev',
      type: 'Microsoft.Network/networkInterfaces',
      virtualMachineId:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Compute/virtualMachines/j1dev',
      webLink:
        'https://portal.azure.com/#@adamjupiteronehotmailcom.onmicrosoft.com/resource/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev',
    }),
    expect.objectContaining({
      _class: ['Firewall'],
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev',
      _rawData: [expect.objectContaining({ name: 'default' })],
      _type: 'azure_security_group',
      category: ['network', 'host'],
      createdOn: undefined,
      displayName: 'j1dev',
      environment: 'j1dev',
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev',
      isWideOpen: false,
      name: 'j1dev',
      region: 'eastus',
      resourceGroup: 'j1dev',
      'tag.environment': 'j1dev',
      webLink:
        'https://portal.azure.com/#@adamjupiteronehotmailcom.onmicrosoft.com/resource/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev',
    }),
    expect.objectContaining({
      CIDR: '10.0.2.0/24',
      _class: ['Network'],
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev',
      _rawData: [expect.objectContaining({ name: 'default' })],
      _type: 'azure_subnet',
      createdOn: undefined,
      displayName: 'j1dev (10.0.2.0/24)',
      environment: 'j1dev',
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev',
      internal: true,
      name: 'j1dev',
      public: false,
      region: 'eastus',
      resourceGroup: 'j1dev',
      webLink:
        'https://portal.azure.com/#@adamjupiteronehotmailcom.onmicrosoft.com/resource/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev',
    }),
    expect.objectContaining({
      CIDR: '10.0.0.0/16',
      _class: ['Network'],
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev',
      _rawData: [expect.objectContaining({ name: 'default' })],
      _type: 'azure_vnet',
      createdOn: undefined,
      displayName: 'j1dev (10.0.0.0/16)',
      environment: 'j1dev',
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev',
      internal: true,
      name: 'j1dev',
      public: false,
      region: 'eastus',
      resourceGroup: 'j1dev',
      'tag.environment': 'j1dev',
      webLink:
        'https://portal.azure.com/#@adamjupiteronehotmailcom.onmicrosoft.com/resource/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev',
    }),
  ]);

  expect(context.jobState.collectedRelationships).toEqual([
    {
      _class: 'PROTECTS',
      _fromEntityKey:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev',
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev|protects|/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev',
      _toEntityKey:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev',
      _type: 'azure_security_group_protects_nic',
      displayName: 'PROTECTS',
    },
    {
      _class: 'ALLOWS',
      _key:
        'azure_security_group_rule:/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/AllowVnetInBound:*:Service:azure_virtual_network:VirtualNetwork',
      _mapping: {
        relationshipDirection: 'REVERSE',
        skipTargetCreation: false,
        sourceEntityKey:
          '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev',
        targetEntity: {
          _class: 'Service',
          _type: 'azure_virtual_network',
          displayName: 'VirtualNetwork',
        },
        targetFilterKeys: [['_class', '_type', 'displayName']],
      },
      _type: 'azure_security_group_rule',
      access: 'Allow',
      description: 'Allow inbound traffic from all VMs in VNET',
      destinationAddressPrefix: 'VirtualNetwork',
      destinationPortRange: '*',
      direction: 'Inbound',
      displayName: 'ALLOWS',
      egress: false,
      etag: 'W/"5bd8a3ea-d7a2-4f45-83f0-bef001c1ba5a"',
      fromPort: 0,
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/AllowVnetInBound',
      inbound: true,
      ingress: true,
      ipProtocol: '*',
      name: 'AllowVnetInBound',
      outbound: false,
      portRange: '*',
      priority: 65000,
      protocol: '*',
      provisioningState: 'Succeeded',
      ruleNumber: 65000,
      sourceAddressPrefix: 'VirtualNetwork',
      sourcePortRange: '*',
      toPort: 65535,
      type: 'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
    },
    {
      _class: 'ALLOWS',
      _key:
        'azure_security_group_rule:/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/AllowAzureLoadBalancerInBound:*:Service:azure_load_balancer:AzureLoadBalancer',
      _mapping: {
        relationshipDirection: 'REVERSE',
        skipTargetCreation: false,
        sourceEntityKey:
          '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev',
        targetEntity: {
          _class: 'Service',
          _type: 'azure_load_balancer',
          displayName: 'AzureLoadBalancer',
        },
        targetFilterKeys: [['_class', '_type', 'displayName']],
      },
      _type: 'azure_security_group_rule',
      access: 'Allow',
      description: 'Allow inbound traffic from azure load balancer',
      destinationAddressPrefix: '*',
      destinationPortRange: '*',
      direction: 'Inbound',
      displayName: 'ALLOWS',
      egress: false,
      etag: 'W/"5bd8a3ea-d7a2-4f45-83f0-bef001c1ba5a"',
      fromPort: 0,
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/AllowAzureLoadBalancerInBound',
      inbound: true,
      ingress: true,
      ipProtocol: '*',
      name: 'AllowAzureLoadBalancerInBound',
      outbound: false,
      portRange: '*',
      priority: 65001,
      protocol: '*',
      provisioningState: 'Succeeded',
      ruleNumber: 65001,
      sourceAddressPrefix: 'AzureLoadBalancer',
      sourcePortRange: '*',
      toPort: 65535,
      type: 'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
    },
    {
      _class: 'DENIES',
      _key:
        'azure_security_group_rule:/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/DenyAllInBound:*:internet',
      _mapping: {
        relationshipDirection: 'REVERSE',
        skipTargetCreation: false,
        sourceEntityKey:
          '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev',
        targetEntity: {
          CIDR: '0.0.0.0/0',
          CIDRv6: '::/0',
          _class: ['Internet', 'Network'],
          _key: 'global:internet',
          _type: 'internet',
          displayName: 'Internet',
          public: true,
        },
        targetFilterKeys: [['_key']],
      },
      _type: 'azure_security_group_rule',
      access: 'Deny',
      description: 'Deny all inbound traffic',
      destinationAddressPrefix: '*',
      destinationPortRange: '*',
      direction: 'Inbound',
      displayName: 'DENIES',
      egress: false,
      etag: 'W/"5bd8a3ea-d7a2-4f45-83f0-bef001c1ba5a"',
      fromPort: 0,
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/DenyAllInBound',
      inbound: true,
      ingress: true,
      ipProtocol: '*',
      name: 'DenyAllInBound',
      outbound: false,
      portRange: '*',
      priority: 65500,
      protocol: '*',
      provisioningState: 'Succeeded',
      ruleNumber: 65500,
      sourceAddressPrefix: '*',
      sourcePortRange: '*',
      toPort: 65535,
      type: 'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
    },
    {
      _class: 'ALLOWS',
      _key:
        'azure_security_group_rule:/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/AllowVnetOutBound:*:Service:azure_virtual_network:VirtualNetwork',
      _mapping: {
        relationshipDirection: 'FORWARD',
        skipTargetCreation: false,
        sourceEntityKey:
          '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev',
        targetEntity: {
          _class: 'Service',
          _type: 'azure_virtual_network',
          displayName: 'VirtualNetwork',
        },
        targetFilterKeys: [['_class', '_type', 'displayName']],
      },
      _type: 'azure_security_group_rule',
      access: 'Allow',
      description: 'Allow outbound traffic from all VMs to all VMs in VNET',
      destinationAddressPrefix: 'VirtualNetwork',
      destinationPortRange: '*',
      direction: 'Outbound',
      displayName: 'ALLOWS',
      egress: true,
      etag: 'W/"5bd8a3ea-d7a2-4f45-83f0-bef001c1ba5a"',
      fromPort: 0,
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/AllowVnetOutBound',
      inbound: false,
      ingress: false,
      ipProtocol: '*',
      name: 'AllowVnetOutBound',
      outbound: true,
      portRange: '*',
      priority: 65000,
      protocol: '*',
      provisioningState: 'Succeeded',
      ruleNumber: 65000,
      sourceAddressPrefix: 'VirtualNetwork',
      sourcePortRange: '*',
      toPort: 65535,
      type: 'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
    },
    {
      _class: 'ALLOWS',
      _key:
        'azure_security_group_rule:/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/AllowInternetOutBound:*:internet',
      _mapping: {
        relationshipDirection: 'FORWARD',
        skipTargetCreation: false,
        sourceEntityKey:
          '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev',
        targetEntity: {
          CIDR: '0.0.0.0/0',
          CIDRv6: '::/0',
          _class: ['Internet', 'Network'],
          _key: 'global:internet',
          _type: 'internet',
          displayName: 'Internet',
          public: true,
        },
        targetFilterKeys: [['_key']],
      },
      _type: 'azure_security_group_rule',
      access: 'Allow',
      description: 'Allow outbound traffic from all VMs to Internet',
      destinationAddressPrefix: 'Internet',
      destinationPortRange: '*',
      direction: 'Outbound',
      displayName: 'ALLOWS',
      egress: true,
      etag: 'W/"5bd8a3ea-d7a2-4f45-83f0-bef001c1ba5a"',
      fromPort: 0,
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/AllowInternetOutBound',
      inbound: false,
      ingress: false,
      ipProtocol: '*',
      name: 'AllowInternetOutBound',
      outbound: true,
      portRange: '*',
      priority: 65001,
      protocol: '*',
      provisioningState: 'Succeeded',
      ruleNumber: 65001,
      sourceAddressPrefix: '*',
      sourcePortRange: '*',
      toPort: 65535,
      type: 'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
    },
    {
      _class: 'DENIES',
      _key:
        'azure_security_group_rule:/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/DenyAllOutBound:*:internet',
      _mapping: {
        relationshipDirection: 'FORWARD',
        skipTargetCreation: false,
        sourceEntityKey:
          '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev',
        targetEntity: {
          CIDR: '0.0.0.0/0',
          CIDRv6: '::/0',
          _class: ['Internet', 'Network'],
          _key: 'global:internet',
          _type: 'internet',
          displayName: 'Internet',
          public: true,
        },
        targetFilterKeys: [['_key']],
      },
      _type: 'azure_security_group_rule',
      access: 'Deny',
      description: 'Deny all outbound traffic',
      destinationAddressPrefix: '*',
      destinationPortRange: '*',
      direction: 'Outbound',
      displayName: 'DENIES',
      egress: true,
      etag: 'W/"5bd8a3ea-d7a2-4f45-83f0-bef001c1ba5a"',
      fromPort: 0,
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/DenyAllOutBound',
      inbound: false,
      ingress: false,
      ipProtocol: '*',
      name: 'DenyAllOutBound',
      outbound: true,
      portRange: '*',
      priority: 65500,
      protocol: '*',
      provisioningState: 'Succeeded',
      ruleNumber: 65500,
      sourceAddressPrefix: '*',
      sourcePortRange: '*',
      toPort: 65535,
      type: 'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
    },
    {
      _class: 'ALLOWS',
      _key:
        'azure_security_group_rule:/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/securityRules/SSH:22:internet',
      _mapping: {
        relationshipDirection: 'REVERSE',
        skipTargetCreation: false,
        sourceEntityKey:
          '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev',
        targetEntity: {
          CIDR: '0.0.0.0/0',
          CIDRv6: '::/0',
          _class: ['Internet', 'Network'],
          _key: 'global:internet',
          _type: 'internet',
          displayName: 'Internet',
          public: true,
        },
        targetFilterKeys: [['_key']],
      },
      _type: 'azure_security_group_rule',
      access: 'Allow',
      destinationAddressPrefix: '*',
      destinationPortRange: '22',
      direction: 'Inbound',
      displayName: 'ALLOWS',
      egress: false,
      etag: 'W/"5bd8a3ea-d7a2-4f45-83f0-bef001c1ba5a"',
      fromPort: 22,
      id:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/securityRules/SSH',
      inbound: true,
      ingress: true,
      ipProtocol: 'tcp',
      name: 'SSH',
      outbound: false,
      portRange: '22',
      priority: 1001,
      protocol: 'tcp',
      provisioningState: 'Succeeded',
      ruleNumber: 1001,
      sourceAddressPrefix: '*',
      sourcePortRange: '*',
      toPort: 22,
      type: 'Microsoft.Network/networkSecurityGroups/securityRules',
    },
    {
      _class: 'CONTAINS',
      _fromEntityKey:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev',
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev|contains|/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev',
      _toEntityKey:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev',
      _type: 'azure_vnet_contains_subnet',
      displayName: 'CONTAINS',
    },
    {
      _class: 'PROTECTS',
      _fromEntityKey:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev',
      _key:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev|protects|/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev',
      _toEntityKey:
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev',
      _type: 'azure_security_group_protects_subnet',
      displayName: 'PROTECTS',
    },
  ]);
}, 120000);