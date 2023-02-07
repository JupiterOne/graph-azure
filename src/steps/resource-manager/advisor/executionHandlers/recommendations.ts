import {
  createDirectRelationship,
  getRawData,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../../azure';
import {
  IntegrationStepContext,
  AzureIntegrationStep,
} from '../../../../types';
import { getAccountEntity } from '../../../active-directory';
import { STEP_AD_ACCOUNT } from '../../../active-directory/constants';
import { AdvisorClient } from '../client';
import {
  AdvisorEntities,
  AdvisorRelationships,
  AdvisorSteps,
} from '../constants';
import { createRecommendationEntity } from '../converters';
import { SecuritySteps } from '../../security/constants';
import { getResourceManagerSteps } from '../../../../getStepStartStates';
import { ResourceRecommendationBase } from '@azure/arm-advisor/esm/models';

export async function fetchRecommendations(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new AdvisorClient(instance.config, logger);

  await client.iterateRecommendations(async (recommendation) => {
    await jobState.addEntity(
      createRecommendationEntity(webLinker, recommendation),
    );
  });
}

export async function buildAssesmentToRecommendationRelationship(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: AdvisorEntities.RECOMMENDATION._type },
    async (recommendationEntity) => {
      const recommendation = getRawData<ResourceRecommendationBase>(
        recommendationEntity,
      )!;
      if (recommendation.resourceMetadata?.source) {
        const assessmentEntity = await jobState.findEntity(
          recommendation.resourceMetadata.source,
        );
        if (assessmentEntity) {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: AdvisorRelationships.ASSESSMENT_IDENTIFIED_FINDING._class,
              from: assessmentEntity,
              to: recommendationEntity,
              properties: {
                _type: AdvisorRelationships.ASSESSMENT_IDENTIFIED_FINDING._type,
              },
            }),
          );
        }
      }
    },
  );
}

export async function buildResourceToRecommendationRelationship(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: AdvisorEntities.RECOMMENDATION._type },
    async (recommendationEntity) => {
      const recommendation = getRawData<ResourceRecommendationBase>(
        recommendationEntity,
      )!;
      if (recommendation.resourceMetadata?.resourceId) {
        const resourceEntity = await jobState.findEntity(
          recommendation.resourceMetadata.resourceId,
        );
        if (resourceEntity) {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: AdvisorRelationships.ANY_RESOURCE_HAS_FINDING._class,
              from: resourceEntity,
              to: recommendationEntity,
              properties: {
                _type: AdvisorRelationships.ANY_RESOURCE_HAS_FINDING._type,
              },
            }),
          );
        }
      }
    },
  );
}

export const recommendationSteps: AzureIntegrationStep[] = [
  {
    id: AdvisorSteps.RECOMMENDATIONS,
    name: 'Recommendations',
    entities: [AdvisorEntities.RECOMMENDATION],
    relationships: [],
    dependsOn: [
      STEP_AD_ACCOUNT,
      SecuritySteps.ASSESSMENTS,
      ...getResourceManagerSteps().executeFirstSteps,
    ],
    executionHandler: fetchRecommendations,
    rolePermissions: ['Microsoft.Advisor/recommendations/read'],
  },
  {
    id: AdvisorSteps.ASSESSMENT_RECOMMENDATION_RELATIONSHIP,
    name: 'Assessment to recommendation relationship',
    entities: [],
    relationships: [AdvisorRelationships.ASSESSMENT_IDENTIFIED_FINDING],
    dependsOn: [AdvisorSteps.RECOMMENDATIONS],
    executionHandler: buildAssesmentToRecommendationRelationship,
  },
  {
    id: AdvisorSteps.RESOURCE_RECOMMENDATION_RELATIONSHIP,
    name: 'Resource to recommendation relationship',
    entities: [],
    relationships: [AdvisorRelationships.ANY_RESOURCE_HAS_FINDING],
    dependsOn: [AdvisorSteps.RECOMMENDATIONS],
    executionHandler: buildResourceToRecommendationRelationship,
    //dependencyGraphId: 'last'
  },
];
