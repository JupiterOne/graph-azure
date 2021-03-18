import {
  AzureFirewall,
  FlowLog,
  NetworkInterface,
  NetworkSecurityGroup,
  NetworkWatcher,
  PublicIPAddress,
  VirtualNetwork,
} from '@azure/arm-network/esm/models';
import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';

import {
  getMatchRequestsBy,
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { configFromEnv } from '../../../../test/integrationInstanceConfig';
import { IntegrationConfig } from '../../../types';
import { NetworkClient } from './client';

let recording: Recording;
let config: IntegrationConfig;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

describe('iterateAzureFirewalls', () => {
  let azureFirewalls: AzureFirewall[];

  beforeAll(async () => {
    config = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: '4a17becb-fb42-4633-b5c8-5ab66f28d195',
      subscriptionId: '87f62f44-9dad-4284-a08f-f2fb3d8b528a',
    };

    const resourceGroupName = 'j1dev';

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateAzureFirewalls',
    });

    const client = new NetworkClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    azureFirewalls = [];

    await client.iterateAzureFirewalls(resourceGroupName, (e) => {
      azureFirewalls.push(e);
    });
  });

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should fetch Azure Network Azure Firewalls', () => {
    expect(azureFirewalls).toContainEqual(
      expect.objectContaining({
        additionalProperties: {},
        applicationRuleCollections: [],
        etag: expect.any(String),
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/azureFirewalls/j1dev_firewall`,
        ipConfigurations: [
          {
            etag: expect.any(String),
            id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/azureFirewalls/j1dev_firewall/azureFirewallIpConfigurations/configuration`,
            name: 'configuration',
            privateIPAddress: '10.0.1.4',
            provisioningState: 'Succeeded',
            publicIPAddress: {
              id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev_az_fw_pub_ip`,
            },
            subnet: {
              id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_az_fw_vm/subnets/AzureFirewallSubnet`,
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
      }),
    );
  });
});

