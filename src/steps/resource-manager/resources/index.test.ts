import { fetchResourceGroups } from '.';
import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import { setupAzureRecording } from '../../../../test/helpers/recording';
let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

test('step - resource groups', async () => {
  const instanceConfig: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
    subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
  };

  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-resource-groups',
  });

  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig,
  });

  context.jobState.getData = jest.fn().mockResolvedValue({
    defaultDomain: 'www.fake-domain.com',
  });

  await fetchResourceGroups(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: 'Group',
    schema: {
      additionalProperties: false,
      properties: {
        _type: { const: 'azure_resource_group' },
        _key: { type: 'string' },
        _class: { type: 'array', items: { const: 'Group' } },
        id: { type: 'string' },
        name: { type: 'string' },
        displayName: { type: 'string' },
        type: { const: 'Microsoft.Resources/resourceGroups' },
        location: { type: 'string' },
        managedBy: { type: 'string' },
        provisioningState: { type: 'string' },
        webLink: { type: 'string' },
        _rawData: { type: 'array', items: { type: 'object' } },
      },
    },
  });
  expect(context.jobState.collectedRelationships.length).toBe(0);
});
