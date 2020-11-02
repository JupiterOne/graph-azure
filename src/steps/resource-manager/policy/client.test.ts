import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';
import {
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { IntegrationConfig } from '../../../types';
import { AzurePolicyClient } from './client';
import { PolicyAssignment } from '@azure/arm-policy/esm/models';

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

describe('iteratePolicyAssignments', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iteratePolicyAssignments',
    });

    const client = new AzurePolicyClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const resources: PolicyAssignment[] = [];

    await client.iteratePolicyAssignments((e) => {
      resources.push(e);
    });

    /**
     * NOTE: The parameters object may return empty, instead of having the 'systemUpdatesMonitoringEffect' key in it.
     * This will depend on whether or not you have manually changed the value in your Azure Subscription.
     * It looks like the built in Security Center Policy Assignment parameters are ONLY returned if they have been updated.
     * If none of the default SecurityCenterBuiltIn parameters are altered, the parameters object will come back as empty.
     * THIS TEST WILL ONLY PASS IF THE ORIGINAL RECORDING IS NOT DELETED OR THE DEV RUNNING THE TEST HAS ALTERED THE SAME PARAMETERS
     * TODO : Although this scenario isn't likely, we can prevent this issue in the future by using terraform to edit all the default SecurityCenterBuiltIn properties we care about
     * If you need to edit the default SecurityCenterBuiltIn parameters:
     * Security Center -> Security Policy -> <Your Subscription> -> Security center default policy -> View effective policy -> ASC Default (subscription: <Your Subscription Id>)
     */
    expect(resources).toContainEqual(
      expect.objectContaining({
        sku: {
          name: expect.any(String),
          tier: expect.any(String),
        },
        displayName: `ASC Default (subscription: ${config.subscriptionId})`,
        policyDefinitionId:
          '/providers/Microsoft.Authorization/policySetDefinitions/1f3afdf9-d0c9-4c3d-847f-89da613e70a8',
        scope: `/subscriptions/${config.subscriptionId}`,
        notScopes: [],
        parameters: {
          systemUpdatesMonitoringEffect: {
            value: 'AuditIfNotExists',
          },
        },
        description:
          'This is the default set of policies monitored by Azure Security Center. It was automatically assigned as part of onboarding to Security Center. The default assignment contains only audit policies. For more information please visit https://aka.ms/ascpolicies',
        metadata: {
          assignedBy: 'Security Center',
          createdBy: '488baaae-0786-48e5-aa3d-6c7c773d9557',
          createdOn: '2020-09-24T16:32:06.2258988Z',
          updatedBy: '3b3dbbda-9a3c-4b0b-b2f4-60cfeaa74233',
          updatedOn: '2020-10-29T17:42:36.1625526Z',
          parameterScopes: {},
        },
        enforcementMode: 'Default',
        id: `/subscriptions/${config.subscriptionId}/providers/Microsoft.Authorization/policyAssignments/SecurityCenterBuiltIn`,
        type: 'Microsoft.Authorization/policyAssignments',
        name: 'SecurityCenterBuiltIn',
      }),
    );

    expect(resources).toContainEqual(
      expect.objectContaining({
        sku: {
          name: expect.any(String),
          tier: expect.any(String),
        },
        displayName: 'My Example Policy Assignment',
        policyDefinitionId: `/subscriptions/${config.subscriptionId}/providers/Microsoft.Authorization/policyDefinitions/j1dev-policy-definition`,
        scope: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev-policy-resource-group`,
        parameters: {
          allowedLocations: {
            value: ['East US', 'West US'],
          },
        },
        description: 'j1dev Policy Assignment created via Test',
        metadata: {
          category: 'General',
          createdBy: '3d866b00-3c67-46d5-b7ba-0df4f781b471',
          createdOn: '2020-10-29T16:35:03.5371306Z',
          updatedBy: null,
          updatedOn: null,
        },
        enforcementMode: 'Default',
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/j1dev-policy-resource-group/providers/Microsoft.Authorization/policyAssignments/j1dev-policy-assignment`,
        type: 'Microsoft.Authorization/policyAssignments',
        name: 'j1dev-policy-assignment',
      }),
    );
  });
});
