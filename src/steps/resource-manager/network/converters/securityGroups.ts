import snakeCase from 'lodash.snakecase';

import {
  NetworkSecurityGroup,
  SecurityRule,
  Subnet,
} from '@azure/arm-network/esm/models';
import { FirewallRuleProperties, INTERNET } from '@jupiterone/data-model';
import {
  convertProperties,
  createIntegrationRelationship,
  Entity,
  isHost,
  isInternet,
  isIpv4,
  isPublicIp,
  Relationship,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';

import {
  SECURITY_GROUP_ENTITY_TYPE,
  SECURITY_GROUP_RULE_RELATIONSHIP_TYPE,
  SUBNET_ENTITY_CLASS,
  SUBNET_ENTITY_TYPE,
} from '../constants';
import parseSecurityRulePortRange from './parseSecurityRulePortRange';
import { SecurityRulePortRange } from './types';

/**
 * The description of an entity that a security group rule references, used to
 * construct relationships between the security group and the entity it
 * protects. In cases where a direct relationship cannot be determined, a mapped
 * relationship will be produced.
 */
interface RuleTargetEntity {
  _key?: string;
  _type?: string;
  _class?: string;
  displayName?: string;
  internet?: boolean;
  ipAddress?: string;
  publicIpAddress?: string;
  CIDR?: string;
}

/**
 * Data representing one of N relationships defined by a single security group
 * `SecurityRule`, determined by the number of `destinationPortRanges`.
 *
 * For each port range specified on the `SecurityRule`, a set of target entities
 * is generated based on the rule's source or destination address prefixes. This
 * allows for relationships between the security group and network/host to
 * express the port range in a numeric fasion, allowing for queries such as
 * `fromPort > 1024`.
 *
 * Each of these `Rule` objects will be converted to a number of relationships
 * for the graph. Targets that are in private network ranges will be defined as
 * direct relationships within the integration instance, while other targets
 * will be expressed as mapped relationships to allow for references outside the
 * integration instance.
 */
interface Rule {
  /**
   * The id of the `SecurityRule` that produced this `Rule`.
   */
  id: SecurityRule['id'];

  /**
   * The network traffic is allowed or denied. Possible values include: 'Allow',
   * 'Deny'
   */
  access: SecurityRule['access'];

  /**
   * Each of the entities that the security group serves as a firewall.
   */
  targets: RuleTargetEntity[];

  /**
   * Properties for the security group -> target network/host relationship
   * represented by this rule.
   */
  properties: FirewallRuleProperties;
}

function securityGroupRuleRelationshipClass(rule: Rule): string {
  return rule.access === 'Allow' ? 'ALLOWS' : 'DENIES';
}

function securityGroupRuleRelationshipDirection(
  rule: Rule,
): RelationshipDirection {
  return rule.properties.ingress
    ? RelationshipDirection.REVERSE
    : RelationshipDirection.FORWARD;
}

function securityGroupRuleRelationshipKeyPrefix(rule: Rule): string {
  return `${SECURITY_GROUP_RULE_RELATIONSHIP_TYPE}:${rule.id}:${rule.properties.portRange}`;
}

export function createSecurityGroupRuleSubnetRelationship(
  sg: NetworkSecurityGroup,
  rule: Rule,
  subnet: Subnet,
): Relationship {
  const direction = securityGroupRuleRelationshipDirection(rule);
  const directionalProperties =
    direction === RelationshipDirection.FORWARD
      ? {
          fromType: SECURITY_GROUP_ENTITY_TYPE,
          fromKey: sg.id as string,
          toType: SUBNET_ENTITY_TYPE,
          toKey: subnet.id as string,
        }
      : {
          fromType: SUBNET_ENTITY_TYPE,
          fromKey: subnet.id as string,
          toType: SECURITY_GROUP_ENTITY_TYPE,
          toKey: sg.id as string,
        };

  return createIntegrationRelationship({
    _class: securityGroupRuleRelationshipClass(rule),
    ...directionalProperties,
    properties: {
      ...rule.properties,
      _type: SECURITY_GROUP_RULE_RELATIONSHIP_TYPE,
      _key: `${securityGroupRuleRelationshipKeyPrefix(rule)}:${subnet.id}`,
    },
  });
}

export function createSecurityGroupRuleMappedRelationship(
  sg: NetworkSecurityGroup,
  rule: Rule,
  target: RuleTargetEntity,
): Relationship {
  const targetFilterKeys = target.internet ? [['_key']] : [Object.keys(target)];
  const targetEntity = target.internet ? INTERNET : (target as Entity);

  return createIntegrationRelationship({
    _class: securityGroupRuleRelationshipClass(rule),
    _mapping: {
      relationshipDirection: securityGroupRuleRelationshipDirection(rule),
      sourceEntityKey: sg.id as string,
      targetFilterKeys,
      targetEntity,
      skipTargetCreation: !!target._key,
    },
    properties: {
      ...rule.properties,
      _type: SECURITY_GROUP_RULE_RELATIONSHIP_TYPE,
      _key: `${securityGroupRuleRelationshipKeyPrefix(rule)}:${
        target.internet ? 'internet' : Object.values(target).join(':')
      }`,
    },
  });
}

export function processSecurityGroupRules(sg: NetworkSecurityGroup): Rule[] {
  const results: Rule[] = [];
  const rules = [
    ...(sg.defaultSecurityRules || []),
    ...(sg.securityRules || []),
  ];
  for (const rule of rules) {
    results.push(...processSecurityGroupRule(rule));
  }
  return results;
}

export function processSecurityGroupRule(rule: SecurityRule): Rule[] {
  const rules: Rule[] = [];

  const targetPortRanges = parsePortRanges(rule);
  const targetPrefixes = getDirectionalRulePrefixes(rule);

  for (const portRange of targetPortRanges) {
    const properties = buildFirewallRulePropertiesForPortRange(rule, portRange);

    const targets: RuleTargetEntity[] = [];
    for (const targetPrefix of targetPrefixes) {
      if (targetPrefix === 'Internet' || targetPrefix === '*') {
        // Target is the Internet
        targets.push({ internet: true });
      } else if (targetPrefix && isIpv4(targetPrefix)) {
        // Target is an IPv4 address
        if (isInternet(targetPrefix)) {
          // Target is 0.0.0.0/0 (Internet)
          targets.push({ internet: true });
        } else if (isHost(targetPrefix)) {
          // Target is a host IP
          const publicIpAddress = isPublicIp(targetPrefix)
            ? targetPrefix.replace('/32', '')
            : undefined;
          const hostIpAddress = targetPrefix.replace('/32', '');
          targets.push({
            _class: 'Host',
            ipAddress: hostIpAddress,
            publicIpAddress,
            displayName: hostIpAddress,
          });
        } else if (isPublicIp(targetPrefix)) {
          // Target is a public network IP
          targets.push({
            _class: 'Network',
            CIDR: targetPrefix,
          });
        } else {
          // Target is a private network IP
          targets.push({
            _class: SUBNET_ENTITY_CLASS,
            _type: SUBNET_ENTITY_TYPE,
            CIDR: targetPrefix,
          });
        }
      } else if (targetPrefix) {
        // Target is an Azure serviceTag (e.g. 'VirtualNetwork' or 'AzureLoadBalancer')
        // https://docs.microsoft.com/en-us/azure/virtual-network/security-overview#service-tags
        targets.push({
          _class: 'Service',
          _type: `azure_${snakeCase(targetPrefix)}`.replace(
            'azure_azure_',
            'azure_',
          ),
          displayName: targetPrefix,
        });
      }
    }

    rules.push({
      id: rule.id as string,
      access: rule.access,
      targets,
      properties,
    });
  }

  return rules;
}

function parsePortRanges(rule: SecurityRule): SecurityRulePortRange[] {
  const definedRule = (e: string | undefined) => !!e;
  return ([
    rule.destinationPortRange,
    ...(rule.destinationPortRanges || []),
  ].filter(definedRule) as string[]).map(parseSecurityRulePortRange);
}

/**
 * @returns address prefixes based on a `SecurityRule`'s direction (source for
 * Inbound, destination otherwise)
 *
 * @param rule a security group rule
 */
function getDirectionalRulePrefixes(rule: SecurityRule) {
  return rule.direction === 'Inbound'
    ? [rule.sourceAddressPrefix, ...(rule.sourceAddressPrefixes || [])]
    : [
        rule.destinationAddressPrefix,
        ...(rule.destinationAddressPrefixes || []),
      ];
}

/**
 * @returns properties for the relationships between a security group entity and
 * the network/host entities referenced by the rule's address prefixes, within a
 * particular `portRange`
 *
 * @param rule a security group rule
 * @param portRange the security group rule port range
 */
function buildFirewallRulePropertiesForPortRange(
  rule: SecurityRule,
  portRange: SecurityRulePortRange,
): FirewallRuleProperties {
  return {
    ...convertProperties(rule, { stringifyArray: true }),
    ingress: rule.direction === 'Inbound',
    inbound: rule.direction === 'Inbound',
    egress: rule.direction === 'Outbound',
    outbound: rule.direction === 'Outbound',
    portRange: portRange.portRange,
    fromPort: portRange.fromPort,
    toPort: portRange.toPort,
    protocol: rule.protocol.toLowerCase(),
    ipProtocol: rule.protocol.toLowerCase(),
    priority: rule.priority,
    ruleNumber: rule.priority,
  };
}
