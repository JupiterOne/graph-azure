import {
  Step,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { getAccountEntity, STEP_AD_ACCOUNT } from '../../active-directory';
import { PolicyEntities, PolicyRelationships, PolicySteps } from './constants';
import { AzurePolicyClient } from './client';
import { createPolicyAssignmentEntity } from './converters';
import { getResourceManagerSteps } from '../../../getStepStartStates';

export * from './constants';

export async function fetchPolicyAssignments(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new AzurePolicyClient(instance.config, logger);

  await client.iteratePolicyAssignments(async (policyAssignment) => {
    const policyAssignmentEntity = await jobState.addEntity(
      createPolicyAssignmentEntity(webLinker, policyAssignment),
    );

    const { scope } = policyAssignment;
    if (!scope) return;

    const scopeEntity = await jobState.findEntity(scope);
    if (!scopeEntity) return;

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
          _type: PolicyRelationships.ANY_RESOURCE_HAS_POLICY_ASSIGNMENT._type,
        },
      }),
    );

    /**
     * TODO: We want to add a relationship between the creator of the Policy Assignment and the Policy Assignment.
     * The Policy Assignment is createdBy some actor (application or user).
     * Because the id is just a guid and not in long form (i.e. /subscriptions/{subscriptionId}/providers/{providerName}/...),
     * we don't know yet who or what created the Policy Assignment.
     * If/when we can find out, we want to add that relationship here.
     */
  });
}

export const policySteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: PolicySteps.POLICY_ASSIGNMENTS,
    name: 'Policy Assignments',
    entities: [PolicyEntities.POLICY_ASSIGNMENT],
    relationships: [PolicyRelationships.ANY_RESOURCE_HAS_POLICY_ASSIGNMENT],
    dependsOn: [
      STEP_AD_ACCOUNT,
      ...getResourceManagerSteps().executeFirstSteps,
    ],
    executionHandler: fetchPolicyAssignments,
  },
];
