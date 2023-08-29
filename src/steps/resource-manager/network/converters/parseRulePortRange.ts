import { RulePortRange } from './types';

export default function parseRulePortRange(portRange: string): RulePortRange {
  if (portRange && portRange.length > 0) {
    if (portRange === '*') {
      return {
        portRange,
        fromPort: 0,
        toPort: 65535,
      };
    }
    const ports = portRange.split('-');
    const fromPort = parseInt(ports[0]);
    const toPort = parseInt(ports[1] || ports[0]);
    return { portRange, fromPort, toPort };
  } else {
    return { portRange };
  }
}
