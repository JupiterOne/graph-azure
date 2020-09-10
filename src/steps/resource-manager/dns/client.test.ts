import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';

import {
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { J1DnsManagementClient } from './client';
import { IntegrationConfig } from '../../../types';
import { Zone, RecordSet } from '@azure/arm-dns/esm/models';

// developer used different creds than ~/test/integrationInstanceConfig
const config: IntegrationConfig = {
  clientId: process.env.CLIENT_ID || 'clientId',
  clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
  directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
  subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
};

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

describe('iterate dns zones', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateDnsZones',
    });

    const client = new J1DnsManagementClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const resources: Zone[] = [];
    await client.iterateDnsZones((e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        name: 'jupiterone-dev.com',
      }),
    );
  });
});

describe('iterate dns record sets', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateDnsRecordSets',
    });

    const client = new J1DnsManagementClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const dnsZone = {
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Network/dnszones/jupiterone-dev.com',
      name: 'jupiterone-dev.com',
    };

    const resources: RecordSet[] = [];
    await client.iterateDnsRecordSets(dnsZone, (e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        name: 'j1dev',
      }),
    );
  });
});
