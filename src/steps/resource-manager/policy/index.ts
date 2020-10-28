import {
  Entity,
  Step,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { ACCOUNT_ENTITY_TYPE, STEP_AD_ACCOUNT } from '../../active-directory';
import { STEP_RM_SUBSCRIPTIONS } from '../subscriptions';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources';
import {
  PolicyEntities,
  PolicyRelationships,
  STEP_RM_POLICY_ASSIGNMENTS,
} from './constants';
import { AzurePolicyClient } from './client';
import { createPolicyAssignmentEntity } from './converters';

export * from './constants';

export async function fetchPolicyAssignments(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new AzurePolicyClient(instance.config, logger);

  await client.iteratePolicyAssignments(async (policyAssignment) => {
    const policyAssignmentEntity = createPolicyAssignmentEntity(
      webLinker,
      policyAssignment,
    );
    await jobState.addEntity(policyAssignmentEntity);

    const { scope } = policyAssignment;
    if (scope) {
      const scopeEntity = await jobState.findEntity(scope);

      if (scopeEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: scopeEntity,
            to: policyAssignmentEntity,
          }),
        );
      }
    }
  });
}

export const policySteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: STEP_RM_POLICY_ASSIGNMENTS,
    name: 'Policy Assignments',
    entities: [PolicyEntities.POLICY_ASSIGNMENT],
    relationships: [
      PolicyRelationships.RESOURCE_GROUP_HAS_POLICY_ASSIGNMENT,
      PolicyRelationships.SUBSCRIPTION_HAS_POLICY_ASSIGNMENT,
    ],
    dependsOn: [
      STEP_AD_ACCOUNT,
      STEP_RM_SUBSCRIPTIONS,
      STEP_RM_RESOURCES_RESOURCE_GROUPS,
    ],
    executionHandler: fetchPolicyAssignments,
  },
];
