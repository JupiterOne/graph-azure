import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';

import {
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { J1ApiManagementClient } from './client';
import { IntegrationConfig } from '../../../types';
import {
  ApiManagementServiceResource,
  ApiContract,
} from '@azure/arm-apimanagement/esm/models';

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

describe('iterate api management services', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateApiManagementServices',
    });

    const client = new J1ApiManagementClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const resources: ApiManagementServiceResource[] = [];
    await client.iterateApiManagementServices((e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        name: 'j1dev',
      }),
    );
  });
});

describe('iterate api management service APIs', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateApiManagementServiceApis',
    });

    const client = new J1ApiManagementClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const apiManagementService = {
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ApiManagement/service/j1dev',
      name: 'j1dev',
    };

    const resources: ApiContract[] = [];
    await client.iterateApiManagementServiceApis(apiManagementService, (e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        name: 'echo-api',
      }),
    );
    expect(resources).toContainEqual(
      expect.objectContaining({
        name: 'j1dev-api',
      }),
    );
  });
});
