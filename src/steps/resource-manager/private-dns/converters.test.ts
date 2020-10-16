import { createAzureWebLinker } from '../../../azure';
import {
  createPrivateDnsZoneEntity,
  createPrivateDnsRecordSetEntity,
} from './converters';
import { PrivateZone, RecordSet } from '@azure/arm-privatedns/esm/models';

const webLinker = createAzureWebLinker('something.onmicrosoft.com');

describe('createPrivateDnsZoneEntity', () => {
  test('properties transferred', () => {
    const data: PrivateZone = {
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Network/privateDnsZones/jupiterone-dev.com',
      name: 'jupiterone-dev.com',
      type: 'Microsoft.Network/privateDnsZones',
      tags: {},
      location: 'global',
      etag: 'f7c2be09-f492-4470-9663-739cabcbecfd',
      maxNumberOfRecordSets: 25000,
      numberOfRecordSets: 2,
      maxNumberOfVirtualNetworkLinks: 1000,
      numberOfVirtualNetworkLinks: 0,
      maxNumberOfVirtualNetworkLinksWithRegistration: 100,
      numberOfVirtualNetworkLinksWithRegistration: 0,
      provisioningState: 'Succeeded',
    };

    expect(createPrivateDnsZoneEntity(webLinker, data)).toMatchSnapshot();
    expect(
      createPrivateDnsZoneEntity(webLinker, data),
    ).toMatchGraphObjectSchema({
      _class: ['DomainZone'],
    });
  });
});

describe('createDnsRecordSetEntity', () => {
  test('properties transferred', () => {
    const data: RecordSet = {
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Network/privateDnsZones/jupiterone-dev.com/SOA/@',
      name: '@',
      type: 'Microsoft.Network/privateDnsZones/SOA',
      etag: '589999ef-895a-45ff-961e-6984428e321b',
      ttl: 3600,
      fqdn: 'jupiterone-dev.com.',
      isAutoRegistered: false,
      soaRecord: {
        host: 'azureprivatedns.net',
        email: 'azureprivatedns-host.microsoft.com',
        serialNumber: 1,
        refreshTime: 3600,
        retryTime: 300,
        expireTime: 2419200,
        minimumTtl: 10,
      },
    };

    expect(createPrivateDnsRecordSetEntity(webLinker, data)).toMatchSnapshot();
    expect(
      createPrivateDnsRecordSetEntity(webLinker, data),
    ).toMatchGraphObjectSchema({
      _class: ['DomainRecord'],
    });
  });
});
