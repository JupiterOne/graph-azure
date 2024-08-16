import {
  Entity,
  Relationship,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import {
  executeStepWithDependencies,
  MockIntegrationStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import {
  getMatchRequestsBy,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { fetchAccount } from '../../active-directory';
import {
  buildPrivateEndpointNetworkInterfaceRelationships,
  buildPrivateEndpointSubnetRelationships,
  buildSecurityGroupRuleRelationships,
  fetchAzureFirewalls,
  fetchLoadBalancers,
  fetchNetworkInterfaces,
  fetchNetworkSecurityGroups,
  fetchNetworkWatchers,
  fetchPrivateEndpoints,
  fetchPublicIPAddresses,
  fetchVirtualNetworks,
} from './';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { IntegrationConfig, IntegrationStepContext } from '../../../types';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory/constants';
import {
  NetworkEntities,
  NetworkRelationships,
  STEP_RM_NETWORK_FIREWALL_POLICIES,
  STEP_RM_NETWORK_FIREWALL_POLICY_RELATIONSHIPS,
  STEP_RM_NETWORK_FIREWALL_RULE_RELATIONSHIPS,
  STEP_RM_NETWORK_FLOW_LOGS,
  STEP_RM_NETWORK_PRIVATE_ENDPOINTS,
  STEP_RM_NETWORK_SECURITY_GROUPS,
  STEP_RM_NETWORK_WATCHERS,
} from './constants';
import {
  configFromEnv,
  getStepTestConfigForStep,
} from '../../../../test/integrationInstanceConfig';
import {
  getMockAccountEntity,
  getMockResourceGroupEntity,
} from '../../../../test/helpers/getMockEntity';
import { RESOURCE_GROUP_ENTITY } from '../resources/constants';
import { steps as storageSteps } from '../storage/constants';

const GUID_REGEX = new RegExp(
  '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
  'i',
);

expect.extend({
  toContainGraphObject<T extends Entity | Relationship>(
    received: Array<T>,
    expected: T,
  ) {
    const found = received.find(
      (e) => e._type === expected._type && e._key === expected._key,
    );

    if (found) {
      try {
        expect(found).toMatchObject(expected);
        return {
          message: () => 'unexpected object in collection',
          pass: true,
        };
      } catch (err) {
        return {
          message: () => err,
          pass: false,
        };
      }
    } else {
      return {
        message: () =>
          `expected object to be in collection, received: \n\n  - ${received
            .map((e) => e._key)
            .sort()
            .join('\n  - ')}`,
        pass: false,
      };
    }
  },

  toContainOnlyGraphObjects<T extends Entity | Relationship>(
    received: Array<T>,
    ...expected: T[]
  ) {
    const receivedKeys = received.map((e) => e._key).sort();
    const expectedKeys = expected.map((e) => e._key).sort();

    try {
      expectedKeys.forEach((k) => expect(receivedKeys).toContain(k));
      // expect(receivedKeys).toContain(expectedKeys);
    } catch (err) {
      return {
        message: () => err,
        pass: false,
      };
    }

    for (const obj of expected) {
      try {
        expect(received).toContainGraphObject(obj);
      } catch (err) {
        return {
          message: () => err,
          pass: false,
        };
      }
    }

    return {
      message: () => 'found all objects',
      pass: true,
    };
  },
});

let recording: Recording;
let instanceConfig: IntegrationConfig;
let context: MockIntegrationStepExecutionContext<IntegrationConfig>;

describe('network steps', () => {
  it('Should simulate dependency order of execution', async () => {
    instanceConfig = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: '4a17becb-fb42-4633-b5c8-5ab66f28d195',
      subscriptionId: '87f62f44-9dad-4284-a08f-f2fb3d8b528a',
      developerId: 'keionned',
    };

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'network-steps',
    });

    const resourceGroupEntity: Entity = {
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
      _type: 'azure_resource_group',
      _class: ['Group'],
      name: 'j1dev',
      id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
    };

    context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [resourceGroupEntity],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: {
          defaultDomain: 'www.fake-domain.com',
          _type: ACCOUNT_ENTITY_TYPE,
          _key: 'azure_account_id',
          id: 'azure_account_id',
        },
      },
    });

    // Simulates dependency order of execution
    await fetchAccount(context as IntegrationStepContext);
    await fetchPublicIPAddresses(context as IntegrationStepContext);
    await fetchNetworkInterfaces(context as IntegrationStepContext);
    await fetchNetworkSecurityGroups(context as IntegrationStepContext);
    await fetchVirtualNetworks(context as IntegrationStepContext);
    await fetchLoadBalancers(context as IntegrationStepContext);
    await buildSecurityGroupRuleRelationships(context as IntegrationStepContext);
  }, 120000);

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });
  afterEach(async () => {
    if (recording) {
      await recording.stop();
    }
  });
  it('should collect Azure Network Entities', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainOnlyGraphObjects(
      {
        _class: ['Account'],
        _key: 'local-integration-instance',
        _rawData: [expect.objectContaining({ name: 'default' })],
        _type: 'azure_account',
        createdOn: undefined,
        defaultDomain: expect.any(String),
        displayName: 'Local Integration',
        id: instanceConfig.directoryId,
        name: 'Default Directory',
        organizationName: 'Default Directory',
        verifiedDomains: expect.any(Array),
      },

      // VPC default, eastus
      {
        CIDR: '10.0.0.0/16',
        _class: NetworkEntities.VIRTUAL_NETWORK._class,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev`,
        _rawData: [expect.objectContaining({ name: 'default' })],
        _type: NetworkEntities.VIRTUAL_NETWORK._type,
        createdOn: undefined,
        displayName: 'j1dev (10.0.0.0/16)',
        environment: 'j1dev',
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev`,
        internal: true,
        name: 'j1dev',
        public: false,
        region: 'eastus',
        resourceGroup: 'j1dev',
        'tag.environment': 'j1dev',
        webLink: `https://portal.azure.com/#@knnderoussellegmail.onmicrosoft.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev`,
      },
      {
        CIDR: '10.0.0.0/16',
        _class: NetworkEntities.VIRTUAL_NETWORK._class,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_az_fw_vm`,
        _rawData: [expect.objectContaining({ name: 'default' })],
        _type: NetworkEntities.VIRTUAL_NETWORK._type,
        createdOn: undefined,
        displayName: 'j1dev_az_fw_vm (10.0.0.0/16)',
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_az_fw_vm`,
        internal: true,
        name: 'j1dev_az_fw_vm',
        public: false,
        region: 'eastus',
        resourceGroup: 'j1dev',
        webLink: `https://portal.azure.com/#@knnderoussellegmail.onmicrosoft.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_az_fw_vm`,
      },
      {
        CIDR: '10.0.2.0/24',
        _class: [NetworkEntities.SUBNET._class],
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev`,
        _rawData: [expect.objectContaining({ name: 'default' })],
        _type: NetworkEntities.SUBNET._type,
        createdOn: undefined,
        displayName: 'j1dev (10.0.2.0/24)',
        environment: 'j1dev',
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev`,
        internal: true,
        name: 'j1dev',
        public: false,
        region: 'eastus',
        resourceGroup: 'j1dev',
        webLink: `https://portal.azure.com/#@knnderoussellegmail.onmicrosoft.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev`,
      },
      {
        CIDR: '10.0.3.0/24',
        _class: [NetworkEntities.SUBNET._class],
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev_priv_one`,
        _rawData: [expect.objectContaining({ name: 'default' })],
        _type: NetworkEntities.SUBNET._type,
        createdOn: undefined,
        displayName: 'j1dev_priv_one (10.0.3.0/24)',
        environment: 'j1dev',
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev_priv_one`,
        internal: true,
        name: 'j1dev_priv_one',
        public: false,
        region: 'eastus',
        resourceGroup: 'j1dev',
        webLink: `https://portal.azure.com/#@knnderoussellegmail.onmicrosoft.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev_priv_one`,
      },
      {
        CIDR: '10.0.1.0/24',
        _class: [NetworkEntities.SUBNET._class],
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_az_fw_vm/subnets/AzureFirewallSubnet`,
        _rawData: [expect.objectContaining({ name: 'default' })],
        _type: NetworkEntities.SUBNET._type,
        createdOn: undefined,
        displayName: 'AzureFirewallSubnet (10.0.1.0/24)',
        environment: undefined,
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_az_fw_vm/subnets/AzureFirewallSubnet`,
        internal: true,
        name: 'AzureFirewallSubnet',
        public: false,
        region: 'eastus',
        resourceGroup: 'j1dev',
        webLink: `https://portal.azure.com/#@knnderoussellegmail.onmicrosoft.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_az_fw_vm/subnets/AzureFirewallSubnet`,
      },
      {
        _class: NetworkEntities.PUBLIC_IP_ADDRESS._class,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev`,
        _rawData: [expect.objectContaining({ name: 'default' })],
        _type: NetworkEntities.PUBLIC_IP_ADDRESS._type,
        displayName: 'j1dev',
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev`,
        public: true,
        // Dynamic address may be undefined when the address is not bound to anything
        // publicIp: '52.188.119.30',
        // publicIpAddress: '52.188.119.30',
        region: 'eastus',
        resourceGroup: 'j1dev',
        resourceGuid: expect.stringMatching(GUID_REGEX),
        sku: 'Basic',
        'tag.environment': 'j1dev',
        type: 'Microsoft.Network/publicIPAddresses',
        webLink: `https://portal.azure.com/#@knnderoussellegmail.onmicrosoft.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev`,
      },
      {
        _class: NetworkEntities.PUBLIC_IP_ADDRESS._class,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev_az_fw_pub_ip`,
        _rawData: [expect.objectContaining({ name: 'default' })],
        _type: NetworkEntities.PUBLIC_IP_ADDRESS._type,
        displayName: 'j1dev_az_fw_pub_ip',
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev_az_fw_pub_ip`,
        public: true,
        region: 'eastus',
        resourceGroup: 'j1dev',
        resourceGuid: expect.stringMatching(GUID_REGEX),
        sku: 'Standard',
        type: 'Microsoft.Network/publicIPAddresses',
        webLink: `https://portal.azure.com/#@knnderoussellegmail.onmicrosoft.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev_az_fw_pub_ip`,
      },
      {
        _class: NetworkEntities.NETWORK_INTERFACE._class,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev`,
        _rawData: [expect.objectContaining({ name: 'default' })],
        _type: NetworkEntities.NETWORK_INTERFACE._type,
        displayName: 'j1dev',
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev`,
        ipForwarding: false,
        macAddress: undefined,
        privateIp: ['10.0.2.4'],
        privateIpAddress: ['10.0.2.4'],
        publicIp: expect.any(Array),
        publicIpAddress: expect.any(Array),
        region: 'eastus',
        resourceGroup: 'j1dev',
        resourceGuid: expect.stringMatching(GUID_REGEX),
        securityGroupId: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev`,
        'tag.environment': 'j1dev',
        type: 'Microsoft.Network/networkInterfaces',
        // Only defined when bound to a VM
        // virtualMachineId:
        //   `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Compute/virtualMachines/j1dev`,
        webLink: `https://portal.azure.com/#@knnderoussellegmail.onmicrosoft.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev`,
      },
      {
        _class: NetworkEntities.SECURITY_GROUP._class,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev`,
        _rawData: [expect.objectContaining({ name: 'default' })],
        _type: NetworkEntities.SECURITY_GROUP._type,
        category: ['network', 'host'],
        createdOn: undefined,
        displayName: 'j1dev',
        environment: 'j1dev',
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev`,
        isWideOpen: false,
        name: 'j1dev',
        region: 'eastus',
        resourceGroup: 'j1dev',
        'tag.environment': 'j1dev',
        webLink: `https://portal.azure.com/#@knnderoussellegmail.onmicrosoft.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev`,
      },
      {
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev_lb_ip`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev_lb_ip`,
        _class: NetworkEntities.PUBLIC_IP_ADDRESS._class,
        _type: NetworkEntities.PUBLIC_IP_ADDRESS._type,
        _rawData: [expect.objectContaining({ name: 'default' })],
        displayName: 'j1dev_lb_ip',
        public: true,
        // Dynamic address may be undefined when the address is not bound to anything
        // publicIp: '52.188.119.30',
        // publicIpAddress: '52.188.119.30',
        region: 'eastus',
        resourceGroup: 'j1dev',
        resourceGuid: expect.stringMatching(GUID_REGEX),
        sku: 'Basic',
        'tag.environment': 'j1dev',
        type: 'Microsoft.Network/publicIPAddresses',
        webLink: `https://portal.azure.com/#@knnderoussellegmail.onmicrosoft.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev_lb_ip`,
      },
      {
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/loadBalancers/TestLoadBalancer`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/loadBalancers/TestLoadBalancer`,
        _class: NetworkEntities.LOAD_BALANCER._class,
        _type: NetworkEntities.LOAD_BALANCER._type,
        category: ['network'],
        function: ['load-balancing'],
        resourceGuid: expect.stringMatching(GUID_REGEX),
        resourceGroup: 'j1dev',
        displayName: 'TestLoadBalancer',
        type: 'Microsoft.Network/loadBalancers',
        region: 'eastus',
        publicIp: expect.any(Array),
        privateIp: expect.any(Array),
        public: true,
        webLink: `https://portal.azure.com/#@knnderoussellegmail.onmicrosoft.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/loadBalancers/TestLoadBalancer`,
      },

      // VPC default, westus
      {
        CIDR: '10.0.0.0/16',
        _class: NetworkEntities.VIRTUAL_NETWORK._class,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_two`,
        _rawData: [expect.objectContaining({ name: 'default' })],
        _type: NetworkEntities.VIRTUAL_NETWORK._type,
        createdOn: undefined,
        displayName: 'j1dev_two (10.0.0.0/16)',
        environment: 'j1dev',
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_two`,
        internal: true,
        name: 'j1dev_two',
        public: false,
        region: 'westus',
        resourceGroup: 'j1dev',
        'tag.environment': 'j1dev',
        webLink: `https://portal.azure.com/#@knnderoussellegmail.onmicrosoft.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_two`,
      },
      {
        CIDR: '10.0.3.0/24',
        _class: [NetworkEntities.SUBNET._class],
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_two/subnets/j1dev_priv_two`,
        _rawData: [expect.objectContaining({ name: 'default' })],
        _type: NetworkEntities.SUBNET._type,
        createdOn: undefined,
        displayName: 'j1dev_priv_two (10.0.3.0/24)',
        environment: 'j1dev',
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_two/subnets/j1dev_priv_two`,
        internal: true,
        name: 'j1dev_priv_two',
        public: false,
        region: 'westus',
        resourceGroup: 'j1dev',
        webLink: `https://portal.azure.com/#@knnderoussellegmail.onmicrosoft.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_two/subnets/j1dev_priv_two`,
      },
    );
  });

  it('should collect Azure Network Relationships', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainOnlyGraphObjects(
      // VPC default, eastus
      {
        _class:
          NetworkRelationships.NETWORK_VIRTUAL_NETWORK_CONTAINS_NETWORK_SUBNET
            ._class,
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev|contains|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev`,
        _type:
          NetworkRelationships.NETWORK_VIRTUAL_NETWORK_CONTAINS_NETWORK_SUBNET
            ._type,
        displayName:
          NetworkRelationships.NETWORK_VIRTUAL_NETWORK_CONTAINS_NETWORK_SUBNET
            ._class,
      },
      {
        _class:
          NetworkRelationships.NETWORK_VIRTUAL_NETWORK_CONTAINS_NETWORK_SUBNET
            ._class,
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev|contains|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev_priv_one`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev_priv_one`,
        _type:
          NetworkRelationships.NETWORK_VIRTUAL_NETWORK_CONTAINS_NETWORK_SUBNET
            ._type,
        displayName:
          NetworkRelationships.NETWORK_VIRTUAL_NETWORK_CONTAINS_NETWORK_SUBNET
            ._class,
      },
      {
        _class:
          NetworkRelationships.NETWORK_VIRTUAL_NETWORK_CONTAINS_NETWORK_SUBNET
            ._class,
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_az_fw_vm`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_az_fw_vm|contains|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_az_fw_vm/subnets/AzureFirewallSubnet`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_az_fw_vm/subnets/AzureFirewallSubnet`,
        _type:
          NetworkRelationships.NETWORK_VIRTUAL_NETWORK_CONTAINS_NETWORK_SUBNET
            ._type,
        displayName:
          NetworkRelationships.NETWORK_VIRTUAL_NETWORK_CONTAINS_NETWORK_SUBNET
            ._class,
      },
      {
        _class:
          NetworkRelationships.NETWORK_SECURITY_GROUP_PROTECTS_NETWORK_SUBNET
            ._class,
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev|protects|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev`,
        _type:
          NetworkRelationships.NETWORK_SECURITY_GROUP_PROTECTS_NETWORK_SUBNET
            ._type,
        displayName:
          NetworkRelationships.NETWORK_SECURITY_GROUP_PROTECTS_NETWORK_SUBNET
            ._class,
      },
      {
        _class:
          NetworkRelationships.NETWORK_SECURITY_GROUP_PROTECTS_NETWORK_INTERFACE
            ._class,
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev|protects|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev`,
        _type:
          NetworkRelationships.NETWORK_SECURITY_GROUP_PROTECTS_NETWORK_INTERFACE
            ._type,
        displayName:
          NetworkRelationships.NETWORK_SECURITY_GROUP_PROTECTS_NETWORK_INTERFACE
            ._class,
      },
      {
        _class:
          NetworkRelationships.NETWORK_SUBNET_ALLOWS_NETWORK_SECURITY_GROUP
            ._class,
        _key: `azure_security_group_rule:/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/securityRules/priv_one:22:/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev_priv_one`,
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev/subnets/j1dev_priv_one`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev`,
        _type:
          NetworkRelationships.NETWORK_SUBNET_ALLOWS_NETWORK_SECURITY_GROUP
            ._type,
        access: 'Allow',
        destinationAddressPrefix: '*',
        destinationPortRange: '22',
        direction: 'Inbound',
        displayName:
          NetworkRelationships.NETWORK_SUBNET_ALLOWS_NETWORK_SECURITY_GROUP
            ._class,
        egress: false,
        etag: expect.any(String),
        fromPort: 22,
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/securityRules/priv_one`,
        inbound: true,
        ingress: true,
        ipProtocol: 'tcp',
        name: 'priv_one',
        outbound: false,
        portRange: '22',
        priority: 1002,
        protocol: 'tcp',
        provisioningState: 'Succeeded',
        ruleNumber: 1002,
        sourceAddressPrefix: '10.0.3.0/24',
        sourcePortRange: '*',
        toPort: 22,
        type: 'Microsoft.Network/networkSecurityGroups/securityRules',
      },
      {
        _class:
          NetworkRelationships.NETWORK_SUBNET_ALLOWS_NETWORK_SECURITY_GROUP
            ._class,
        _key: `azure_security_group_rule:/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/securityRules/priv_one:22:/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_two/subnets/j1dev_priv_two`,
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_two/subnets/j1dev_priv_two`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev`,
        _type:
          NetworkRelationships.NETWORK_SUBNET_ALLOWS_NETWORK_SECURITY_GROUP
            ._type,
        access: 'Allow',
        destinationAddressPrefix: '*',
        destinationPortRange: '22',
        direction: 'Inbound',
        displayName:
          NetworkRelationships.NETWORK_SUBNET_ALLOWS_NETWORK_SECURITY_GROUP
            ._class,
        egress: false,
        etag: expect.any(String),
        fromPort: 22,
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/securityRules/priv_one`,
        inbound: true,
        ingress: true,
        ipProtocol: 'tcp',
        name: 'priv_one',
        outbound: false,
        portRange: '22',
        priority: 1002,
        protocol: 'tcp',
        provisioningState: 'Succeeded',
        ruleNumber: 1002,
        sourceAddressPrefix: '10.0.3.0/24',
        sourcePortRange: '*',
        toPort: 22,
        type: 'Microsoft.Network/networkSecurityGroups/securityRules',
      },
      {
        _class: 'ALLOWS',
        _key: `azure_security_group_rule:/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/AllowVnetInBound:*:Service:azure_virtual_network:VirtualNetwork`,
        _mapping: {
          relationshipDirection: RelationshipDirection.REVERSE,
          skipTargetCreation: false,
          sourceEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev`,
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
        etag: expect.any(String),
        fromPort: 0,
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/AllowVnetInBound`,
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
        _key: `azure_security_group_rule:/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/AllowAzureLoadBalancerInBound:*:Service:azure_load_balancer:AzureLoadBalancer`,
        _mapping: {
          relationshipDirection: RelationshipDirection.REVERSE,
          skipTargetCreation: false,
          sourceEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev`,
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
        etag: expect.any(String),
        fromPort: 0,
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/AllowAzureLoadBalancerInBound`,
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
        _key: `azure_security_group_rule:/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/DenyAllInBound:*:internet`,
        _mapping: {
          relationshipDirection: RelationshipDirection.REVERSE,
          skipTargetCreation: false,
          sourceEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev`,
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
        etag: expect.any(String),
        fromPort: 0,
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/DenyAllInBound`,
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
        _key: `azure_security_group_rule:/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/AllowVnetOutBound:*:Service:azure_virtual_network:VirtualNetwork`,
        _mapping: {
          relationshipDirection: RelationshipDirection.FORWARD,
          skipTargetCreation: false,
          sourceEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev`,
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
        etag: expect.any(String),
        fromPort: 0,
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/AllowVnetOutBound`,
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
        _key: `azure_security_group_rule:/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/AllowInternetOutBound:*:internet`,
        _mapping: {
          relationshipDirection: RelationshipDirection.FORWARD,
          skipTargetCreation: false,
          sourceEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev`,
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
        etag: expect.any(String),
        fromPort: 0,
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/AllowInternetOutBound`,
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
        _key: `azure_security_group_rule:/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/DenyAllOutBound:*:internet`,
        _mapping: {
          relationshipDirection: RelationshipDirection.FORWARD,
          skipTargetCreation: false,
          sourceEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev`,
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
        etag: expect.any(String),
        fromPort: 0,
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/defaultSecurityRules/DenyAllOutBound`,
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
        _key: `azure_security_group_rule:/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/securityRules/SSH:22:internet`,
        _mapping: {
          relationshipDirection: RelationshipDirection.REVERSE,
          skipTargetCreation: false,
          sourceEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev`,
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
        etag: expect.any(String),
        fromPort: 22,
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev/securityRules/SSH`,
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

      // VPC default, westus
      {
        _class:
          NetworkRelationships.NETWORK_VIRTUAL_NETWORK_CONTAINS_NETWORK_SUBNET
            ._class,
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_two`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_two|contains|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_two/subnets/j1dev_priv_two`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_two/subnets/j1dev_priv_two`,
        _type:
          NetworkRelationships.NETWORK_VIRTUAL_NETWORK_CONTAINS_NETWORK_SUBNET
            ._type,
        displayName:
          NetworkRelationships.NETWORK_VIRTUAL_NETWORK_CONTAINS_NETWORK_SUBNET
            ._class,
      },

      // Resource Group
      {
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev`,
        _type:
          NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_NETWORK_INTERFACE
            ._type,
        _class:
          NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_NETWORK_INTERFACE
            ._class,
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev`,
        displayName:
          NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_NETWORK_INTERFACE
            ._class,
      },
      {
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev`,
        _type:
          NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_PUBLIC_IP_ADDRESS
            ._type,
        _class:
          NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_PUBLIC_IP_ADDRESS
            ._class,
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev`,
        displayName:
          NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_PUBLIC_IP_ADDRESS
            ._class,
      },
      {
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev_az_fw_pub_ip`,
        _type:
          NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_PUBLIC_IP_ADDRESS
            ._type,
        _class:
          NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_PUBLIC_IP_ADDRESS
            ._class,
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev_az_fw_pub_ip`,
        displayName:
          NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_PUBLIC_IP_ADDRESS
            ._class,
      },
      {
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev`,
        _type:
          NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_SECURITY_GROUP._type,
        _class:
          NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_SECURITY_GROUP._class,
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/networkSecurityGroups/j1dev`,
        displayName:
          NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_SECURITY_GROUP._class,
      },
      {
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev`,
        _type:
          NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_VIRTUAL_NETWORK._type,
        _class:
          NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_VIRTUAL_NETWORK
            ._class,
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev`,
        displayName:
          NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_VIRTUAL_NETWORK
            ._class,
      },
      {
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_two`,
        _type:
          NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_VIRTUAL_NETWORK._type,
        _class:
          NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_VIRTUAL_NETWORK
            ._class,
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_two`,
        displayName:
          NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_VIRTUAL_NETWORK
            ._class,
      },
      {
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_az_fw_vm`,
        _type:
          NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_VIRTUAL_NETWORK._type,
        _class:
          NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_VIRTUAL_NETWORK
            ._class,
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/virtualNetworks/j1dev_az_fw_vm`,
        displayName:
          NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_VIRTUAL_NETWORK
            ._class,
      },
      {
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/loadBalancers/TestLoadBalancer`,
        _type:
          NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_LOAD_BALANCER._type,
        _class:
          NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_LOAD_BALANCER._class,
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/loadBalancers/TestLoadBalancer`,
        displayName:
          NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_LOAD_BALANCER._class,
      },
      {
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev_lb_ip`,
        _type:
          NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_PUBLIC_IP_ADDRESS
            ._type,
        _class:
          NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_PUBLIC_IP_ADDRESS
            ._class,
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/publicIPAddresses/j1dev_lb_ip`,
        displayName:
          NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_PUBLIC_IP_ADDRESS
            ._class,
      },
    );
  });

  describe('step = fetch azure firewalls', () => {
    beforeAll(async () => {
      instanceConfig = {
        clientId: process.env.CLIENT_ID || 'clientId',
        clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
        directoryId: '4a17becb-fb42-4633-b5c8-5ab66f28d195',
        subscriptionId: '87f62f44-9dad-4284-a08f-f2fb3d8b528a',
        developerId: 'keionned',
      };

      recording = setupAzureRecording({
        directory: __dirname,
        name: 'resource-manager-step-azure-firewalls',
        options: {
          recordFailedRequests: true,
        },
      });

      const resourceGroupEntity: Entity = {
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
        _type: 'azure_resource_group',
        _class: ['Group'],
        name: 'j1dev',
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
      };

      context = createMockAzureStepExecutionContext({
        instanceConfig,
        entities: [resourceGroupEntity],
        setData: {
          [ACCOUNT_ENTITY_TYPE]: {
            defaultDomain: 'www.fake-domain.com',
            _type: ACCOUNT_ENTITY_TYPE,
            _key: 'azure_account_id',
            id: 'azure_account_id',
          },
        },
      });

      await fetchAzureFirewalls(context as IntegrationStepContext);
    });

    afterAll(async () => {
      if (recording) {
        await recording.stop();
      }
    });

    it('should collect an Azure Network Azure Firewall entity', () => {
      const { collectedEntities } = context.jobState;

      expect(collectedEntities).toContainEqual(
        expect.objectContaining({
          id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/azureFirewalls/j1dev_firewall`,
          _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/azureFirewalls/j1dev_firewall`,
          _type: NetworkEntities.AZURE_FIREWALL._type,
          _class: NetworkEntities.AZURE_FIREWALL._class,
          category: ['network'],
          createdOn: undefined,
          displayName: 'j1dev_firewall',
          name: 'j1dev_firewall',
          provisioningState: 'Succeeded',
          region: 'eastus',
          threatIntelMode: 'Alert',
          type: 'Microsoft.Network/azureFirewalls',
          webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/azureFirewalls/j1dev_firewall`,
        }),
      );
    });

    it('should collect an Azure Resource Group has Azure Network Azure Firewall relationship', () => {
      const { collectedRelationships } = context.jobState;

      expect(collectedRelationships).toContainEqual(
        expect.objectContaining({
          _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
          _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/azureFirewalls/j1dev_firewall`,
          _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Network/azureFirewalls/j1dev_firewall`,
          _type:
            NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_AZURE_FIREWALL
              ._type,
          _class:
            NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_AZURE_FIREWALL
              ._class,
          displayName:
            NetworkRelationships.RESOURCE_GROUP_HAS_NETWORK_AZURE_FIREWALL
              ._class,
        }),
      );
    });
  });

  describe('rm-network-watchers', () => {
    function getSetupEntities() {
      const accountEntity = getMockAccountEntity(configFromEnv);

      /**
       * Azure auto-provisions a `NetworkWatcherRG` resource group in every subscription:
       * https://docs.microsoft.com/en-us/answers/questions/27211/what-is-the-networkwatcherrg.html
       */
      const resourceGroupEntity = {
        name: 'NetworkWatcherRG',
        _type: RESOURCE_GROUP_ENTITY._type,
        _class: RESOURCE_GROUP_ENTITY._class,
        _key: 'resource-group-key',
      };

      return { accountEntity, resourceGroupEntity };
    }

    test('success', async () => {
      recording = setupAzureRecording({
        directory: __dirname,
        name: 'rm-network-watchers',
        options: {
          matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
        },
      });

      const { accountEntity, resourceGroupEntity } = getSetupEntities();

      const context = createMockAzureStepExecutionContext({
        instanceConfig: configFromEnv,
        entities: [resourceGroupEntity],
        setData: {
          [ACCOUNT_ENTITY_TYPE]: accountEntity,
        },
      });

      await fetchNetworkWatchers(context as IntegrationStepContext);

      const networkWatcherEntities = context.jobState.collectedEntities;

      expect(networkWatcherEntities.length).toBeGreaterThan(0);
      expect(networkWatcherEntities).toMatchGraphObjectSchema({
        _class: NetworkEntities.NETWORK_WATCHER._class,
      });

      const networkWatcherResourceGroupRelationships =
        context.jobState.collectedRelationships;

      expect(networkWatcherResourceGroupRelationships.length).toBe(
        networkWatcherEntities.length,
      );
      expect(
        networkWatcherResourceGroupRelationships,
      ).toMatchDirectRelationshipSchema({});
    });
  });

  describe('rm-network-private-endpoints', () => {
    test('success', async () => {
      const stepTestConfig = getStepTestConfigForStep(
        STEP_RM_NETWORK_PRIVATE_ENDPOINTS,
      );
      recording = setupAzureRecording(
        {
          name: STEP_RM_NETWORK_PRIVATE_ENDPOINTS,
          directory: __dirname,
        },
        stepTestConfig.instanceConfig,
      );

      const stepResults = await executeStepWithDependencies(stepTestConfig);
      expect(stepResults).toMatchStepMetadata(stepTestConfig);
    }, 500_000);
  });

  describe('rm-network-private-endpoint-subnet-relationships', () => {
    async function getSetupEntities(config: IntegrationConfig) {
      const accountEntity = getMockAccountEntity(config);
      const resourceGroupEntity = getMockResourceGroupEntity('j1dev');

      const context = createMockAzureStepExecutionContext({
        instanceConfig: configFromEnv,
        entities: [accountEntity, resourceGroupEntity],
        setData: {
          [ACCOUNT_ENTITY_TYPE]: accountEntity,
        },
      });

      await fetchPrivateEndpoints(context as IntegrationStepContext);
      await fetchVirtualNetworks(context as IntegrationStepContext);

      const subnetEntities = context.jobState.collectedEntities.filter(
        (e) => e._type === NetworkEntities.SUBNET._type,
      );
      const privateEndpointEntities = context.jobState.collectedEntities.filter(
        (e) => e._type === NetworkEntities.PRIVATE_ENDPOINT._type,
      );

      expect(privateEndpointEntities.length).toBeGreaterThan(0);

      return { privateEndpointEntities, subnetEntities };
    }

    test('success', async () => {
      recording = setupAzureRecording({
        directory: __dirname,
        name: 'rm-network-private-endpoint-subnet-relationships',
        options: {
          matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
        },
      });

      const { subnetEntities, privateEndpointEntities } =
        await getSetupEntities(configFromEnv);

      const context = createMockAzureStepExecutionContext({
        instanceConfig: configFromEnv,
        entities: [...subnetEntities, ...privateEndpointEntities],
      });

      await buildPrivateEndpointSubnetRelationships(context as IntegrationStepContext);

      const privateEndpointSubnetRelationships =
        context.jobState.collectedRelationships;

      expect(context.jobState.collectedEntities).toHaveLength(0);

      expect(privateEndpointSubnetRelationships.length).toBe(
        privateEndpointEntities.length,
      );
      expect(
        privateEndpointSubnetRelationships,
      ).toMatchDirectRelationshipSchema({
        schema: {
          properties: {
            _type: {
              const:
                NetworkRelationships.NETWORK_SUBNET_HAS_PRIVATE_ENDPOINT._type,
            },
          },
        },
      });
    }, 10000);
  });

  describe('rm-network-private-endpoint-resource-relationships', () => {
    test('success', async () => {
      const stepTestConfig = getStepTestConfigForStep(
        STEP_RM_NETWORK_PRIVATE_ENDPOINTS,
      );

      recording = setupAzureRecording(
        {
          name: STEP_RM_NETWORK_PRIVATE_ENDPOINTS,
          directory: __dirname,
        },
        stepTestConfig.instanceConfig,
      );

      const stepResults = await executeStepWithDependencies({
        ...stepTestConfig,
        dependencyStepIds: [
          STEP_RM_NETWORK_WATCHERS,
          STEP_RM_NETWORK_SECURITY_GROUPS,
          storageSteps.STORAGE_ACCOUNTS,
        ],
      });

      expect(stepResults).toMatchStepMetadata(stepTestConfig);
    }, 500_000);
  });

  describe('rm-network-private-endpoint-nic-relationships', () => {
    async function getSetupEntities(config: IntegrationConfig) {
      const accountEntity = getMockAccountEntity(config);
      const resourceGroupEntity = getMockResourceGroupEntity('j1dev');

      const context = createMockAzureStepExecutionContext({
        instanceConfig: configFromEnv,
        entities: [accountEntity, resourceGroupEntity],
        setData: {
          [ACCOUNT_ENTITY_TYPE]: accountEntity,
        },
      });

      await fetchPrivateEndpoints(context as IntegrationStepContext);

      /**
       * This step sets the `publicIpAddresses` raw data, which is required for
       * fetchNetworkInterfaces.
       */
      await fetchPublicIPAddresses(context as IntegrationStepContext);
      await fetchNetworkInterfaces(context as IntegrationStepContext);

      const networkInterfaceEntities =
        context.jobState.collectedEntities.filter(
          (e) => e._type === NetworkEntities.NETWORK_INTERFACE._type,
        );
      const privateEndpointEntities = context.jobState.collectedEntities.filter(
        (e) => e._type === NetworkEntities.PRIVATE_ENDPOINT._type,
      );

      expect(privateEndpointEntities.length).toBeGreaterThan(0);

      return { privateEndpointEntities, networkInterfaceEntities };
    }

    test('success', async () => {
      recording = setupAzureRecording({
        directory: __dirname,
        name: 'rm-network-private-endpoint-nic-relationships',
        options: {
          matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
        },
      });

      const { networkInterfaceEntities, privateEndpointEntities } =
        await getSetupEntities(configFromEnv);

      const context = createMockAzureStepExecutionContext({
        instanceConfig: configFromEnv,
        entities: [...networkInterfaceEntities, ...privateEndpointEntities],
      });

      await buildPrivateEndpointNetworkInterfaceRelationships(context as IntegrationStepContext);

      const privateEndpointNetworkInterfaceRelationships =
        context.jobState.collectedRelationships;

      expect(context.jobState.collectedEntities).toHaveLength(0);

      expect(privateEndpointNetworkInterfaceRelationships.length).toBe(
        privateEndpointEntities.length,
      );
      expect(
        privateEndpointNetworkInterfaceRelationships,
      ).toMatchDirectRelationshipSchema({
        schema: {
          properties: {
            _type: {
              const: NetworkRelationships.PRIVATE_ENDPOINT_USES_NIC._type,
            },
          },
        },
      });
    }, 25000);
  });

  describe('rm-network-flow-logs', () => {
    test('success', async () => {
      const stepTestConfig = getStepTestConfigForStep(
        STEP_RM_NETWORK_FLOW_LOGS,
      );

      recording = setupAzureRecording(
        {
          name: STEP_RM_NETWORK_FLOW_LOGS,
          directory: __dirname,
        },
        stepTestConfig.instanceConfig,
      );

      const stepResults = await executeStepWithDependencies(stepTestConfig);
      expect(stepResults).toMatchStepMetadata(stepTestConfig);
    }, 500_000);
  });

  describe('rm-network-location-watcher-relationships', () => {
    test('success', async () => {
      const stepTestConfig = getStepTestConfigForStep(
        'rm-network-location-watcher-relationships',
      );

      recording = setupAzureRecording(
        {
          name: 'rm-network-location-watcher-relationships',
          directory: __dirname,
        },
        stepTestConfig.instanceConfig,
      );

      const stepResults = await executeStepWithDependencies(stepTestConfig);
      const mappedRelationships = stepResults.collectedRelationships;

      expect(mappedRelationships.length > 0);
    }, 100000);
  });

  describe(STEP_RM_NETWORK_FIREWALL_POLICIES, () => {
    test('success', async () => {
      const stepTestConfig = getStepTestConfigForStep(
        STEP_RM_NETWORK_FIREWALL_POLICIES,
      );
      recording = setupAzureRecording(
        {
          name: STEP_RM_NETWORK_FIREWALL_POLICIES,
          directory: __dirname,
        },
        stepTestConfig.instanceConfig,
      );

      const stepResults = await executeStepWithDependencies(stepTestConfig);
      expect(stepResults).toMatchStepMetadata(stepTestConfig);
    }, 500000);
  });

  describe(STEP_RM_NETWORK_FIREWALL_POLICY_RELATIONSHIPS, () => {
    test('success', async () => {
      const stepTestConfig = getStepTestConfigForStep(
        STEP_RM_NETWORK_FIREWALL_POLICY_RELATIONSHIPS,
      );
      recording = setupAzureRecording(
        {
          name: STEP_RM_NETWORK_FIREWALL_POLICY_RELATIONSHIPS,
          directory: __dirname,
        },
        stepTestConfig.instanceConfig,
      );

      const stepResults = await executeStepWithDependencies(stepTestConfig);
      expect(stepResults).toMatchStepMetadata(stepTestConfig);
    });
  });

  describe(STEP_RM_NETWORK_FIREWALL_RULE_RELATIONSHIPS, () => {
    test('success', async () => {
      const stepTestConfig = getStepTestConfigForStep(
        STEP_RM_NETWORK_FIREWALL_RULE_RELATIONSHIPS,
      );
      recording = setupAzureRecording(
        {
          name: STEP_RM_NETWORK_FIREWALL_RULE_RELATIONSHIPS,
          directory: __dirname,
        },
        stepTestConfig.instanceConfig,
      );

      const stepResults = await executeStepWithDependencies(stepTestConfig);
      const mappedRelationships = stepResults.collectedRelationships;

      expect(mappedRelationships.length > 0);
    }, 500000);
  });
});
