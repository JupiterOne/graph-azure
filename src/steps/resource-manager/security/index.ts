import {
  Entity,
  Step,
  IntegrationStepExecutionContext,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { ACCOUNT_ENTITY_TYPE, STEP_AD_ACCOUNT } from '../../active-directory';
import { SecurityClient } from './client';
import {
  SecurityEntities,
  SecurityRelationships,
  SecuritySteps,
} from './constants';
import { createAssessmentEntity } from './converters';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources';
import { SUBSCRIPTION_ENTITY_METADATA } from '../subscriptions';
export * from './constants';

export async function fetchAssessments(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new SecurityClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: SUBSCRIPTION_ENTITY_METADATA._type },
    async (subscriptionEntity) => {
      await client.iterateAssessments(
        subscriptionEntity._key,
        async (assessment) => {
          const assessmentEntity = await jobState.addEntity(
            createAssessmentEntity(webLinker, assessment),
          );

          await jobState.addRelationship(
            createDirectRelationship({
              _class:
                SecurityRelationships.SUBSCRIPTION_PERFORMED_ASSESSMENT._class,
              from: subscriptionEntity,
              to: assessmentEntity,
              properties: {
                _type:
                  SecurityRelationships.SUBSCRIPTION_PERFORMED_ASSESSMENT._type,
              },
            }),
          );
        },
      );
    },
  );
}

export const securitySteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: SecuritySteps.ASSESSMENTS,
    name: 'Security Assessments',
    entities: [SecurityEntities.ASSESSMENT],
    relationships: [SecurityRelationships.SUBSCRIPTION_PERFORMED_ASSESSMENT],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchAssessments,
  },
];
