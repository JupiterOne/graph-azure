import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { ANY_SCOPE } from '../constants';

export const AdvisorSteps = {
  RECOMMENDATIONS: 'rm-advisor-recommendations',
};

export const AdvisorEntities = {
  RECOMMENDATION: {
    _type: 'azure_advisor_recommendation',
    _class: ['Finding'],
    resourceName: '[RM] Advisor Recommendation',
  },
};

export const AdvisorRelationships = {
  ANY_RESOURCE_HAS_FINDING: {
    _type: 'ANY_SCOPE_has_finding',
    sourceType: ANY_SCOPE,
    _class: RelationshipClass.HAS,
    targetType: AdvisorEntities.RECOMMENDATION._type,
  },
};
