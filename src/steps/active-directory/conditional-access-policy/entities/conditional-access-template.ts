import { INGESTION_SOURCE_IDS } from '../../../../constants';
import {
  AzureIntegrationStep,
  IntegrationStepContext,
} from '../../../../types';
import { ConditionalAccessPolicy } from '../client';
import {
  ConditionalAccessEntities,
  ConditionalAccessSteps,
} from '../constants';
import { createConditionalAccessTemplateEntity } from '../converter';

export async function fetchConditionalAccessTemplate(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, instance, jobState } = executionContext;
  const graphClient = new ConditionalAccessPolicy(logger, instance.config);

  await graphClient.iterateConditionalAccessTemplate(async (template) => {
    await jobState.addEntity(createConditionalAccessTemplateEntity(template));
  });
}

export const conditionalAccessTemplateStep: AzureIntegrationStep = {
  id: ConditionalAccessSteps.CONDITIONAL_ACCESS_TEMPLATE,
  name: 'Conditional Access Template',
  entities: [ConditionalAccessEntities.CONDITIONAL_ACCESS_TEMPLATE],
  relationships: [],
  dependsOn: [],
  apiPermissions: ['Policy.Read.All'],
  executionHandler: fetchConditionalAccessTemplate,
  ingestionSourceId: INGESTION_SOURCE_IDS.CONDITIONAL_ACCESS,
};
