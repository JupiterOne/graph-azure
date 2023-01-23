import {
  createDirectRelationship,
  RelationshipClass,
  getRawData,
} from '@jupiterone/integration-sdk-core';
import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, AzureIntegrationStep } from '../../../types';
import { getAccountEntity } from '../../active-directory';
import { STEP_AD_ACCOUNT } from '../../active-directory/constants';
import { PolicyEntities, PolicyRelationships, PolicySteps } from './constants';
import { AzurePolicyClient } from './client';
import { createPolicyAssignmentEntity } from './converters';
import { getResourceManagerSteps } from '../../../getStepStartStates';
import { PolicyAssignment } from '@azure/arm-policy/esm/models';
import { findOrCreatePolicyDefinitionEntityFromPolicyAssignment } from './findOrCreatePolicyDefinitionEntityFromAssignment';

export async function fetchPolicyAssignments(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new AzurePolicyClient(instance.config, logger);

  await client.iteratePolicyAssignments(async (policyAssignment) => {
    await jobState.addEntity(
      createPolicyAssignmentEntity(webLinker, policyAssignment),
    );
  });
}

export async function buildPolicyAssignmentScopeRelationships(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: PolicyEntities.POLICY_ASSIGNMENT._type },
    async (policyAssignmentEntity) => {
      const policyAssignment = getRawData<PolicyAssignment>(
        policyAssignmentEntity,
      );
      if (!policyAssignment?.scope) return;

      const scopeEntity = await jobState.findEntity(policyAssignment.scope);
      if (!scopeEntity) return;

      await jobState.addRelationship(
        createDirectRelationship({
          from: scopeEntity,
          _class: RelationshipClass.HAS,
          to: policyAssignmentEntity,
        }),
      );

      /**
       * TODO: We want to add a relationship between the creator of the Policy Assignment and the Policy Assignment.
       * The Policy Assignment is createdBy some actor (application or user).
       * Because the id is just a guid and not in long form (i.e. /subscriptions/{subscriptionId}/providers/{providerName}/...),
       * we don't know yet who or what created the Policy Assignment.
       * If/when we can find out, we want to add that relationship here.
       */
    },
  );
}

/**
 * The PolicyClient.policyDefinitions.list() endpoint returns ~1500
 * policy definitions defined by default in Azure.
 *
 * At this point, it seems to make the most sense to just ingest those
 * policy definitions that are used in assignments within this subscription. The need may change in the future.
 */
export async function fetchPolicyDefinitionsForAssignments(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new AzurePolicyClient(instance.config, logger);

  const policyDefinitionContext = { client, webLinker };

  await jobState.iterateEntities(
    { _type: PolicyEntities.POLICY_ASSIGNMENT._type },
    async (policyAssignmentEntity) => {
      const policyAssignment = getRawData<PolicyAssignment>(
        policyAssignmentEntity,
      );

      const policyDefinitionEntity = await findOrCreatePolicyDefinitionEntityFromPolicyAssignment(
        executionContext,
        policyDefinitionContext,
        policyAssignment,
      );

      if (policyDefinitionEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            from: policyAssignmentEntity,
            _class: RelationshipClass.USES,
            to: policyDefinitionEntity,
          }),
        );
      }
    },
  );
}

export const policySteps: AzureIntegrationStep[] = [
  {
    id: PolicySteps.POLICY_ASSIGNMENTS,
    name: 'Policy Assignments',
    entities: [PolicyEntities.POLICY_ASSIGNMENT],
    relationships: [],
    dependsOn: [STEP_AD_ACCOUNT],
    executionHandler: fetchPolicyAssignments,
    permissions: ['Microsoft.Authorization/policyAssignments/read'],
  },
  {
    id: PolicySteps.POLICY_ASSIGNMENT_SCOPE_RELATIONSHIPS,
    name: 'Policy Assignment to Scope Relationships',
    entities: [],
    relationships: [PolicyRelationships.ANY_RESOURCE_HAS_POLICY_ASSIGNMENT],
    dependsOn: [
      STEP_AD_ACCOUNT,
      ...getResourceManagerSteps().executeFirstSteps,
    ],
    executionHandler: buildPolicyAssignmentScopeRelationships,
  },
  {
    id: PolicySteps.POLICY_DEFINITIONS,
    name: 'Policy Definitions',
    entities: [
      PolicyEntities.POLICY_SET_DEFINITION,
      PolicyEntities.POLICY_DEFINITION,
    ],
    relationships: [
      PolicyRelationships.AZURE_POLICY_ASSIGNMENT_USES_POLICY_SET_DEFINITION,
      PolicyRelationships.AZURE_POLICY_ASSIGNMENT_USES_POLICY_DEFINITION,
      PolicyRelationships.AZURE_POLICY_SET_DEFINITION_CONTAINS_DEFINITION,
    ],
    dependsOn: [STEP_AD_ACCOUNT, PolicySteps.POLICY_ASSIGNMENTS],
    executionHandler: fetchPolicyDefinitionsForAssignments,
    permissions: ['Microsoft.Authorization/policyDefinitions/read'],
  },
];
