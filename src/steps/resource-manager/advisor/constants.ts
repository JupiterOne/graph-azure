import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { SecurityEntities } from '../security/constants';
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
  ASSESSMENT_IDENTIFIED_FINDING: {
    _type: 'azure_assessment_identified_recommendation',
    sourceType: SecurityEntities.ASSESSMENT._type,
    _class: RelationshipClass.IDENTIFIED,
    targetType: AdvisorEntities.RECOMMENDATION._type,
  },
  ANY_RESOURCE_HAS_FINDING: {
    _type: 'azure_resource_has_finding',
    sourceType: ANY_SCOPE,
    _class: RelationshipClass.HAS,
    targetType: AdvisorEntities.RECOMMENDATION._type,
  },
};
