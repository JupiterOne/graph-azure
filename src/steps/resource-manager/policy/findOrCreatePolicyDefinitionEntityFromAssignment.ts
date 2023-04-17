import {
  createDirectRelationship,
  RelationshipClass,
  Entity,
  generateRelationshipKey,
  IntegrationError,
} from '@jupiterone/integration-sdk-core';
import { AzureWebLinker } from '../../../azure';
import { IntegrationStepContext } from '../../../types';
import { AzurePolicyClient } from './client';
import {
  createPolicyDefinitionEntity,
  createPolicySetDefinitionEntity,
} from './converters';
import {
  PolicyAssignment,
  PolicyDefinition,
  PolicySetDefinition,
} from '@azure/arm-policy/esm/models';

/**
 * Azure, by default, contains thousands of policy definitions and policy set definitions.
 * At this point, we don't want to ingest so many entities into the J1 graph, especially if
 * they have not relationships to infrastructure in the target account. Instead, we only
 * fetch those entities that are used in a policy assignment.
 *
 * However, we need to carefully select from among the four resource types that a policy
 * assignment might point to. Each uses a unique endpoint:
 *   - Custom Policy Definition
 *   - Built-in Policy Definition
 *   - Custom Policy Set Definition
 *   - Built-in Policy Set Definition
 *
 * In addition, policy set definitions ("initiative definitions" in Azure portal) contain a
 * collection of policy definitions themselves, which need to be either found or fetched.
 */
export async function findOrCreatePolicyDefinitionEntityFromPolicyAssignment(
  executionContext: IntegrationStepContext,
  policyDefinitionContext: {
    client: AzurePolicyClient;
    webLinker: AzureWebLinker;
  },
  policyAssignment: PolicyAssignment | undefined,
): Promise<Entity | undefined> {
  const { logger } = executionContext;

  if (!policyAssignment?.policyDefinitionId) {
    logger.warn(
      {
        policyAssignmentId: policyAssignment?.id,
        policyDefinitionId: policyAssignment?.policyDefinitionId,
      },
      'Warning: Policy assignment does not have a policy definition ID.',
    );
    return;
  }

  return findOrCreatePolicyDefinitionEntity(
    executionContext,
    policyDefinitionContext,
    policyAssignment.policyDefinitionId,
    policyAssignment.id,
  );
}

async function findOrCreatePolicyDefinitionEntity(
  executionContext: IntegrationStepContext,
  policyDefinitionContext: {
    client: AzurePolicyClient;
    webLinker: AzureWebLinker;
  },
  policyDefinitionId: string,
  parentId: string | undefined,
): Promise<Entity | undefined> {
  const { logger, jobState } = executionContext;
  const { client, webLinker } = policyDefinitionContext;

  const existingPolicyDefinitionEntity =
    (await jobState.findEntity(policyDefinitionId)) || undefined;
  if (existingPolicyDefinitionEntity) return existingPolicyDefinitionEntity;
  const type = getPolicyDefinitionType(policyDefinitionId);
  if (!type) {
    logger.warn(
      {
        parentId,
        policyDefinitionId,
      },
      'Warning: Policy definition ID matched neither PolicyDefinition nor PolicySetDefinition types.',
    );
    return;
  }

  const name = getNameFromPolicyDefinitionId(policyDefinitionId);
  if (!name) {
    logger.warn(
      {
        parentId,
        policyDefinitionId,
      },
      'Warning: Could not parse name from policy definition ID.',
    );
    return;
  }

  switch (type) {
    case PolicyDefinitionType.POLICY_DEFINITION: {
      const policyDefinition = await getPolicyDefinition(
        client,
        policyDefinitionId,
        name,
      );
      if (policyDefinition) {
        return jobState.addEntity(
          createPolicyDefinitionEntity(webLinker, policyDefinition),
        );
      }
      break;
    }
    case PolicyDefinitionType.POLICY_SET_DEFINITION: {
      const policySetDefinition = await getPolicySetDefinition(
        client,
        policyDefinitionId,
        name,
      );
      if (policySetDefinition) {
        const policySetDefinitionEntity = await jobState.addEntity(
          createPolicySetDefinitionEntity(webLinker, policySetDefinition),
        );
        await findOrCreatePolicyDefinitionGraphObjectsFromPolicySetDefinition(
          executionContext,
          policyDefinitionContext,
          policySetDefinition,
          policySetDefinitionEntity,
        );
        return policySetDefinitionEntity;
      } else {
        logger.warn(
          {
            policyDefinitionId,
          },
          'Warning: Could not create policy definition entity.',
        );
      }
      break;
    }
  }
}

