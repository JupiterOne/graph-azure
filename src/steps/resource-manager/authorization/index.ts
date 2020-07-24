import { Entity } from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext } from '../../../types';
import { ACCOUNT_ENTITY_TYPE, STEP_AD_ACCOUNT } from '../../active-directory';
import { AuthorizationClient } from './client';
import {
  ROLE_DEFINITION_ENTITY_TYPE,
  STEP_RM_AUTHORIZATION_ROLE_DEFINITIONS,
  ROLE_ASSIGNMENT_DATA_KEY,
  STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENTS,
  STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENT_RELATIONSHIPS,
  ROLE_ASSIGNMENT_RELATIONSHIP_TYPES,
  ROLE_ASSIGNMENT_DEPENDS_ON,
} from './constants';
import {
  createRoleDefinitionEntity,
  createRoleAssignmentRelationship,
} from './converters';
import { RoleAssignment } from '@azure/arm-authorization/esm/models';

export * from './constants';

export async function fetchRoleAssignments(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;

  const client = new AuthorizationClient(instance.config, logger);

  const roleAssignments: RoleAssignment[] = [];
  await client.iterateRoleAssignments(async (ra) => {
    roleAssignments.push(ra);
  });

  await jobState.setData(ROLE_ASSIGNMENT_DATA_KEY, roleAssignments);
}

export async function fetchRoleDefinitions(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new AuthorizationClient(instance.config, logger);

  const roleAssignments = await jobState.getData<RoleAssignment[]>(
    ROLE_ASSIGNMENT_DATA_KEY,
  );

  const roleDefinitionsUsedInAssignments = new Set(
    roleAssignments.map(
      (ra) => ra.roleDefinitionId?.replace(ra.scope as string, '') as string,
    ),
  );

  for (const roleDefinitionId of roleDefinitionsUsedInAssignments) {
    const roleDefinition = await client.getRoleDefinition(roleDefinitionId);
    if (roleDefinition !== undefined) {
      const roleDefinitionEntity = createRoleDefinitionEntity(
        webLinker,
        roleDefinition,
      );
      await jobState.addEntity(roleDefinitionEntity);
    } else {
      logger.warn(
        { roleDefinitionId },
        'AuthorizationClient.getRoleDefinition returned "undefined" for roleDefinitionId.',
      );
    }
  }
}

export async function buildRoleAssignmentRelationships(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState } = executionContext;
  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  const roleAssignments = await jobState.getData<RoleAssignment[]>(
    ROLE_ASSIGNMENT_DATA_KEY,
  );

  for (const roleAssignment of roleAssignments) {
    const relationship = createRoleAssignmentRelationship(
      webLinker,
      roleAssignment,
    );
    await jobState.addRelationship(relationship);
  }
}

export const authorizationSteps = [
  {
    id: STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENTS,
    name: 'Role Assignments',
    types: [],
    dependsOn: [STEP_AD_ACCOUNT],
    executionHandler: fetchRoleAssignments,
  },
  {
    id: STEP_RM_AUTHORIZATION_ROLE_DEFINITIONS,
    name: 'Role Definitions',
    types: [ROLE_DEFINITION_ENTITY_TYPE],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENTS],
    executionHandler: fetchRoleDefinitions,
  },
  {
    id: STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENT_RELATIONSHIPS,
    name: 'Role Assignment Relationships',
    types: ROLE_ASSIGNMENT_RELATIONSHIP_TYPES,
    dependsOn: [
      STEP_AD_ACCOUNT,
      STEP_RM_AUTHORIZATION_ROLE_DEFINITIONS,
      ...ROLE_ASSIGNMENT_DEPENDS_ON,
    ],
    executionHandler: buildRoleAssignmentRelationships,
  },
];
