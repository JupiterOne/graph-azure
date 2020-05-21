import snakeCase from "lodash.snakecase";

import {
  SecurityRule,
  NetworkSecurityGroup,
} from "@azure/arm-network/esm/models";

import { SECURITY_GROUP_RULE_RELATIONSHIP_TYPE } from "../../../../jupiterone";
import { Relationship, FirewallRuleProperties, RelationshipDirection, createIntegrationRelationship } from "@jupiterone/integration-sdk";

// interface SecurityGroupRelationship extends Relationship {
//   _mapping?: RelationshipMapping;
// }

interface RuleTargetEntity {
  _key?: string;
  _type?: string;
  _class?: string;
  _integrationInstanceId?: string;
  displayName?: string;
  internet?: boolean;
  ipAddress?: string;
  publicIpAddress?: string;
  CIDR?: string;
}

interface Rule {
  id: string;
  access: string;
  targets: RuleTargetEntity[];
  properties: FirewallRuleProperties & {
    _type: string;
    srcPortRange?: string;
    srcPortRanges?: string;
    dstPortRange?: string;
    dstPortRanges?: string;
  };
}

export function createSecurityGroupRuleRelationships(
  sg: NetworkSecurityGroup,
  _integrationInstanceId: string,
): Relationship[] {
  const relationships: Relationship[] = [];
  const rules = processSecurityGroupRules(sg, _integrationInstanceId);
  for (const rule of rules) {
    relationships.push(
      ...createSecurityGroupRuleRelationshipsFromRule(sg.id as string, rule),
    );
  }

  return relationships;
}

export function createSecurityGroupRuleRelationshipsFromRule(
  sgId: string,
  rule: Rule,
): Relationship[] {
  const relationships: Relationship[] = [];

  const _class = rule.access === "Allow" ? "ALLOWS" : "DENIES";
  const relationshipDirection = rule.properties.ingress
    ? RelationshipDirection.REVERSE
    : RelationshipDirection.FORWARD;

  for (const target of rule.targets) {
    const targetFilterKeys = target.internet
      ? [["_key"]]
      : [Object.keys(target)];
    const targetEntity = target.internet ? DataModel.INTERNET : (target as any);

    relationships.push(
      createIntegrationRelationship({
        _class,
        _mapping: {
          relationshipDirection,
          sourceEntityKey: sgId,
          targetFilterKeys,
          targetEntity,
          skipTargetCreation: !!target._key,
        },
        properties: {
          ...rule.properties,
          _key: `${rule.properties._type}:${rule.id}:${
            rule.properties.portRange
          }:${target.internet ? "internet" : Object.values(target).join(":")}`,
        },
      }),
    );
  }

  return relationships;
}

export function processSecurityGroupRules(
  sg: NetworkSecurityGroup,
  _integrationInstanceId: string,
): Rule[] {
  const results: Rule[] = [];
  const rules = [
    ...(sg.defaultSecurityRules || []),
    ...(sg.securityRules || []),
  ];
  for (const rule of rules) {
    results.push(...processSecurityGroupRule(rule, _integrationInstanceId));
  }
  return results;
}

