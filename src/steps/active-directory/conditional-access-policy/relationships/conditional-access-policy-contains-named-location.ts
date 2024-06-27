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
import { getConditionalAccessNamedLocationKey } from '../converter';

export async function buildConditionalAccessPolicyContainsNamedLocationsRelationships(
  executionContext: IntegrationStepContext,
) {
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: ConditionalAccessEntities.CONDITIONAL_ACCESS_POLICY._type },
    async (conditionalPolicy) => {
      const locationIds: string[] =
        conditionalPolicy.includeLocations as string[];

      for (const locationId of locationIds || []) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.CONTAINS,
            fromKey: conditionalPolicy._key,
            fromType: ConditionalAccessEntities.CONDITIONAL_ACCESS_POLICY._type,
            toKey: getConditionalAccessNamedLocationKey(locationId),
            toType:
              ConditionalAccessEntities.CONDITIONAL_ACCESS_NAMED_LOCATION._type,
          }),
        );
      }
    },
  );
}

export const conditionalAccessPolicyContainsNamedLocationStep: AzureIntegrationStep =
  {
    id: ConditionalAccessSteps.CONDITIONAL_ACCESS_POLICY_CONTAINS_NAMED_LOCATION,
    name: 'Conditional Access Policy Contains Named Location Relationships',
    entities: [],
    relationships: [
      ConditionalAccessRelationships.CONDITIONAL_ACCESS_POLICY_CONTAINS_NAMED_LOCATION,
    ],
    dependsOn: [
      ConditionalAccessSteps.CONDITIONAL_ACCESS_NAMED_LOCATION,
      ConditionalAccessSteps.CONDITIONAL_ACCESS_POLICY,
    ],
    executionHandler:
      buildConditionalAccessPolicyContainsNamedLocationsRelationships,
  };
