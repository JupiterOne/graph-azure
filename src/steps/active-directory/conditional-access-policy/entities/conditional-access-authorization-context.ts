import {
  AzureIntegrationStep,
  IntegrationStepContext,
} from '../../../../types';
import { ConditionalAccessPolicy } from '../client';
import {
  ConditionalAccessEntities,
  ConditionalAccessSteps,
} from '../constants';
import { createConditionalAccessAuthContextEntity } from '../converter';

export async function fetchConditionalAccessAuthorizationContext(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, instance, jobState } = executionContext;
  const graphClient = new ConditionalAccessPolicy(logger, instance.config);

  await graphClient.iterateConditionalAccessAuthorizationContext(
    async (authContext) => {
      await jobState.addEntity(
        createConditionalAccessAuthContextEntity(authContext),
      );
    },
  );
}

export const conditionalAccessAuthorizationContextStep: AzureIntegrationStep = {
  id: ConditionalAccessSteps.CONDITIONAL_ACCESS_AUTH_CONTEXT,
  name: 'Conditional Access Authorization context',
  entities: [ConditionalAccessEntities.CONDITIONAL_ACCESS_AUTH_CONTEXT],
  relationships: [],
  dependsOn: [],
  apiPermissions: ['Policy.Read.ConditionalAccess	'],
  executionHandler: fetchConditionalAccessAuthorizationContext,
};
