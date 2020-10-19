import { fetchSubscriptions } from '.';
import { Recording } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import { setupAzureRecording } from '../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';
let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

test('step - subscriptions', async () => {
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

  const context = createMockAzureStepExecutionContext({
    instanceConfig,
    setData: {
      [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
    },
  });

  await fetchSubscriptions(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: 'Account',
    schema: {
      additionalProperties: false,
      properties: {
        _type: { const: 'azure_subscription' },
        _key: { type: 'string' },
        _class: { type: 'array', items: { const: 'Group' } },
        id: { type: 'string' },
        name: { type: 'string' },
        displayName: { type: 'string' },
        subscriptionId: { type: 'string' },
        state: { type: 'string' },
        authorizationSource: { type: 'string' },
        webLink: { type: 'string' },
        _rawData: { type: 'array', items: { type: 'object' } },
      },
    },
  });
  expect(context.jobState.collectedRelationships.length).toBe(0);
});
