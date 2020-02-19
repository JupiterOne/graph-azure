import {
  SecurityRule,
  NetworkSecurityGroup,
} from "@azure/arm-network/esm/models";
import {
  FirewallRuleProperties,
  IntegrationRelationship,
  RelationshipMapping,
  createIntegrationRelationship,
  DataModel,
  RelationshipDirection,
  convertProperties,
} from "@jupiterone/jupiter-managed-integration-sdk";
import { SECURITY_GROUP_RULE_RELATIONSHIP_TYPE } from "../jupiterone";

interface SecurityGroupRelationship extends IntegrationRelationship {
  _mapping?: RelationshipMapping;
}

interface RuleTarget {
  _key?: string;
  _type?: string;
  _class?: string;
  internet?: boolean;
  ipAddress?: string;
  publicIpAddress?: string;
  CIDR?: string;
}
interface Rule {
  access: string;
  targets: RuleTarget[];
  properties: FirewallRuleProperties & {
    _type: string;
    srcPortRange?: string;
    srcPortRanges?: string;
    dstPortRange?: string;
    dstPortRanges?: string;
  };
}

export function createSecurityGroupRuleRelationships(sg: NetworkSecurityGroup) {
  const relationships: SecurityGroupRelationship[] = [];
  const rules = processSecurityGroupRules(sg);
  for (const rule of rules) {
    const _class = rule.access === "Allow" ? "ALLOWS" : "DENIES";
    const relationshipDirection = rule.properties.ingress
      ? RelationshipDirection.REVERSE
      : RelationshipDirection.FORWARD;

    for (const target of rule.targets) {
      const targetFilterKeys = target.internet
        ? [["_key"]]
        : [Object.keys(target)];
      const targetEntity = target.internet
        ? DataModel.INTERNET
        : (target as any);

      relationships.push(
        createIntegrationRelationship({
          _class,
          _mapping: {
            relationshipDirection,
            sourceEntityKey: sg.id as string,
            targetFilterKeys,
            targetEntity,
            skipTargetCreation: !!target._key,
          },
          properties: rule.properties,
        }),
      );
    }
  }

  return relationships;
}

export function processSecurityGroupRules(sg: NetworkSecurityGroup) {
  const results: Rule[] = [];
  const rules = [
    ...(sg.defaultSecurityRules || []),
    ...(sg.securityRules || []),
  ];
  for (const rule of rules) {
    const dstPorts = getPortsFromRange(rule.destinationPortRange);
    const properties = {
      ...convertProperties(rule, { stringifyArray: true }),
      _type: SECURITY_GROUP_RULE_RELATIONSHIP_TYPE,
      ingress: rule.direction === "Inbound",
      inbound: rule.direction === "Inbound",
      egress: rule.direction === "Outbound",
      outbound: rule.direction === "Outbound",
      fromPort: dstPorts.fromPort,
      toPort: dstPorts.toPort,
      protocol: rule.protocol.toLowerCase(),
      ipProtocol: rule.protocol.toLowerCase(),
      priority: rule.priority,
      ruleNumber: rule.priority,
    };

    const targetPrefixes =
      rule.direction === "Inbound"
        ? [
            rule.destinationAddressPrefix,
            ...(rule.destinationAddressPrefixes || []),
          ]
        : [rule.sourceAddressPrefix, ...(rule.sourceAddressPrefixes || [])];

    const targets: RuleTarget[] = [];
    for (const targetPrefix of targetPrefixes) {
      if (targetPrefix === "VirtualNetwork") {
        for (const subnet of sg.subnets || []) {
          targets.push({ _key: subnet.id });
        }
      } else if (targetPrefix === "AzureLoadBalancer") {
        // TODO
      } else if (targetPrefix === "Internet") {
        targets.push({ internet: true });
      } else if (targetPrefix && DataModel.ipUtil.isIpv4(targetPrefix)) {
        if (DataModel.ipUtil.isInternet(targetPrefix)) {
          targets.push({ internet: true });
        } else if (DataModel.ipUtil.isHost(targetPrefix)) {
          const publicIpAddress = DataModel.ipUtil.isPublicIp(targetPrefix)
            ? targetPrefix
            : undefined;
          targets.push({
            _class: "Host",
            ipAddress: targetPrefix,
            publicIpAddress,
          });
        } else if (DataModel.ipUtil.isPublicIp(targetPrefix)) {
          targets.push({
            _class: "Network",
            CIDR: targetPrefix,
          });
        } else {
          targets.push({
            _type: "azure_subnet",
            CIDR: targetPrefix,
          });
        }
      } else if (targetPrefix && DataModel.ipUtil.isIpv4(targetPrefix)) {
        const publicIpAddress = DataModel.ipUtil.isPublicIp(targetPrefix)
          ? targetPrefix
          : undefined;
        targets.push({
          _class: "Host",
          ipAddress: targetPrefix,
          publicIpAddress,
        });
      }
    }

    results.push({
      access: rule.access,
      targets,
      properties,
    });
  }
  return results;
}

type portRange = {
  fromPort?: number;
  toPort?: number;
};

export function getPortsFromRange(portRange: string | undefined): portRange {
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
