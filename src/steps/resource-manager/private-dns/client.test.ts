import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';

import {
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { J1PrivateDnsManagementClient } from './client';
import { IntegrationConfig } from '../../../types';
import { PrivateZone, RecordSet } from '@azure/arm-privatedns/esm/models';

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

describe('iterate private dns zones', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iteratePrivateDnsZones',
    });

    const client = new J1PrivateDnsManagementClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const resources: PrivateZone[] = [];
    await client.iteratePrivateDnsZones((e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        name: 'jupiterone-dev.com',
      }),
    );
  });
});

describe('iterate private dns record sets', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iteratePrivateDnsRecordSets',
    });

    const client = new J1PrivateDnsManagementClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const privateDnsZone = {
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Network/privateDnsZones/jupiterone-dev.com',
      name: 'jupiterone-dev.com',
    };

    const resources: RecordSet[] = [];
    await client.iteratePrivateDnsRecordSets(privateDnsZone, (e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        name: 'j1dev',
      }),
    );
  });
});