async function getPolicyDefinition(
  client: AzurePolicyClient,
  policyDefinitionId: string,
  name: string,
): Promise<PolicyDefinition | undefined> {
  switch (getDefinitionSource(policyDefinitionId)) {
    case PolicyDefinitionSource.BUILT_IN:
      return client.getBuiltInPolicyDefinition(name);
    case PolicyDefinitionSource.SUBSCRIPTION:
      return client.getPolicyDefinition(name);
    case PolicyDefinitionSource.MANAGEMENT_GROUP:
      return client.getManagementGroupPolicyDefinition(
        name,
        getManagementGroupIdFromPolicyDefinitionId(policyDefinitionId),
      );
  }
}

async function getPolicySetDefinition(
  client: AzurePolicyClient,
  policyDefinitionId: string,
  name: string,
): Promise<PolicySetDefinition | undefined> {
  switch (getDefinitionSource(policyDefinitionId)) {
    case PolicyDefinitionSource.BUILT_IN:
      return client.getBuiltInPolicySetDefinition(name);
    case PolicyDefinitionSource.SUBSCRIPTION:
      return client.getPolicySetDefinition(name);
    case PolicyDefinitionSource.MANAGEMENT_GROUP:
      return client.getManagementGroupPolicySetDefinition(
        name,
        getManagementGroupIdFromPolicyDefinitionId(policyDefinitionId),
      );
  }
}

async function findOrCreatePolicyDefinitionGraphObjectsFromPolicySetDefinition(
  executionContext: IntegrationStepContext,
  policyDefinitionContext: {
    client: AzurePolicyClient;
    webLinker: AzureWebLinker;
  },
  policySetDefinition: PolicySetDefinition,
  policySetDefinitionEntity: Entity,
): Promise<void> {
  const { logger, jobState } = executionContext;

  for (const policyDefinitionReference of policySetDefinition.policyDefinitions) {
    const policyDefinitionEntity = await findOrCreatePolicyDefinitionEntity(
      executionContext,
      policyDefinitionContext,
      policyDefinitionReference.policyDefinitionId,
      policySetDefinition.id,
    );
    if (policyDefinitionEntity) {
      await jobState.addRelationship(
        createDirectRelationship({
          from: policySetDefinitionEntity,
          _class: RelationshipClass.CONTAINS,
          to: policyDefinitionEntity,
          properties: {
            policyDefinitionId: policyDefinitionReference.policyDefinitionId,
            policyDefinitionReferenceId:
              policyDefinitionReference.policyDefinitionReferenceId,
            // the following properties have invalid types for edges:
            // parameters: policyDefinitionReference.parameters,
            // groupNames: policyDefinitionReference.groupNames,
            _key: generateRelationshipKey(
              RelationshipClass.CONTAINS,
              policySetDefinitionEntity,
              policyDefinitionReference.policyDefinitionReferenceId!,
            ),
          },
        }),
      );
    } else {
      logger.warn(
        {
          policySetDefinitionId: policySetDefinition.id,
          policyDefinitionReference,
        },
        'WARNING: Cannot find policy definition defined by policy set definition',
      );
    }
  }
}

/**
 * Built-in definitions do not start with `/subscriptions/${subscription-id}/`, while custom definitions do.
 *
 * Built-in example:
 * /providers/Microsoft.Authorization/policySetDefinitions/1f3afdf9-d0c9-4c3d-847f-89da613e70a8
 *
 * Subscription example:
 * /subscriptions/ae640e6b-ba3e-4256-9d62-2993eecfa6f2/providers/Microsoft.Authorization/policySetDefinitions/CostManagement
 *
 * Management Group example:
 * /providers/Microsoft.Management/managementGroups/JupiterOneAllSubscriptions/providers/Microsoft.Authorization/policySetDefinitions/a93f7eec-5513-4d40-9c74-2fe071ddc859
 */
