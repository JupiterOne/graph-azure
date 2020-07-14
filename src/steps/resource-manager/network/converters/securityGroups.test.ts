import {
  NetworkSecurityGroup,
  SecurityRule,
} from '@azure/arm-network/esm/models';
import { INTERNET } from '@jupiterone/data-model';
import {
  convertProperties,
  createIntegrationRelationship,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';

import { SECURITY_GROUP_RULE_RELATIONSHIP_TYPE } from '../constants';
import {
  createSecurityGroupRuleMappedRelationship,
  processSecurityGroupRule,
  processSecurityGroupRules,
} from './securityGroups';

describe('build mapped relationships from security group rules', () => {
  const inboundRuleFromSingleIpToSubnet: SecurityRule = {
    id:
      '/subscriptions/uuid/resourceGroups/xtest/providers/Microsoft.Network/networkSecurityGroups/test-ssh/securityRules/Port_8080',
    description: 'Test 8080',
    protocol: '*',
    sourcePortRange: '*',
    destinationPortRange: '8080',
    sourceAddressPrefix: '4.3.2.1/32',
    sourceAddressPrefixes: [],
    destinationAddressPrefix: '10.1.1.0/24',
    destinationAddressPrefixes: [],
    sourcePortRanges: [],
    destinationPortRanges: [],
    access: 'Allow',
    priority: 100,
    direction: 'Inbound',
    provisioningState: 'Succeeded',
    name: 'Port_8080',
    etag: '',
  };

  const outboundRuleFromHighPortsToMultiplePortRanges: SecurityRule = {
    id:
      '/subscriptions/uuid/resourceGroups/xtest/providers/Microsoft.Network/networkSecurityGroups/test-ssh/securityRules/Port_Ranges',
    description: 'Test port range',
    protocol: 'Tcp',
    sourcePortRange: '1024-65535',
    sourceAddressPrefix: '*',
    sourceAddressPrefixes: [],
    destinationAddressPrefix: '*',
    destinationAddressPrefixes: [],
    sourcePortRanges: [],
    destinationPortRanges: ['8080-8082', '7070-7071'],
    access: 'Allow',
    priority: 100,
    direction: 'Outbound',
    provisioningState: 'Succeeded',
    name: 'Port_Ranges',
    etag: 'W/"908ac42c-c1a3-4079-9bfa-093449876fa8"',
  };

  const securityRules: SecurityRule[] = [
    inboundRuleFromSingleIpToSubnet,
    outboundRuleFromHighPortsToMultiplePortRanges,
  ];

  const inboundRuleFromAllVMsInVNET: SecurityRule = {
    id:
      '/subscriptions/uuid/resourceGroups/xtest/providers/Microsoft.Network/networkSecurityGroups/test-ssh/defaultSecurityRules/AllowVnetInBound',
    description: 'Allow inbound traffic from all VMs in VNET',
    protocol: '*',
    sourcePortRange: '*',
    destinationPortRange: '*',
    sourceAddressPrefix: 'VirtualNetwork',
    sourceAddressPrefixes: [],
    destinationAddressPrefix: 'VirtualNetwork',
    destinationAddressPrefixes: [],
    sourcePortRanges: [],
    destinationPortRanges: [],
    access: 'Allow',
    priority: 65000,
    direction: 'Inbound',
    provisioningState: 'Succeeded',
    name: 'AllowVnetInBound',
    etag: '',
  };

  const defaultSecurityRules: SecurityRule[] = [inboundRuleFromAllVMsInVNET];

  const securityGroup: NetworkSecurityGroup = {
    id:
      '/subscriptions/uuid/resourceGroups/xtest/providers/Microsoft.Network/networkSecurityGroups/test-ssh',
    name: 'test-ssh',
    type: 'Microsoft.Network/networkSecurityGroups',
    location: 'eastus2',
    tags: {},
    securityRules,
    defaultSecurityRules,
    resourceGuid: 'id',
    provisioningState: 'Succeeded',
    etag: '',
  };

  const inboundRuleFromSingleIpToSubnetRelationship = createIntegrationRelationship(
    {
      _class: 'ALLOWS',
      _mapping: {
        relationshipDirection: RelationshipDirection.REVERSE,
        sourceEntityKey: securityGroup.id as string,
        targetFilterKeys: [
          ['_class', 'ipAddress', 'publicIpAddress', 'displayName'],
        ],
        targetEntity: {
          _class: 'Host',
          ipAddress: '4.3.2.1',
          publicIpAddress: '4.3.2.1',
          displayName: '4.3.2.1',
        },
        skipTargetCreation: false,
      },
      properties: {
        ...convertProperties(inboundRuleFromSingleIpToSubnet, {
          stringifyArray: true,
        }),
        _key: `${SECURITY_GROUP_RULE_RELATIONSHIP_TYPE}:${inboundRuleFromSingleIpToSubnet.id}:8080:Host:4.3.2.1:4.3.2.1:4.3.2.1`,
        _type: SECURITY_GROUP_RULE_RELATIONSHIP_TYPE,
        ingress: true,
        inbound: true,
        egress: false,
        outbound: false,
        portRange: '8080',
        fromPort: 8080,
        toPort: 8080,
        protocol: '*',
        ipProtocol: '*',
        priority: 100,
        ruleNumber: 100,
      },
    },
  );

  const outboundRuleFromHighPortsToMultiplePortRangesRelationships = [
    createIntegrationRelationship({
      _class: 'ALLOWS',
      _mapping: {
        relationshipDirection: RelationshipDirection.FORWARD,
        sourceEntityKey: securityGroup.id as string,
        targetFilterKeys: [['_key']],
        targetEntity: INTERNET,
        skipTargetCreation: false,
      },
      properties: {
        ...convertProperties(outboundRuleFromHighPortsToMultiplePortRanges, {
          stringifyArray: true,
        }),
        _key: `${SECURITY_GROUP_RULE_RELATIONSHIP_TYPE}:${outboundRuleFromHighPortsToMultiplePortRanges.id}:8080-8082:internet`,
        _type: SECURITY_GROUP_RULE_RELATIONSHIP_TYPE,
        ingress: false,
        inbound: false,
        egress: true,
        outbound: true,
        portRange: '8080-8082',
        fromPort: 8080,
        toPort: 8082,
        protocol: 'tcp',
        ipProtocol: 'tcp',
        priority: 100,
        ruleNumber: 100,
      },
    }),
    createIntegrationRelationship({
      _class: 'ALLOWS',
      _mapping: {
        relationshipDirection: RelationshipDirection.FORWARD,
        sourceEntityKey: securityGroup.id as string,
        targetFilterKeys: [['_key']],
        targetEntity: INTERNET,
        skipTargetCreation: false,
      },
      properties: {
        ...convertProperties(outboundRuleFromHighPortsToMultiplePortRanges, {
          stringifyArray: true,
        }),
        _key: `${SECURITY_GROUP_RULE_RELATIONSHIP_TYPE}:${outboundRuleFromHighPortsToMultiplePortRanges.id}:7070-7071:internet`,
        _type: SECURITY_GROUP_RULE_RELATIONSHIP_TYPE,
        ingress: false,
        inbound: false,
        egress: true,
        outbound: true,
        portRange: '7070-7071',
        fromPort: 7070,
        toPort: 7071,
        protocol: 'tcp',
        ipProtocol: 'tcp',
        priority: 100,
        ruleNumber: 100,
      },
    }),
  ];

  const inboundRuleFromAllVMsInVNETRelationship = createIntegrationRelationship(
    {
      _class: 'ALLOWS',
      _mapping: {
        relationshipDirection: RelationshipDirection.REVERSE,
        sourceEntityKey: securityGroup.id as string,
        targetFilterKeys: [['_class', '_type', 'displayName']],
        targetEntity: {
          _class: 'Service',
          _type: 'azure_virtual_network',
          displayName: 'VirtualNetwork',
        },
        skipTargetCreation: false,
      },
      properties: {
        ...convertProperties(inboundRuleFromAllVMsInVNET, {
          stringifyArray: true,
        }),
        _key: `${SECURITY_GROUP_RULE_RELATIONSHIP_TYPE}:${inboundRuleFromAllVMsInVNET.id}:*:Service:azure_virtual_network:VirtualNetwork`,
        _type: SECURITY_GROUP_RULE_RELATIONSHIP_TYPE,
        ingress: true,
        inbound: true,
        egress: false,
        outbound: false,
        portRange: '*',
        fromPort: 0,
        toPort: 65535,
        protocol: '*',
        ipProtocol: '*',
        priority: 65000,
        ruleNumber: 65000,
      },
    },
  );

  test('inbound rule from single IP to private subnet', () => {
    const rules = processSecurityGroupRule(inboundRuleFromSingleIpToSubnet);

    expect(rules.length).toEqual(1);
    expect(rules[0].targets.length).toEqual(1);

    const rule = rules[0];
    const targetEntity = rule.targets[0];

    expect(
      createSecurityGroupRuleMappedRelationship(
        securityGroup,
        rule,
        targetEntity,
      ),
    ).toEqual(inboundRuleFromSingleIpToSubnetRelationship);
  });

  test('outbound rule from high source ports to multiple dest port ranges', () => {
    const rules = processSecurityGroupRule(
      outboundRuleFromHighPortsToMultiplePortRanges,
    );

    expect(rules.length).toEqual(2);

    const [portRange0Rule, portRange1Rule] = rules;
    expect(portRange0Rule.targets.length).toEqual(1);
    expect(portRange1Rule.targets.length).toEqual(1);

    expect(
      createSecurityGroupRuleMappedRelationship(
        securityGroup,
        portRange0Rule,
        portRange0Rule.targets[0],
      ),
    ).toEqual(outboundRuleFromHighPortsToMultiplePortRangesRelationships[0]);

    expect(
      createSecurityGroupRuleMappedRelationship(
        securityGroup,
        portRange1Rule,
        portRange1Rule.targets[0],
      ),
    ).toEqual(outboundRuleFromHighPortsToMultiplePortRangesRelationships[1]);
  });

  test('inbound rule from all VMs in VNET', () => {
    const rules = processSecurityGroupRule(inboundRuleFromAllVMsInVNET);

    expect(rules.length).toEqual(1);
    expect(rules[0].targets.length).toEqual(1);

    expect(
      createSecurityGroupRuleMappedRelationship(
        securityGroup,
        rules[0],
        rules[0].targets[0],
      ),
    ).toEqual(inboundRuleFromAllVMsInVNETRelationship);
  });

  test('create rules from security group', () => {
    expect(processSecurityGroupRules(securityGroup).length).toEqual(4);
  });
});
