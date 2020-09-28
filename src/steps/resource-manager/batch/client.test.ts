import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';
import {
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { BatchClient } from './client';
import { IntegrationConfig } from '../../../types';
import {
  BatchAccount,
  Pool,
  Application,
  Certificate,
} from '@azure/arm-batch/esm/models';

// developer used different creds than ~/test/integrationInstanceConfig
const config: IntegrationConfig = {
  clientId: process.env.CLIENT_ID || 'clientId',
  clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
  directoryId: 'bcd90474-9b62-4040-9d7b-8af257b1427d',
  subscriptionId: '40474ebe-55a2-4071-8fa8-b610acdd8e56',
};

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

describe('iterate batch accounts', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateBatchAccounts',
    });

    const client = new BatchClient(config, createMockIntegrationLogger(), true);

    const resourceGroupInfo = {
      resourceGroupName: 'j1dev',
    };

    const resources: BatchAccount[] = [];
    await client.iterateBatchAccounts(resourceGroupInfo, (e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/${resourceGroupInfo.resourceGroupName}/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount`,
        name: 'j1devbatchaccount',
        type: 'Microsoft.Batch/batchAccounts',
        location: 'eastus',
        accountEndpoint: expect.any(String),
        activeJobAndJobScheduleQuota: expect.any(Number),
        dedicatedCoreQuota: expect.any(Number),
        lowPriorityCoreQuota: expect.any(Number),
        poolAllocationMode: expect.any(String),
        poolQuota: expect.any(Number),
        provisioningState: expect.any(String),
        autoStorage: expect.objectContaining({
          lastKeySync: expect.any(Date),
          storageAccountId: expect.any(String),
        }),
      }),
    );
  });
});

describe('iterate batch account pools', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateBatchAccountPools',
    });

    const client = new BatchClient(config, createMockIntegrationLogger(), true);

    const resourceGroup = {
      name: 'j1dev',
      location: 'eastus',
    };
    const batchAccountInfo = {
      resourceGroupName: resourceGroup.name,
      batchAccountName: 'j1devbatchaccount',
    };

    const resources: Pool[] = [];

    await client.iterateBatchPools(batchAccountInfo, (e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/${resourceGroup.name}/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount/pools/j1devbatchpool`,
        name: 'j1devbatchpool',
        displayName: 'J1 Dev Batch Account Pool',
        type: 'Microsoft.Batch/batchAccounts/pools',
      }),
    );
  });
});

describe('iterate batch account applications', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateBatchAccountApplications',
    });

    const client = new BatchClient(config, createMockIntegrationLogger(), true);

    const resourceGroup = {
      name: 'j1dev',
      location: 'eastus',
    };
    const batchAccountInfo = {
      resourceGroupName: resourceGroup.name,
      batchAccountName: 'j1devbatchaccount',
    };

    const resources: Application[] = [];

    await client.iterateBatchApplications(batchAccountInfo, (e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        id: 'j1devbatchapplication',
        displayName: expect.any(String),
        packages: expect.any(Array),
        allowUpdates: expect.any(Boolean),
      }),
    );
  });
});

describe('iterate batch account certificates', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateBatchAccountCertificates',
    });

    const client = new BatchClient(config, createMockIntegrationLogger(), true);

    const resourceGroup = {
      name: 'j1dev',
      location: 'eastus',
    };
    const batchAccountInfo = {
      resourceGroupName: resourceGroup.name,
      batchAccountName: 'j1devbatchaccount',
    };

    const resources: Certificate[] = [];

    await client.iterateBatchCertificates(batchAccountInfo, (e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount/certificates/sha1-6820fee71b8312b01159d3c09fcb9f7ab24ae60d`,
        name: 'sha1-6820fee71b8312b01159d3c09fcb9f7ab24ae60d',
        type: 'Microsoft.Batch/batchAccounts/certificates',
        format: 'Cer',
        thumbprint: '6820fee71b8312b01159d3c09fcb9f7ab24ae60d',
        thumbprintAlgorithm: 'sha1',
        publicData:
          'MIIDljCCAn4CCQDvLsedfPYEHDANBgkqhkiG9w0BAQsFADCBjDELMAkGA1UEBhMCVVMxDTALBgNVBAgMBFV0YWgxFTATBgNVBAcMDFNvdXRoIEpvcmRhbjENMAsGA1UECgwEVGVzdDESMBAGA1UECwwJVGVzdCBVbml0MRYwFAYDVQQDDA1UZXN0aW5nIEJhdGNoMRwwGgYJKoZIhvcNAQkBFg10ZXN0QHRlc3QuY29tMB4XDTIwMDkyNjA1NTI1NVoXDTIxMDkyNjA1NTI1NVowgYwxCzAJBgNVBAYTAlVTMQ0wCwYDVQQIDARVdGFoMRUwEwYDVQQHDAxTb3V0aCBKb3JkYW4xDTALBgNVBAoMBFRlc3QxEjAQBgNVBAsMCVRlc3QgVW5pdDEWMBQGA1UEAwwNVGVzdGluZyBCYXRjaDEcMBoGCSqGSIb3DQEJARYNdGVzdEB0ZXN0LmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALmNVea9Sm4GHv69qm1kSb6vExnkw9N3hBLm9AVc++KLzDgMx/ME4ih3I8Thb6ApbjXIp2G3Wa/AOQIc58fYrJeQQus3ZY2LGuQBmPzDK4/a94VZCRr7kJWUDjtVeIVd+sIrxmK+t6PXjmMfeKn8JUb7nyzPxK7g6BZwYbq4zX7vJ7iPC8bD2hydrCgPftBt6UklJK7KbD9Ex4/3vU94c36AOvq4QZsHXvneaPBObKN1FoyRJgvtK9+1J0TWvFWmYyoIHE/6YLqafIG+zsOuT8GPFexIoTgjQDi5XjhaPOmS4r+3kmOCNBIBzot/i0zSbwXFH7tttH2qgvYM4dIxm7UCAwEAATANBgkqhkiG9w0BAQsFAAOCAQEAsbREEWVz/GBCjEtOe7YoApG45AJCxvs3j7Ox2S2fl2RPzQcOVCDsm5yn9i5IbsJFpNzK33oZOkqNhrfqAMMyDF/YTK9iQZODC8cBWcgY4Ji3lsyCFotbyLSzutRc9P8rLNtHjUd0CHvXbwT1otcDd8aEX76stgTYsEnUT3rDCLwfNuD/jEs5no5ccOAEEn2iE6NLGu8w7bdLiXwE0/DQrK4GP5shol/vIaiOmhpwoedy/C6G5iZp5lo4wkxNp0jKWi4D3IjlWMgqROjOxM5TJVc73pXdifwhlU7l6SwRZN0rl49hcIW6OlOXQZRYJ/CVlBN6krEgfwhnWgeOC1RqFg==',
      }),
    );
  });
});
