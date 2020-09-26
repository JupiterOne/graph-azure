import {
  BatchAccount,
  Pool,
  Application,
  Certificate,
} from '@azure/arm-batch/esm/models';
import { Entity } from '@jupiterone/integration-sdk-core';
import { createAzureWebLinker } from '../../../azure';
import {
  createBatchAccountEntity,
  createBatchPoolEntity,
  createBatchApplicationEntity,
  createBatchCertificateEntity,
} from './converters';

const webLinker = createAzureWebLinker('something.onmicrosoft.com');

describe('createBatchAccountEntity', () => {
  test('properties transferred', () => {
    const data: BatchAccount = {
      accountEndpoint: 'j1devbatchaccount.eastus.batch.azure.com',
      activeJobAndJobScheduleQuota: 100,
      autoStorage: {
        lastKeySync: new Date('2020-09-25T23:45:28.358Z'),
        storageAccountId:
          '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/keionnedj1dev',
      },
      dedicatedCoreQuota: 20,
      id:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount',
      location: 'eastus',
      lowPriorityCoreQuota: 10,
      name: 'j1devbatchaccount',
      poolAllocationMode: 'BatchService',
      poolQuota: 20,
      provisioningState: 'Succeeded',
      type: 'Microsoft.Batch/batchAccounts',
    };

    const batchAccountEntity: Entity = createBatchAccountEntity(
      webLinker,
      data,
    );

    expect(batchAccountEntity).toMatchSnapshot();
    expect(batchAccountEntity).toMatchGraphObjectSchema({
      _class: ['Service'],
      schema: {},
    });
  });
});

describe('createBatchPoolEntity', () => {
  test('properties transferred', () => {
    const data: Pool = {
      allocationState: 'Steady',
      allocationStateTransitionTime: new Date('2020-09-26T00:04:02.868Z'),
      autoScaleRun: {
        evaluationTime: new Date('2020-09-26T03:30:46.770Z'),
        results:
          '$TargetDedicatedNodes=0;$TargetLowPriorityNodes=0;$NodeDeallocationOption=requeue;maxNumberofVMs=2;pendingTaskSamplePercent=100;pendingTaskSamples=0;startingNumberOfVMs=1',
      },
      creationTime: new Date('2020-09-25T23:45:46.672Z'),
      currentDedicatedNodes: 0,
      currentLowPriorityNodes: 0,
      deploymentConfiguration: {
        virtualMachineConfiguration: {
          imageReference: {
            offer: 'ubuntu-server-container',
            publisher: 'microsoft-azure-batch',
            sku: '16-04-lts',
            version: 'latest',
          },
          nodeAgentSkuId: 'batch.node.ubuntu 16.04',
        },
      },
      displayName: 'J1 Dev Batch Account Pool',
      etag: 'W/"0x8D861AF3884EB47"',
      id:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount/pools/j1devbatchpool',
      interNodeCommunication: 'Disabled',
      lastModified: new Date('2020-09-26T00:00:46.833Z'),
      maxTasksPerNode: 1,
      name: 'j1devbatchpool',
      provisioningState: 'Succeeded',
      provisioningStateTransitionTime: new Date('2020-09-25T23:45:46.672Z'),
      resizeOperationStatus: {
        nodeDeallocationOption: 'Requeue',
        resizeTimeout: 'PT15M',
        startTime: new Date('2020-09-26T00:00:46.833Z'),
        targetDedicatedNodes: 0,
      },
      scaleSettings: {
        autoScale: {
          evaluationInterval: 'PT15M',
          formula: `       startingNumberOfVMs = 1;
            maxNumberofVMs = 2;
      pendingTaskSamplePercent = $PendingTasks.GetSamplePercent(180 * TimeInterval_Second);
      pendingTaskSamples = pendingTaskSamplePercent < 70 ? startingNumberOfVMs : avg($PendingTasks.GetSample(180 * TimeInterval_Second));
      $TargetDedicatedNodes=min(maxNumberofVMs, pendingTaskSamples);`,
        },
      },
      startTask: {
        commandLine: "echo 'Hello j1dev batch account'",
        maxTaskRetryCount: 1,
        userIdentity: {
          autoUser: {
            elevationLevel: 'NonAdmin',
            scope: 'Task',
          },
        },
        waitForSuccess: true,
      },
      taskSchedulingPolicy: { nodeFillType: 'Spread' },
      vmSize: 'STANDARD_A1',
    };

    const batchAccountPoolEntity: Entity = createBatchPoolEntity(
      webLinker,
      data,
    );

    expect(batchAccountPoolEntity).toMatchSnapshot();
    expect(batchAccountPoolEntity).toMatchGraphObjectSchema({
      _class: ['Cluster'],
      schema: {},
    });
  });
});

