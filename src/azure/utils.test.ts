import { resourceGroupName, getEventGridDomainNameFromId } from './utils';

describe('resourceGroupName', () => {
  test('undefined', () => {
    expect(resourceGroupName(undefined)).toBeUndefined();
  });

  test('not found', () => {
    expect(resourceGroupName('not found')).toBeUndefined();
  });

  test('lowercased', () => {
    expect(
      resourceGroupName(
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/J1DEV/providers/Microsoft.Network/networkInterfaces/j1dev',
      ),
    ).toEqual('j1dev');
    expect(
      resourceGroupName(
        '/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/🤔/providers/Microsoft.Network/networkInterfaces/j1dev',
      ),
    ).toEqual('🤔');
  });

  test('throws error when required, id undefined', () => {
    expect(() => resourceGroupName(undefined, true)).toThrowError(/not found/i);
  });

  test('throws error when required, not found', () => {
    expect(() => resourceGroupName('something strange', true)).toThrowError(
      /not found/i,
    );
  });
});

describe('getEventGridDomainNameFromId', () => {
  test('returns undefined when the id is not supplied', () => {
    let id;
    expect(getEventGridDomainNameFromId(id)).toBeUndefined();
  });

  test('returns undefined when the id does not contain a domain name', () => {
    expect(
      getEventGridDomainNameFromId(
        '/subscriptions/1234/resourceGroups/abcd/providers/Microsoft.TestProvider/',
      ),
    ).toBeUndefined();
  });

  test('returns the domain name when it is found in the id', () => {
    const domainName = 'j1dev-event-grid-domain';
    expect(
      getEventGridDomainNameFromId(
        `/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/${domainName}/topics/j1dev-event-grid-domain-topic/providers/Microsoft.EventGrid/eventSubscriptions/j1dev-event-grid-domain-topic-subscription`,
      ),
    ).toBe(domainName);
  });

  test('returns the undefined when the domain name pattern is found, but the domain name is falsy', () => {
    const domainName = '';
    expect(
      getEventGridDomainNameFromId(
        `/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.EventGrid/domains/${domainName}/topics/j1dev-event-grid-domain-topic/providers/Microsoft.EventGrid/eventSubscriptions/j1dev-event-grid-domain-topic-subscription`,
      ),
    ).toBeUndefined();
  });
});
