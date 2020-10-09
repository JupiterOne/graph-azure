import {
  Entity,
  createIntegrationEntity,
  convertProperties,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import { AdvisorEntities } from './constants';
import { ResourceRecommendationBase } from '@azure/arm-advisor/esm/models';

function maybeConvertToNumber(maybeNumber: string | undefined) {
  if (!isNaN(parseFloat(maybeNumber || 'NaN'))) return parseFloat(maybeNumber!);
}

export function createRecommendationEntity(
  webLinker: AzureWebLinker,
  data: ResourceRecommendationBase,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: data.id as string,
        _type: AdvisorEntities.RECOMMENDATION._type,
        _class: AdvisorEntities.RECOMMENDATION._class,
        id: data.id,
        name: data.name,
        category: data.category,
        impact: data.impact,
        impactedField: data.impactedField,
        impactedValue: data.impactedValue,
        recommendationTypeId: data.recommendationTypeId,
        shortDescriptionProblem: data.shortDescription?.problem,
        shortDescriptionSolution: data.shortDescription?.solution,
        assessmentKey: data.extendedProperties?.assessmentKey,
        score: maybeConvertToNumber(data.extendedProperties?.score),
        resourceId: data.resourceMetadata?.resourceId,
        source: data.resourceMetadata?.source,
        open: true,
        severity: data.impact,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}
