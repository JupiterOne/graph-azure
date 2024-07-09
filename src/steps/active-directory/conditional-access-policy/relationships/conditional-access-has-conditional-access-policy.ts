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

export async function buildConditionalAccessHasConditionalAccessPolicyRelationships(
  executionContext: IntegrationStepContext,
) {
  const { jobState, instance } = executionContext;

  const conditionalAccessServiceEntityKey = getConditionalAccessServiceKey(
    instance.id,
  );

  await jobState.iterateEntities(
    { _type: ConditionalAccessEntities.CONDITIONAL_ACCESS_POLICY._type },
    async (conditionalPolicy) => {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: conditionalAccessServiceEntityKey,
          fromType: ConditionalAccessEntities.CONDITIONAL_ACCESS._type,
          toKey: conditionalPolicy._key,
          toType: ConditionalAccessEntities.CONDITIONAL_ACCESS_POLICY._type,
        }),
      );
    },
  );
}

export const conditionalAccessHasConditionalAccessPoliciesStep: AzureIntegrationStep =
  {
    id: ConditionalAccessSteps.CONDITIONAL_ACCESS_HAS_CONDITIONAL_ACCESS_POLICY,
    name: 'Conditional Access Has Conditional Access Policy Relationships',
    entities: [],
    relationships: [
      ConditionalAccessRelationships.CONDITIONAL_ACCESS_HAS_CONDITIONAL_ACCESS_POLICY,
    ],
    dependsOn: [
      ConditionalAccessSteps.CONDITIONAL_ACCESS,
      ConditionalAccessSteps.CONDITIONAL_ACCESS_POLICY,
    ],
    executionHandler:
      buildConditionalAccessHasConditionalAccessPolicyRelationships,
  };
