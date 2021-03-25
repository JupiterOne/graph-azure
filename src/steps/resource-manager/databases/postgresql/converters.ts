import { FirewallRule } from '@azure/arm-postgresql/esm/models';
import { createIntegrationEntity } from '@jupiterone/integration-sdk-core';
import { PostgreSQLEntities } from './constants';

export function createPosgreSqlServerFirewallRuleEntity(
  firewallRule: FirewallRule,
) {
  return createIntegrationEntity({
    entityData: {
      source: firewallRule,
      assign: {
        _key: firewallRule.id,
        _type: PostgreSQLEntities.FIREWALL_RULE._type,
        _class: PostgreSQLEntities.FIREWALL_RULE._class,
        name: firewallRule.name,
        id: firewallRule.id,
        category: ['host'],
        type: firewallRule.type,
        startIpAddress: firewallRule.startIpAddress,
        endIpAddress: firewallRule.endIpAddress,
      },
    },
  });
}
