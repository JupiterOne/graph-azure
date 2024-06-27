import {
  AzureIntegrationStep,
  IntegrationStepContext,
} from '../../../../types';
import { ConditionalAccessPolicy } from '../client';
import {
  ConditionalAccessEntities,
  ConditionalAccessSteps,
} from '../constants';
import { createPolicyEntity } from '../converter';

export async function fetchConditionalAccessPolicy(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, instance, jobState } = executionContext;
  const graphClient = new ConditionalAccessPolicy(logger, instance.config);

  await graphClient.iterateConditionalAccess(async (conditionalPolicy) => {
    await jobState.addEntity(createPolicyEntity(conditionalPolicy));
  });
}

export const conditionalAccessPolicyStep: AzureIntegrationStep = {
  id: ConditionalAccessSteps.CONDITIONAL_ACCESS_POLICY,
  name: 'Conditional Access Policy',
  entities: [ConditionalAccessEntities.CONDITIONAL_ACCESS_POLICY],
  relationships: [],
  dependsOn: [],
  apiPermissions: ['Policy.Read.All'],
  executionHandler: fetchConditionalAccessPolicy,
};
