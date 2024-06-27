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
import { GROUP_ENTITY_TYPE, STEP_AD_GROUPS } from '../../constants';

export async function buildConditionalAccessPolicyAssignedGroupsRelationships(
  executionContext: IntegrationStepContext,
) {
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: ConditionalAccessEntities.CONDITIONAL_ACCESS_POLICY._type },
    async (conditionalPolicy) => {
      const groupIds = conditionalPolicy.includeGroups as string[];

      for (const groupId of groupIds || []) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.ASSIGNED,
            fromKey: conditionalPolicy._key,
            fromType: ConditionalAccessEntities.CONDITIONAL_ACCESS_POLICY._type,
            toKey: groupId,
            toType: GROUP_ENTITY_TYPE,
          }),
        );
      }
    },
  );
}

export const conditionalAccessPolicyAssignedADGroupsStep: AzureIntegrationStep =
  {
    id: ConditionalAccessSteps.CONDITIONAL_ACCESS_POLICY_ASSIGNED_AD_GROUPS,
    name: 'Conditional Access Policy Assigned AD Groups Relationships',
    entities: [],
    relationships: [
      ConditionalAccessRelationships.CONDITIONAL_ACCESS_POLICY_ASSIGNED_AD_GROUPS,
    ],
    dependsOn: [
      STEP_AD_GROUPS,
      ConditionalAccessSteps.CONDITIONAL_ACCESS_POLICY,
    ],
    executionHandler: buildConditionalAccessPolicyAssignedGroupsRelationships,
  };
