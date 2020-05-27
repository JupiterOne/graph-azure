import {
  NetworkInterface,
  NetworkSecurityGroup,
  PublicIPAddress,
  VirtualNetwork,
} from '@azure/arm-network/esm/models';
import { createMockIntegrationLogger } from '@jupiterone/integration-sdk/testing';

import {
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import config from '../../../../test/integrationInstanceConfig';
import { NetworkClient } from './client';

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

describe('iterateNetworkInterfaces', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateNetworkInterfaces',
    });

    const client = new NetworkClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const resources: NetworkInterface[] = [];
    await client.iterateNetworkInterfaces((e) => {
      resources.push(e);
    });

    expect(resources).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: 'j1dev',
        tags: expect.objectContaining({
          environment: 'j1dev',
        }),
      }),
    ]);
  });
});

describe('iterateNetworkSecurityGroups', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateNetworkSecurityGroups',
    });

    const client = new NetworkClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const securityGroups: NetworkSecurityGroup[] = [];
    await client.iterateNetworkSecurityGroups((e) => {
      securityGroups.push(e);
    });

    expect(securityGroups).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: 'j1dev',
        tags: expect.objectContaining({
          environment: 'j1dev',
        }),
        // ensure subnet references come back
        subnets: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
          }),
        ]),
      }),
    ]);
  });
});

describe('iteratePublicIPAddresses', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iteratePublicIPAddresses',
    });

    const client = new NetworkClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const addresses: PublicIPAddress[] = [];
    await client.iteratePublicIPAddresses((e) => {
      addresses.push(e);
    });

    expect(addresses).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: 'j1dev',
        tags: expect.objectContaining({
          environment: 'j1dev',
        }),
      }),
    ]);
  });
});

describe('iterateVirtualNetworks', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateVirtualNetworks',
    });

    const client = new NetworkClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const vms: VirtualNetwork[] = [];
    await client.iterateVirtualNetworks((e) => {
      vms.push(e);
    });

    expect(vms).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: 'j1dev',
        tags: expect.objectContaining({
          environment: 'j1dev',
        }),
      }),
    ]);
  });
});