enum PolicyDefinitionSource {
  BUILT_IN = 'BUILT_IN',
  SUBSCRIPTION = 'SUBSCRIPTION',
  MANAGEMENT_GROUP = 'MANAGEMENT_GROUP',
}

function getDefinitionSource(
  policyDefinitionId: string,
): PolicyDefinitionSource {
  if (policyDefinitionId.toLowerCase().startsWith('/subscriptions/')) {
    return PolicyDefinitionSource.SUBSCRIPTION;
  }
  if (
    policyDefinitionId
      .toLowerCase()
      .startsWith('/providers/microsoft.management/managementgroups/')
  ) {
    return PolicyDefinitionSource.MANAGEMENT_GROUP;
  }
  if (
    policyDefinitionId
      .toLowerCase()
      .startsWith('/providers/microsoft.authorization/')
  ) {
    return PolicyDefinitionSource.BUILT_IN;
  }

  throw new IntegrationError({
    message: `The policy definition ${policyDefinitionId} does not match any known sources (${PolicyDefinitionSource})`,
    code: 'UNKNOWN_POLICY_DEFINITION_SOURCE',
  });
}

enum PolicyDefinitionType {
  POLICY_DEFINITION = 'POLICY_DEFINITION',
  POLICY_SET_DEFINITION = 'POLICY_SET_DEFINITION',
}

/**
 * Policy definition IDs may or may not start with `/subscriptions/${subscription-id}`,
 * but will contain the following patterns.
 */
const namePattern = '[^/]+';
const policyDefinitionRegex = new RegExp(
  `/providers/Microsoft.Authorization/policyDefinitions/${namePattern}$`,
  'i',
);
const policySetDefinitionRegex = new RegExp(
  `/providers/Microsoft.Authorization/policySetDefinitions/${namePattern}$`,
  'i',
);

/**
 * Policy definition paths include either 'policyDefinitions' or 'policySetDefinitions'
 *
 * Policy definition example:
 * /providers/Microsoft.Authorization/policyDefinitions/1f3afdf9-d0c9-4c3d-847f-89da613e70a8
 *
 * Policy set definition example:
 * /providers/Microsoft.Authorization/policySetDefinitions/1f3afdf9-d0c9-4c3d-847f-89da613e70a8
 */
function getPolicyDefinitionType(policyDefinitionId: string) {
  if (policyDefinitionRegex.test(policyDefinitionId)) {
    return PolicyDefinitionType.POLICY_DEFINITION;
  }

  if (policySetDefinitionRegex.test(policyDefinitionId)) {
    return PolicyDefinitionType.POLICY_SET_DEFINITION;
  }
}

/**
 * The name of a policy defintion or policy set definition can be a UUID or other string.
 *
 * {
 *   id: '/providers/Microsoft.Authorization/policyDefinitions/0e60b895-3786-45da-8377-9c6b4b6ac5f9',
 *   name: '0e60b895-3786-45da-8377-9c6b4b6ac5f9',
 *   ...
 * }
 */
function getNameFromPolicyDefinitionId(policyDefinitionId: string) {
  const slashDelimetedSegements = policyDefinitionId.split('/');
  return slashDelimetedSegements[slashDelimetedSegements.length - 1];
}

/**
 * The management group ID for a policy defintion or policy set definition can be extracted from the policy definition ID.
 *
 * {
 *   id: '/providers/Microsoft.Management/managementGroups/JupiterOneAllSubscriptions/providers/Microsoft.Authorization/policySetDefinitions/a93f7eec-5513-4d40-9c74-2fe071ddc859',
 *   name: '0e60b895-3786-45da-8377-9c6b4b6ac5f9',
 *   managementGroupId: 'JupiterOneAllSubscriptions',
 *   ...
 * }
 *
 * id.split('/') = [
 *   '',                           // 0
 *   'providers',                  // 1
 *   'Microsoft.Management',       // 2
 *   'managementGroups',           // 3
 *   'JupiterOneAllSubscriptions', // 4
 *   ...
 * ]
 */
function getManagementGroupIdFromPolicyDefinitionId(
  policyDefinitionId: string,
) {
  const slashDelimetedSegements = policyDefinitionId.split('/');
  return slashDelimetedSegements[4];
}