describe('iterateNetworkInterfaces', () => {
  let networkInterfaces: NetworkInterface[];

  beforeAll(async () => {
    config = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: '4a17becb-fb42-4633-b5c8-5ab66f28d195',
      subscriptionId: '87f62f44-9dad-4284-a08f-f2fb3d8b528a',
    };

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateNetworkInterfaces',
    });

    const client = new NetworkClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    networkInterfaces = [];

    await client.iterateNetworkInterfaces((e) => {
      networkInterfaces.push(e);
    });
  });

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should fetch Azure Network Network Interfaces', () => {
    expect(networkInterfaces).toContainEqual(
      expect.objectContaining({
        dnsSettings: {
          appliedDnsServers: [],
          dnsServers: [],
          internalDomainNameSuffix: expect.any(String),
        },
        enableAcceleratedNetworking: false,
        enableIPForwarding: false,
        etag: expect.any(String),
        hostedWorkloads: [],
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev`,
        ipConfigurations: [
          {
            etag: expect.any(String),
            id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev/ipConfigurations/j1devConfiguration`,
            name: 'j1devConfiguration',
            primary: true,
            privateIPAddress: '10.0.2.4',
            privateIPAddressVersion: 'IPv4',
            privateIPAllocationMethod: 'Dynamic',
            provisioningState: 'Succeeded',
            publicIPAddress: {
              id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev`,
            },
            subnet: {
              id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev`,
            },
            type: 'Microsoft.Network/networkInterfaces/ipConfigurations',
          },
        ],
        location: 'eastus',
        name: 'j1dev',
        networkSecurityGroup: {
          id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev`,
        },
        provisioningState: 'Succeeded',
        resourceGuid: 'f2bebf3b-9118-4c11-8126-c54dc41b7f17',
        tags: { environment: 'j1dev' },
        tapConfigurations: [],
        type: 'Microsoft.Network/networkInterfaces',
      }),
    );
  });
});

describe('iterateNetworkSecurityGroups', () => {
  let securityGroups: NetworkSecurityGroup[];

  beforeAll(async () => {
    config = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: '4a17becb-fb42-4633-b5c8-5ab66f28d195',
      subscriptionId: '87f62f44-9dad-4284-a08f-f2fb3d8b528a',
    };

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateNetworkSecurityGroups',
    });

    const client = new NetworkClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    securityGroups = [];

    await client.iterateNetworkSecurityGroups((e) => {
      securityGroups.push(e);
    });
  });

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should fetch Azure Network Network Security Groups', () => {
    expect(securityGroups).toContainEqual(
      expect.objectContaining({
        defaultSecurityRules: [
          {
            access: 'Allow',
            description: 'Allow inbound traffic from all VMs in VNET',
            destinationAddressPrefix: 'VirtualNetwork',
            destinationAddressPrefixes: [],
            destinationPortRange: '*',
            destinationPortRanges: [],
            direction: 'Inbound',
            etag: expect.any(String),
            id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/AllowVnetInBound`,
            name: 'AllowVnetInBound',
            priority: 65000,
            protocol: '*',
            provisioningState: 'Succeeded',
            sourceAddressPrefix: 'VirtualNetwork',
            sourceAddressPrefixes: [],
            sourcePortRange: '*',
            sourcePortRanges: [],
            type:
              'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
          },
          {
            access: 'Allow',
            description: 'Allow inbound traffic from azure load balancer',
            destinationAddressPrefix: '*',
            destinationAddressPrefixes: [],
            destinationPortRange: '*',
            destinationPortRanges: [],
            direction: 'Inbound',
            etag: expect.any(String),
            id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/AllowAzureLoadBalancerInBound`,
            name: 'AllowAzureLoadBalancerInBound',
            priority: 65001,
            protocol: '*',
            provisioningState: 'Succeeded',
            sourceAddressPrefix: 'AzureLoadBalancer',
            sourceAddressPrefixes: [],
            sourcePortRange: '*',
            sourcePortRanges: [],
            type:
              'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
          },
          {
            access: 'Deny',
            description: 'Deny all inbound traffic',
            destinationAddressPrefix: '*',
            destinationAddressPrefixes: [],
            destinationPortRange: '*',
            destinationPortRanges: [],
            direction: 'Inbound',
            etag: expect.any(String),
            id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/DenyAllInBound`,
            name: 'DenyAllInBound',
            priority: 65500,
            protocol: '*',
            provisioningState: 'Succeeded',
            sourceAddressPrefix: '*',
            sourceAddressPrefixes: [],
            sourcePortRange: '*',
            sourcePortRanges: [],
            type:
              'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
          },
          {
            access: 'Allow',
            description:
              'Allow outbound traffic from all VMs to all VMs in VNET',
            destinationAddressPrefix: 'VirtualNetwork',
            destinationAddressPrefixes: [],
            destinationPortRange: '*',
            destinationPortRanges: [],
            direction: 'Outbound',
            etag: expect.any(String),
            id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/AllowVnetOutBound`,
            name: 'AllowVnetOutBound',
            priority: 65000,
            protocol: '*',
            provisioningState: 'Succeeded',
            sourceAddressPrefix: 'VirtualNetwork',
            sourceAddressPrefixes: [],
            sourcePortRange: '*',
            sourcePortRanges: [],
            type:
              'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
          },
          {
            access: 'Allow',
            description: 'Allow outbound traffic from all VMs to Internet',
            destinationAddressPrefix: 'Internet',
            destinationAddressPrefixes: [],
            destinationPortRange: '*',
            destinationPortRanges: [],
            direction: 'Outbound',
            etag: expect.any(String),
            id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/AllowInternetOutBound`,
            name: 'AllowInternetOutBound',
            priority: 65001,
            protocol: '*',
            provisioningState: 'Succeeded',
            sourceAddressPrefix: '*',
            sourceAddressPrefixes: [],
            sourcePortRange: '*',
            sourcePortRanges: [],
            type:
              'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
          },
          {
            access: 'Deny',
            description: 'Deny all outbound traffic',
            destinationAddressPrefix: '*',
            destinationAddressPrefixes: [],
            destinationPortRange: '*',
            destinationPortRanges: [],
            direction: 'Outbound',
            etag: expect.any(String),
            id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/DenyAllOutBound`,
            name: 'DenyAllOutBound',
            priority: 65500,
            protocol: '*',
            provisioningState: 'Succeeded',
            sourceAddressPrefix: '*',
            sourceAddressPrefixes: [],
            sourcePortRange: '*',
            sourcePortRanges: [],
            type:
              'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
          },
        ],
        etag: expect.any(String),
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev`,
        location: 'eastus',
        name: 'j1dev',
        networkInterfaces: [
          {
            id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev`,
          },
        ],
        provisioningState: 'Succeeded',
        resourceGuid: expect.any(String),
        securityRules: [
          {
            access: 'Allow',
            destinationAddressPrefix: '*',
            destinationAddressPrefixes: [],
            destinationPortRange: '22',
            destinationPortRanges: [],
            direction: 'Inbound',
            etag: expect.any(String),
            id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/securityRules/SSH`,
            name: 'SSH',
            priority: 1001,
            protocol: 'Tcp',
            provisioningState: 'Succeeded',
            sourceAddressPrefix: '*',
            sourceAddressPrefixes: [],
            sourcePortRange: '*',
            sourcePortRanges: [],
            type: 'Microsoft.Network/networkSecurityGroups/securityRules',
          },
          {
            access: 'Allow',
            destinationAddressPrefix: '*',
            destinationAddressPrefixes: [],
            destinationPortRange: '22',
            destinationPortRanges: [],
            direction: 'Inbound',
            etag: expect.any(String),
            id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/securityRules/priv_one`,
            name: 'priv_one',
            priority: 1002,
            protocol: 'Tcp',
            provisioningState: 'Succeeded',
            sourceAddressPrefix: '10.0.3.0/24',
            sourceAddressPrefixes: [],
            sourcePortRange: '*',
            sourcePortRanges: [],
            type: 'Microsoft.Network/networkSecurityGroups/securityRules',
          },
        ],
        subnets: [
          {
            id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev`,
          },
        ],
        tags: { environment: 'j1dev' },
        type: 'Microsoft.Network/networkSecurityGroups',
      }),
    );
  });
});

