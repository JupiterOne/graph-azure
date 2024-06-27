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

export async function buildConditionalAccessHasConditionalAccessAuthContextRelationships(
  executionContext: IntegrationStepContext,
) {
  const { jobState, instance } = executionContext;

  const conditionalAccessServiceEntityKey = getConditionalAccessServiceKey(
    instance.id,
  );

  await jobState.iterateEntities(
    { _type: ConditionalAccessEntities.CONDITIONAL_ACCESS_AUTH_CONTEXT._type },
    async (authContext) => {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: conditionalAccessServiceEntityKey,
          fromType: ConditionalAccessEntities.CONDITIONAL_ACCESS._type,
          toKey: authContext._key,
          toType:
            ConditionalAccessEntities.CONDITIONAL_ACCESS_AUTH_CONTEXT._type,
        }),
      );
    },
  );
}

export const conditionalAccessHasConditionalAccessAuthContextsStep: AzureIntegrationStep =
  {
    id: ConditionalAccessSteps.CONDITIONAL_ACCESS_HAS_CONDITIONAL_ACCESS_AUTH_CONTEXT,
    name: 'Conditional Access Has Conditional Access Auth Context Relationships',
    entities: [],
    relationships: [
      ConditionalAccessRelationships.CONDITIONAL_ACCESS_HAS_CONDITIONAL_ACCESS_AUTH_CONTEXT,
    ],
    dependsOn: [
      ConditionalAccessSteps.CONDITIONAL_ACCESS,
      ConditionalAccessSteps.CONDITIONAL_ACCESS_AUTH_CONTEXT,
    ],
    executionHandler:
      buildConditionalAccessHasConditionalAccessAuthContextRelationships,
  };
