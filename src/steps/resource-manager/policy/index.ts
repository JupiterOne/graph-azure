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
import { PolicyEntities, PolicyRelationships, PolicySteps } from './constants';
import { AzurePolicyClient } from './client';
import { createPolicyAssignmentEntity } from './converters';
import { getResourceManagerSteps } from '../../../getStepStartStates';

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
            /**
             * NOTE: Azure Management Groups, Azure Subscriptions, Azure Resource Groups, and Azure Resources can all have Azure Policy Assignments.
             * We currently don't ingest Management Groups, but we do ingest Subscriptions, Resource Groups, and some Resources
             * We've chosen to represent the relationship as ANY_SCOPE has a Policy Assignment.
             * This is because we want the relationship metadata to line up with the actual ingested relationships.
             * If we say that we expect ANY_SCOPE_had_policy_assignment and instead generate that a azure_storage_account_has_policy_assignment,
             * it might cause issues down the road.
             */
            properties: {
              _type: 'ANY_SCOPE_has_policy_assignment',
            },
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
    id: PolicySteps.POLICY_ASSIGNMENTS,
    name: 'Policy Assignments',
    entities: [PolicyEntities.POLICY_ASSIGNMENT],
    relationships: [PolicyRelationships.ANY_RESOURCE_POLICY_ASSIGNMENT],
    dependsOn: [
      STEP_AD_ACCOUNT,
      ...getResourceManagerSteps().executeFirstSteps,
    ],
    executionHandler: fetchPolicyAssignments,
  },
];