describe('iteratePublicIPAddresses', () => {
  let publicIPAddresses: PublicIPAddress[];

  beforeAll(async () => {
    config = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: '4a17becb-fb42-4633-b5c8-5ab66f28d195',
      subscriptionId: '87f62f44-9dad-4284-a08f-f2fb3d8b528a',
    };

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iteratePublicIPAddresses',
    });

    const client = new NetworkClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    publicIPAddresses = [];

    await client.iteratePublicIPAddresses((e) => {
      publicIPAddresses.push(e);
    });
  });

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should fetch the first Azure Network Public IP Address', () => {
    expect(publicIPAddresses).toContainEqual(
      expect.objectContaining({
        etag: expect.any(String),
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev`,
        idleTimeoutInMinutes: 4,
        ipConfiguration: {
          id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev/ipConfigurations/j1devConfiguration`,
        },
        ipTags: [],
        location: 'eastus',
        name: 'j1dev',
        provisioningState: 'Succeeded',
        publicIPAddressVersion: 'IPv4',
        publicIPAllocationMethod: 'Dynamic',
        resourceGuid: expect.any(String),
        sku: { name: 'Basic' },
        tags: { environment: 'j1dev' },
        type: 'Microsoft.Network/publicIPAddresses',
      }),
    );
  });

  it('should fetch the second Azure Network Public IP Address', () => {
    expect(publicIPAddresses).toContainEqual(
      expect.objectContaining({
        etag: expect.any(String),
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev_az_fw_pub_ip`,
        idleTimeoutInMinutes: 4,
        ipAddress: '40.88.49.65',
        ipConfiguration: {
          id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/azureFirewalls/j1dev_firewall/azureFirewallIpConfigurations/configuration`,
        },
        ipTags: [],
        location: 'eastus',
        name: 'j1dev_az_fw_pub_ip',
        provisioningState: 'Succeeded',
        publicIPAddressVersion: 'IPv4',
        publicIPAllocationMethod: 'Static',
        resourceGuid: expect.any(String),
        sku: { name: 'Standard' },
        tags: {},
        type: 'Microsoft.Network/publicIPAddresses',
      }),
    );
  });

  it('should fetch the second Azure Network Public IP Address', () => {
    expect(publicIPAddresses).toContainEqual(
      expect.objectContaining({
        etag: expect.any(String),
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev_lb_ip`,
        idleTimeoutInMinutes: 4,
        ipConfiguration: {
          id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/loadBalancers/TestLoadBalancer/frontendIPConfigurations/PublicIPAddress`,
        },
        ipTags: [],
        location: 'eastus',
        name: 'j1dev_lb_ip',
        provisioningState: 'Succeeded',
        publicIPAddressVersion: 'IPv4',
        publicIPAllocationMethod: 'Dynamic',
        resourceGuid: expect.any(String),
        sku: { name: 'Basic' },
        tags: { environment: 'j1dev' },
        type: 'Microsoft.Network/publicIPAddresses',
      }),
    );
  });
});