describe('createBatchApplicationEntity', () => {
  test('properties transferred', () => {
    const data: Application = {
      allowUpdates: true,
      displayName: '',
      id: 'j1devbatchapplication',
      packages: [],
    };

    const batchApplicationEntity: Entity = createBatchApplicationEntity(
      webLinker,
      data,
    );

    expect(batchApplicationEntity).toMatchSnapshot();
    expect(batchApplicationEntity).toMatchGraphObjectSchema({
      _class: ['Process'],
      schema: {},
    });
  });
});

describe('createBatchCertificateEntity', () => {
  test('properties transferred', () => {
    const data: Certificate = {
      etag: 'W/"0x8D861E3359DF585"',
      format: 'Cer',
      id:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.Batch/batchAccounts/j1devbatchaccount/certificates/sha1-6820fee71b8312b01159d3c09fcb9f7ab24ae60d',
      name: 'sha1-6820fee71b8312b01159d3c09fcb9f7ab24ae60d',
      provisioningState: 'Succeeded',
      provisioningStateTransitionTime: new Date('2020-09-26T06:12:55.791Z'),
      publicData:
        'MIIDljCCAn4CCQDvLsedfPYEHDANBgkqhkiG9w0BAQsFADCBjDELMAkGA1UEBhMCVVMxDTALBgNVBAgMBFV0YWgxFTATBgNVBAcMDFNvdXRoIEpvcmRhbjENMAsGA1UECgwEVGVzdDESMBAGA1UECwwJVGVzdCBVbml0MRYwFAYDVQQDDA1UZXN0aW5nIEJhdGNoMRwwGgYJKoZIhvcNAQkBFg10ZXN0QHRlc3QuY29tMB4XDTIwMDkyNjA1NTI1NVoXDTIxMDkyNjA1NTI1NVowgYwxCzAJBgNVBAYTAlVTMQ0wCwYDVQQIDARVdGFoMRUwEwYDVQQHDAxTb3V0aCBKb3JkYW4xDTALBgNVBAoMBFRlc3QxEjAQBgNVBAsMCVRlc3QgVW5pdDEWMBQGA1UEAwwNVGVzdGluZyBCYXRjaDEcMBoGCSqGSIb3DQEJARYNdGVzdEB0ZXN0LmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALmNVea9Sm4GHv69qm1kSb6vExnkw9N3hBLm9AVc++KLzDgMx/ME4ih3I8Thb6ApbjXIp2G3Wa/AOQIc58fYrJeQQus3ZY2LGuQBmPzDK4/a94VZCRr7kJWUDjtVeIVd+sIrxmK+t6PXjmMfeKn8JUb7nyzPxK7g6BZwYbq4zX7vJ7iPC8bD2hydrCgPftBt6UklJK7KbD9Ex4/3vU94c36AOvq4QZsHXvneaPBObKN1FoyRJgvtK9+1J0TWvFWmYyoIHE/6YLqafIG+zsOuT8GPFexIoTgjQDi5XjhaPOmS4r+3kmOCNBIBzot/i0zSbwXFH7tttH2qgvYM4dIxm7UCAwEAATANBgkqhkiG9w0BAQsFAAOCAQEAsbREEWVz/GBCjEtOe7YoApG45AJCxvs3j7Ox2S2fl2RPzQcOVCDsm5yn9i5IbsJFpNzK33oZOkqNhrfqAMMyDF/YTK9iQZODC8cBWcgY4Ji3lsyCFotbyLSzutRc9P8rLNtHjUd0CHvXbwT1otcDd8aEX76stgTYsEnUT3rDCLwfNuD/jEs5no5ccOAEEn2iE6NLGu8w7bdLiXwE0/DQrK4GP5shol/vIaiOmhpwoedy/C6G5iZp5lo4wkxNp0jKWi4D3IjlWMgqROjOxM5TJVc73pXdifwhlU7l6SwRZN0rl49hcIW6OlOXQZRYJ/CVlBN6krEgfwhnWgeOC1RqFg==',
      thumbprint: '6820fee71b8312b01159d3c09fcb9f7ab24ae60d',
      thumbprintAlgorithm: 'sha1',
      type: 'Microsoft.Batch/batchAccounts/certificates',
    };

    const batchCertificateEntity: Entity = createBatchCertificateEntity(
      webLinker,
      data,
    );

    expect(batchCertificateEntity).toMatchSnapshot();
    expect(batchCertificateEntity).toMatchGraphObjectSchema({
      _class: ['Certificate'],
      schema: {},
    });
  });
});