export function processSecurityGroupRule(
  rule: SecurityRule,
  _integrationInstanceId: string,
): Rule[] {
  const rules: Rule[] = [];

  const targetPortRanges =
    rule.direction === "Inbound"
      ? [rule.sourcePortRange, ...(rule.sourcePortRanges || [])]
      : [rule.destinationPortRange, ...(rule.destinationPortRanges || [])];

  for (const portRange of targetPortRanges) {
    if (!portRange) {
      continue;
    }
    const ports = getPortsFromRange(portRange);
    const properties = {
      ...convertProperties(rule, { stringifyArray: true }),
      _type: SECURITY_GROUP_RULE_RELATIONSHIP_TYPE,
      ingress: rule.direction === "Inbound",
      inbound: rule.direction === "Inbound",
      egress: rule.direction === "Outbound",
      outbound: rule.direction === "Outbound",
      portRange,
      fromPort: ports.fromPort,
      toPort: ports.toPort,
      protocol: rule.protocol.toLowerCase(),
      ipProtocol: rule.protocol.toLowerCase(),
      priority: rule.priority,
      ruleNumber: rule.priority,
    };
    const targetPrefixes =
      rule.direction === "Inbound"
        ? [rule.sourceAddressPrefix, ...(rule.sourceAddressPrefixes || [])]
        : [
            rule.destinationAddressPrefix,
            ...(rule.destinationAddressPrefixes || []),
          ];

    const targets: RuleTargetEntity[] = [];
    for (const targetPrefix of targetPrefixes) {
      if (targetPrefix === "Internet" || targetPrefix === "*") {
        // Target is the Internet
        targets.push({ internet: true });
      } else if (targetPrefix && DataModel.ipUtil.isIpv4(targetPrefix)) {
        // Target is an IPv4 address
        if (DataModel.ipUtil.isInternet(targetPrefix)) {
          // Target is 0.0.0.0/0 (Internet)
          targets.push({ internet: true });
        } else if (DataModel.ipUtil.isHost(targetPrefix)) {
          // Target is a host IP
          const publicIpAddress = DataModel.ipUtil.isPublicIp(targetPrefix)
            ? targetPrefix.replace("/32", "")
            : undefined;
          targets.push({
            _class: "Host",
            ipAddress: targetPrefix.replace("/32", ""),
            publicIpAddress,
          });
        } else if (DataModel.ipUtil.isPublicIp(targetPrefix)) {
          // Target is a public network IP
          targets.push({
            _class: "Network",
            CIDR: targetPrefix,
          });
        } else {
          // Target is a private network IP
          targets.push({
            _class: "Network",
            _type: "azure_subnet",
            _integrationInstanceId,
            CIDR: targetPrefix,
          });
        }
      } else if (targetPrefix) {
        // Target is an Azure serviceTag (e.g. 'VirtualNetwork' or 'AzureLoadBalancer')
        // https://docs.microsoft.com/en-us/azure/virtual-network/security-overview#service-tags
        targets.push({
          _class: "Service",
          _type: `azure_${snakeCase(targetPrefix)}`.replace(
            "azure_azure_",
            "azure_",
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

type portRange = {
  fromPort?: number;
  toPort?: number;
};

export function getPortsFromRange(portRange: string): portRange {
  if (portRange && portRange.length > 0) {
    if (portRange === "*") {
      return {
        fromPort: 0,
        toPort: 65535,
      };
    }
    const ports = portRange.split("-");
    const fromPort = parseInt(ports[0]);
    const toPort = parseInt(ports[1] || ports[0]);
    return { fromPort, toPort };
  } else {
    return {};
  }
}

export function isWideOpen(rules: SecurityRule[]): boolean {
  const allowAllRule = findAllowAllRule(rules);
  const denyAllRule = findDenyAllRule(rules);

  if (allowAllRule && allowAllRule.priority) {
    if (denyAllRule && denyAllRule.priority) {
      return allowAllRule.priority < denyAllRule.priority;
    }
    return true;
  }
  return false;
}

export function findAllowAllRule(
  rules: SecurityRule[],
): SecurityRule | undefined {
  return findAnyAnyRule(rules, "Allow");
}

export function findDenyAllRule(
  rules: SecurityRule[],
): SecurityRule | undefined {
  return findAnyAnyRule(rules, "Deny");
}

export function findAnyAnyRule(
  rules: SecurityRule[],
  access: "Deny" | "Allow",
): SecurityRule | undefined {
  return rules.find(
    r =>
      r.destinationAddressPrefix === "*" &&
      r.destinationPortRange === "*" &&
      r.sourcePortRange === "*" &&
      r.sourceAddressPrefix === "*" &&
      r.protocol === "*" &&
      r.access === access,
  );
}