describe('iterateVirtualNetworks', () => {
  let vms: VirtualNetwork[];

  beforeAll(async () => {
    config = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: '4a17becb-fb42-4633-b5c8-5ab66f28d195',
      subscriptionId: '87f62f44-9dad-4284-a08f-f2fb3d8b528a',
    };

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateVirtualNetworks',
    });

    const client = new NetworkClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    vms = [];

    await client.iterateVirtualNetworks((e) => {
      vms.push(e);
    });
  });

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should fetch the first Azure Network Virtual Network', () => {
    expect(vms).toContainEqual(
      expect.objectContaining({
        addressSpace: { addressPrefixes: ['10.0.0.0/16'] },
        dhcpOptions: { dnsServers: [] },
        enableDdosProtection: false,
        enableVmProtection: false,
        etag: expect.any(String),
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_two`,
        location: 'westus',
        name: 'j1dev_two',
        provisioningState: 'Succeeded',
        resourceGuid: expect.any(String),
        subnets: [
          {
            addressPrefix: '10.0.3.0/24',
            delegations: [],
            etag: expect.any(String),
            id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_two/subnets/j1dev_priv_two`,
            name: 'j1dev_priv_two',
            privateEndpointNetworkPolicies: 'Enabled',
            privateLinkServiceNetworkPolicies: 'Enabled',
            provisioningState: 'Succeeded',
            serviceEndpoints: [],
            type: 'Microsoft.Network/virtualNetworks/subnets',
          },
        ],
        tags: { environment: 'j1dev' },
        type: 'Microsoft.Network/virtualNetworks',
        virtualNetworkPeerings: [],
      }),
    );
  });

  it('should fetch the second Azure Network Virtual Network', () => {
    expect(vms).toContainEqual(
      expect.objectContaining({
        addressSpace: { addressPrefixes: ['10.0.0.0/16'] },
        dhcpOptions: { dnsServers: [] },
        enableDdosProtection: false,
        enableVmProtection: false,
        etag: expect.any(String),
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev`,
        location: 'eastus',
        name: 'j1dev',
        provisioningState: 'Succeeded',
        resourceGuid: expect.any(String),
        subnets: [
          {
            addressPrefix: '10.0.3.0/24',
            delegations: [],
            etag: expect.any(String),
            id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev_priv_one`,
            name: 'j1dev_priv_one',
            privateEndpointNetworkPolicies: 'Enabled',
            privateLinkServiceNetworkPolicies: 'Enabled',
            provisioningState: 'Succeeded',
            serviceEndpoints: [],
            type: 'Microsoft.Network/virtualNetworks/subnets',
          },
          {
            addressPrefix: '10.0.2.0/24',
            delegations: [],
            etag: expect.any(String),
            id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev`,
            ipConfigurations: [
              {
                id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev/ipConfigurations/j1devConfiguration`,
              },
            ],
            name: 'j1dev',
            networkSecurityGroup: {
              id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev`,
            },
            privateEndpointNetworkPolicies: 'Enabled',
            privateLinkServiceNetworkPolicies: 'Enabled',
            provisioningState: 'Succeeded',
            serviceEndpoints: [],
            type: 'Microsoft.Network/virtualNetworks/subnets',
          },
        ],
        tags: { environment: 'j1dev' },
        type: 'Microsoft.Network/virtualNetworks',
        virtualNetworkPeerings: [],
      }),
    );
  });

  it('should fetch the third Azure Network Virtual Network', () => {
    expect(vms).toContainEqual(
      expect.objectContaining({
        addressSpace: { addressPrefixes: ['10.0.0.0/16'] },
        dhcpOptions: { dnsServers: [] },
        enableDdosProtection: false,
        enableVmProtection: false,
        etag: expect.any(String),
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_az_fw_vm`,
        location: 'eastus',
        name: 'j1dev_az_fw_vm',
        provisioningState: 'Succeeded',
        resourceGuid: expect.any(String),
        subnets: [
          {
            addressPrefix: '10.0.1.0/24',
            delegations: [],
            etag: expect.any(String),
            id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_az_fw_vm/subnets/AzureFirewallSubnet`,
            ipConfigurations: [
              {
                id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/azureFirewalls/j1dev_firewall/azureFirewallIpConfigurations/configuration`,
              },
            ],
            name: 'AzureFirewallSubnet',
            privateEndpointNetworkPolicies: 'Enabled',
            privateLinkServiceNetworkPolicies: 'Enabled',
            provisioningState: 'Succeeded',
            serviceEndpoints: [],
            type: 'Microsoft.Network/virtualNetworks/subnets',
          },
        ],
        tags: {},
        type: 'Microsoft.Network/virtualNetworks',
        virtualNetworkPeerings: [],
      }),
    );
  });
});

