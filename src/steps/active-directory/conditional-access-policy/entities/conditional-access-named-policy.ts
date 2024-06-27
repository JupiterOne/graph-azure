import {
  AzureIntegrationStep,
  IntegrationStepContext,
} from '../../../../types';
import { ConditionalAccessPolicy } from '../client';
import {
  ConditionalAccessEntities,
  ConditionalAccessSteps,
} from '../constants';
import { createConditionalAccessNamedLocationEntity } from '../converter';

export async function fetchConditionalAcessNamedLocation(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, instance, jobState } = executionContext;
  const graphClient = new ConditionalAccessPolicy(logger, instance.config);

  await graphClient.iterateConditionalAccessNamedLocation(
    async (namedLocation) => {
      await jobState.addEntity(
        createConditionalAccessNamedLocationEntity(namedLocation),
      );
    },
  );
}

export const conditionalAccessNamedLocatoinStep: AzureIntegrationStep = {
  id: ConditionalAccessSteps.CONDITIONAL_ACCESS_NAMED_LOCATION,
  name: 'Conditional Access Named Location',
  entities: [ConditionalAccessEntities.CONDITIONAL_ACCESS_NAMED_LOCATION],
  relationships: [],
  dependsOn: [],
  apiPermissions: ['Policy.Read.All'],
  executionHandler: fetchConditionalAcessNamedLocation,
};
