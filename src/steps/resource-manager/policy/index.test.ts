import { Recording } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import { setupAzureRecording } from '../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';
import { fetchPolicyAssignments } from '.';
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

test('step = policy assignments', async () => {
  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-redis-caches',
  });

  const context = createMockAzureStepExecutionContext({
    instanceConfig,
    entities: [
      {
        _key: `/subscriptions/${instanceConfig.subscriptionId}`,
        _class: ['Group'],
        _type: 'azure_subscription',
        id: `/subscriptions/${instanceConfig.subscriptionId}`,
      },
      {
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev-policy-resource-group`,
        _type: 'azure_resource_group',
        _class: ['Group'],
        name: 'j1dev-policy-resource-group',
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev-policy-resource-group`,
      },
    ],
    setData: {
      [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
    },
  });

  await fetchPolicyAssignments(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: ['ControlPolicy'],
  });

  expect(context.jobState.collectedRelationships).toContainEqual(
    expect.objectContaining({
      _key: `/subscriptions/${instanceConfig.subscriptionId}|has|/subscriptions/${instanceConfig.subscriptionId}/providers/Microsoft.Authorization/policyAssignments/SecurityCenterBuiltIn`,
      _type: 'azure_resource_has_policy_assignment',
      _class: 'HAS',
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/providers/Microsoft.Authorization/policyAssignments/SecurityCenterBuiltIn`,
      displayName: 'HAS',
    }),
  );

  expect(context.jobState.collectedRelationships).toContainEqual(
    expect.objectContaining({
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev-policy-resource-group|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev-policy-resource-group/providers/Microsoft.Authorization/policyAssignments/j1dev-policy-assignment`,
      _type: 'azure_resource_has_policy_assignment',
      _class: 'HAS',
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev-policy-resource-group`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev-policy-resource-group/providers/Microsoft.Authorization/policyAssignments/j1dev-policy-assignment`,
      displayName: 'HAS',
    }),
  );
});
