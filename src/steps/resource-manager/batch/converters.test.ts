import { BatchAccount, Pool, Application } from '@azure/arm-batch/esm/models';
import { Entity } from '@jupiterone/integration-sdk-core';
import { createAzureWebLinker } from '../../../azure';
import {
  createBatchAccountEntity,
  createBatchPoolEntity,
  createBatchApplicationEntity,
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
