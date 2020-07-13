import {
  SecurityRule,
  NetworkSecurityGroup,
} from '@azure/arm-network/esm/models';

export default function isWideOpenSecurityGroup(
  sg: NetworkSecurityGroup,
): boolean {
  const rules = [
    ...(sg.defaultSecurityRules || []),
    ...(sg.securityRules || []),
  ];

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

function findAllowAllRule(rules: SecurityRule[]): SecurityRule | undefined {
  return findAnyAnyRule(rules, 'Allow');
}

function findDenyAllRule(rules: SecurityRule[]): SecurityRule | undefined {
  return findAnyAnyRule(rules, 'Deny');
}

function findAnyAnyRule(
  rules: SecurityRule[],
  access: SecurityRule['access'],
): SecurityRule | undefined {
  return rules.find(
    (r) =>
      r.destinationAddressPrefix === '*' &&
      r.destinationPortRange === '*' &&
      r.sourcePortRange === '*' &&
      r.sourceAddressPrefix === '*' &&
      r.protocol === '*' &&
      r.access === access,
  );
}
