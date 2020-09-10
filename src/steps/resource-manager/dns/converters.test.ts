import { createAzureWebLinker } from '../../../azure';
import { createDnsZoneEntity, createDnsRecordSetEntity } from './converters';
import { Zone, RecordSet } from '@azure/arm-dns/esm/models';

const webLinker = createAzureWebLinker('something.onmicrosoft.com');

describe('createDnsZoneEntity', () => {
  test('properties transferred', () => {
    const data: Zone = {
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Network/dnszones/jupiterone-dev.com',
      name: 'jupiterone-dev.com',
      type: 'Microsoft.Network/dnszones',
      location: 'global',
      tags: {},
      etag: '00000002-0000-0000-2251-9a8ae586d601',
      maxNumberOfRecordSets: 10000,
      numberOfRecordSets: 3,
      nameServers: [
        'ns1-05.azure-dns.com.',
        'ns2-05.azure-dns.net.',
        'ns3-05.azure-dns.org.',
        'ns4-05.azure-dns.info.',
      ],
      zoneType: 'Public',
    };

    expect(createDnsZoneEntity(webLinker, data)).toMatchSnapshot();
    expect(createDnsZoneEntity(webLinker, data)).toMatchGraphObjectSchema({
      _class: ['DomainZone'],
      schema: {},
    });
  });
});

describe('createDnsRecordSetEntity', () => {
  test('properties transferred', () => {
    const data: RecordSet = {
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Network/dnszones/jupiterone-dev.com/SOA/@',
      name: '@',
      type: 'Microsoft.Network/dnszones/SOA',
      etag: '1860ae74-f08a-4ea4-ad3c-3583ae11ec4b',
      tTL: 3600,
      fqdn: 'jupiterone-dev.com.',
      provisioningState: 'Succeeded',
      targetResource: {},
      soaRecord: {
        host: 'ns1-05.azure-dns.com.',
        email: 'azuredns-hostmaster.microsoft.com',
        serialNumber: 1,
        refreshTime: 3600,
        retryTime: 300,
        expireTime: 2419200,
        minimumTtl: 300,
      },
    };

    expect(createDnsRecordSetEntity(webLinker, data)).toMatchSnapshot();
    expect(createDnsRecordSetEntity(webLinker, data)).toMatchGraphObjectSchema({
      _class: ['DomainRecord'],
      schema: {},
    });
  });
});
