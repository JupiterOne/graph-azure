import {
  AzureIntegrationStep,
  IntegrationStepContext,
} from '../../../../types';
import {
  ConditionalAccessEntities,
  ConditionalAccessSteps,
} from '../constants';
import { createConditionalAccessServiceEntity } from '../converter';

export async function fetchConditionalAccess(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, jobState } = executionContext;

  await jobState.addEntity(createConditionalAccessServiceEntity(instance.id));
}

export const conditionalAccessStep: AzureIntegrationStep = {
  id: ConditionalAccessSteps.CONDITIONAL_ACCESS,
  name: 'Conditional Access',
  entities: [ConditionalAccessEntities.CONDITIONAL_ACCESS],
  relationships: [],
  dependsOn: [],
  apiPermissions: [],
  executionHandler: fetchConditionalAccess,
};
