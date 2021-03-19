import { FirewallRule } from '@azure/arm-sql/esm/models';
import { entities } from './constants';
import { createSqlServerFirewallRuleEntity } from './converters';

test('createSqlServerFirewallRuleEntity', () => {
  const firewallRule: FirewallRule = {
    id:
      '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Sql/servers/j1dev-sqlserver/firewallRules/some other rule',
    name: 'some other rule',
    type: 'Microsoft.Sql/servers/firewallRules',
    kind: 'v12.0',
    location: 'East US',
    startIpAddress: '10.0.0.0',
    endIpAddress: '10.255.255.255',
  };

  const firewallRuleEntity = createSqlServerFirewallRuleEntity(firewallRule);

  expect(firewallRuleEntity).toMatchGraphObjectSchema({
    _class: entities.FIREWALL_RULE._class,
  });
  expect(firewallRuleEntity).toMatchSnapshot();
});
