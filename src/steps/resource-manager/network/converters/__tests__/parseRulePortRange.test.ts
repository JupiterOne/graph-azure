import parseRulePortRange from '../parseRulePortRange';

test('range', () => {
  const portRange = '8080-8081';
  expect(parseRulePortRange(portRange)).toEqual({
    portRange,
    fromPort: 8080,
    toPort: 8081,
  });
});

test('single port', () => {
  const portRange = '22';
  expect(parseRulePortRange(portRange)).toEqual({
    portRange,
    fromPort: 22,
    toPort: 22,
  });
});

test('* => 0-65535', () => {
  const portRange = '*';
  expect(parseRulePortRange(portRange)).toEqual({
    portRange,
    fromPort: 0,
    toPort: 65535,
  });
});