describe('iterateNetworkWatchers', () => {
  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateNetworkWatchers',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const client = new NetworkClient(
      configFromEnv,
      createMockIntegrationLogger(),
    );

    const networkWatchers: NetworkWatcher[] = [];

    /**
     * Azure auto-provisions a `NetworkWatcherRG` resource group in every subscription:
     * https://docs.microsoft.com/en-us/answers/questions/27211/what-is-the-networkwatcherrg.html
     */
    await client.iterateNetworkWatchers('NetworkWatcherRG', (watcher) => {
      networkWatchers.push(watcher);
    });

    expect(networkWatchers.length).toBeGreaterThan(0);
  });
});

describe('iterateNetworkSecurityGroupFlowLogs', () => {
  async function getSetupData(networkClient: NetworkClient) {
    const networkWatchers: NetworkWatcher[] = [];
    await networkClient.iterateNetworkWatchers(
      'NetworkWatcherRG',
      (watcher) => {
        networkWatchers.push(watcher);
      },
    );

    expect(networkWatchers.length).toBeGreaterThan(0);
    return { networkWatchers };
  }
  /**
   * NOTE: No terraform exists for Flow Logs, because they are dependent on Network
   * Watchers, which are auto-provisioned by Azure and thus would require manual importing
   * before they can be managed by this project's terraform. When re-executing this
   * test, please ensure FLow Logs are provisioned manually in the Azure Portal.
   */
  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateNetworkSecurityGroupFlowLogs',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });
    const client = new NetworkClient(
      configFromEnv,
      createMockIntegrationLogger(),
    );
    const { networkWatchers } = await getSetupData(client);

    const flowLogs: FlowLog[] = [];
    for (const networkWatcher of networkWatchers) {
      await client.iterateNetworkSecurityGroupFlowLogs(
        {
          id: networkWatcher.id!,
          name: networkWatcher.name!,
        },
        (flowLog) => {
          flowLogs.push(flowLog);
        },
      );
    }
    expect(flowLogs.length).toBeGreaterThan(0);
  });
});
