import { BatchAccount } from '@azure/arm-batch/esm/models';
import { Entity } from '@jupiterone/integration-sdk-core';
import { createAzureWebLinker } from '../../../azure';
import { createBatchAccountEntity } from './converters';

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
