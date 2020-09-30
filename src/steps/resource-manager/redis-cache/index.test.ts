import { fetchRedisCaches } from '.';
import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import { setupAzureRecording } from '../../../../test/helpers/recording';

const instanceConfig: IntegrationConfig = {
  clientId: process.env.CLIENT_ID || 'clientId',
  clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
  directoryId: 'bcd90474-9b62-4040-9d7b-8af257b1427d',
  subscriptionId: '40474ebe-55a2-4071-8fa8-b610acdd8e56',
};

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

test('step = redis caches', async () => {
  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-redis-caches',
  });

  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig,
    entities: [
      {
        _key:
          '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev',
        _type: 'azure_resource_group',
        _class: ['Group'],
        name: 'j1dev',
        id:
          '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev',
      },
    ],
  });

  context.jobState.getData = jest.fn().mockResolvedValue({
    defaultDomain: 'www.fake-domain.com',
  });

  await fetchRedisCaches(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: ['Database', 'DataStore', 'Cluster'],
    schema: {},
  });

  expect(context.jobState.collectedRelationships).toEqual([
    {
      _key:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev|has|/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.Cache/Redis/keionned-j1dev-redis-cache',
      _type: 'azure_resource_group_has_redis_cache',
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev',
      _toEntityKey:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.Cache/Redis/keionned-j1dev-redis-cache',
      displayName: 'HAS',
    },
  ]);
});
