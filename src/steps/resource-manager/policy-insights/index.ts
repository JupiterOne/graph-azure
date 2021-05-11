import {
  Step,
  IntegrationStepExecutionContext,
  getRawData,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { getAccountEntity, STEP_AD_ACCOUNT } from '../../active-directory';
import {
  PolicyInsightEntities,
  PolicyInsightRelationships,
  PolicyInsightSteps,
} from './constants';
import { AzurePolicyInsightsClient } from './client';
import { createPolicyStateEntity } from './converters';
import { PolicyState } from '@azure/arm-policyinsights/esm/models';
import { PolicySteps } from '../policy/constants';

export async function fetchLatestPolicyStatesForSubscription(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new AzurePolicyInsightsClient(instance.config, logger);

  await client.iterateLatestPolicyStatesForSubscription(async (policyState) => {
    await jobState.addEntity(createPolicyStateEntity(webLinker, policyState));
  });
}

export async function buildPolicyStateAssignmentRelationships(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: PolicyInsightEntities.POLICY_STATE._type },
    async (policyStateEntity) => {
      const policyState = getRawData<PolicyState>(policyStateEntity);

      const policyAssignmentId = policyState?.policyAssignmentId;
      const policyAssignmentEntity = await jobState.findEntity(
        policyAssignmentId!,
      );

      if (!policyAssignmentEntity) {
        logger.warn(
          {
            policyAssignmentId: policyState?.policyAssignmentId,
            policyDefinitionId: policyState?.policyDefinitionId,
            policyDefinitionReferenceId:
              policyState?.policyDefinitionReferenceId,
            resourceId: policyState?.resourceId,
            timestamp: policyState?.timestamp,
          },
          'Could not find policy assignment for policy state.',
        );
        return;
      }

      await jobState.addRelationship(
        createDirectRelationship({
          from: policyAssignmentEntity,
          _class: RelationshipClass.HAS,
          to: policyStateEntity,
        }),
      );
    },
  );
}

export const policyInsightSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: PolicyInsightSteps.SUBSCRIPTION_POLICY_STATES,
    name: 'Policy States',
    entities: [PolicyInsightEntities.POLICY_STATE],
    relationships: [],
    dependsOn: [STEP_AD_ACCOUNT],
    executionHandler: fetchLatestPolicyStatesForSubscription,
  },
  {
    id: PolicyInsightSteps.POLICY_STATE_TO_ASSIGNMENT_RELATIONSHIPS,
    name: 'Policy State to Policy Assignment Relationships',
    entities: [],
    relationships: [
      PolicyInsightRelationships.POLICY_ASSIGNMENT_HAS_POLICY_STATE,
    ],
    dependsOn: [
      PolicyInsightSteps.SUBSCRIPTION_POLICY_STATES,
      PolicySteps.POLICY_ASSIGNMENTS,
    ],
    executionHandler: fetchLatestPolicyStatesForSubscription,
  },
];
