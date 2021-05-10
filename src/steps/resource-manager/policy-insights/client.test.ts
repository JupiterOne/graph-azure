import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';
import {
  getMatchRequestsBy,
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { AzurePolicyInsightsClient } from './client';
import { configFromEnv } from '../../../../test/integrationInstanceConfig';
import { PolicyState } from '@azure/arm-policyinsights/esm/models';

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

describe('iterateLatestPolicyStatesForSubscription', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateLatestPolicyStatesForSubscription',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const client = new AzurePolicyInsightsClient(
      configFromEnv,
      createMockIntegrationLogger(),
    );

    const resources: PolicyState[] = [];
    await client.iterateLatestPolicyStatesForSubscription((p) => {
      resources.push(p);
    });

    expect(resources.length).toBeGreaterThan(0);
    resources.forEach((r) => {
      expect(r).toMatchObject({
        policyDefinitionReferenceId: expect.any(String),
        isCompliant: expect.any(Boolean),
        complianceState: expect.stringMatching(/(^NonCompliant$|^Compliant$)/),
      });
    });
  });
});
