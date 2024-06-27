import {
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  AzureIntegrationStep,
  IntegrationStepContext,
} from '../../../../types';
import {
  ConditionalAccessEntities,
  ConditionalAccessRelationships,
  ConditionalAccessSteps,
} from '../constants';
import { getConditionalAccessServiceKey } from '../converter';

export async function buildConditionalAccessHasConditionalAccessTemplateRelationships(
  executionContext: IntegrationStepContext,
) {
  const { jobState, instance } = executionContext;

  const conditionalAccessServiceEntityKey = getConditionalAccessServiceKey(
    instance.id,
  );

  await jobState.iterateEntities(
    { _type: ConditionalAccessEntities.CONDITIONAL_ACCESS_TEMPLATE._type },
    async (conditionalTemplate) => {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: conditionalAccessServiceEntityKey,
          fromType: ConditionalAccessEntities.CONDITIONAL_ACCESS._type,
          toKey: conditionalTemplate._key,
          toType: ConditionalAccessEntities.CONDITIONAL_ACCESS_TEMPLATE._type,
        }),
      );
    },
  );
}

export const conditionalAccessHasConditionalAccessTemplateStep: AzureIntegrationStep =
  {
    id: ConditionalAccessSteps.CONDITIONAL_ACCESS_HAS_CONDITIONAL_ACCESS_TEMPLATE,
    name: 'Conditional Access Has Conditional Access Template Relationships',
    entities: [],
    relationships: [
      ConditionalAccessRelationships.CONDITIONAL_ACCESS_HAS_CONDITIONAL_ACCESS_TEMPLATE,
    ],
    dependsOn: [
      ConditionalAccessSteps.CONDITIONAL_ACCESS,
      ConditionalAccessSteps.CONDITIONAL_ACCESS_TEMPLATE,
    ],
    executionHandler:
      buildConditionalAccessHasConditionalAccessTemplateRelationships,
  };
