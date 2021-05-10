import {
  Step,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';
import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { getAccountEntity, STEP_AD_ACCOUNT } from '../../active-directory';
import { PolicyInsightEntities, PolicyInsightSteps } from './constants';
import { AzurePolicyInsightsClient } from './client';
import { createPolicyStateEntity } from './converters';

export async function fetchLatestPolicyStatesForSubscription(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new AzurePolicyInsightsClient(instance.config, logger);

  await client.iterateLatestPolicyStatesForSubscription(async (policyState) => {
    await jobState.addEntity(createPolicyStateEntity(webLinker, policyState));
  });
}

export const policyInsightSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: PolicyInsightSteps.SUBSCRIPTION_POLICY_STATES,
    name: 'Policy States',
    entities: [PolicyInsightEntities.POLICY_STATE],
    relationships: [],
    dependsOn: [STEP_AD_ACCOUNT],
    executionHandler: fetchLatestPolicyStatesForSubscription,
  },
];
