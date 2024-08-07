import { SchemaType } from '@jupiterone/integration-sdk-core';
import { createEntityType, createEntityMetadata } from '../../../helpers';

// Advisor Entities
export const [RecommendationEntityMetadata, createRecommendationAssignEntity] =
  createEntityMetadata({
    resourceName: '[RM] Advisor Recommendation ',
    _class: ['Finding'],
    _type: createEntityType('advisor_recommendation'),
    description: 'Azure Advisor Recommendation',
    schema: SchemaType.Object({
      category: SchemaType.String([
        SchemaType.Literal('HighAvailability'),
        SchemaType.Literal('Security'),
        SchemaType.Literal('Performance'),
        SchemaType.Literal('Cost'),
        SchemaType.Literal('OperationalExcellence'),
      ]),
      severity: SchemaType.String([
        SchemaType.Literal('High'),
        SchemaType.Literal('Medium'),
        SchemaType.Literal('Low'),
      ]),
      id: SchemaType.Optional(SchemaType.String()),
      shortDescriptionProblem: SchemaType.Optional(SchemaType.String()),
      shortDescriptionSolution: SchemaType.Optional(SchemaType.String()),
      resourceId: SchemaType.Optional(SchemaType.String()),
      source: SchemaType.Optional(SchemaType.String()),
    }),
  });
