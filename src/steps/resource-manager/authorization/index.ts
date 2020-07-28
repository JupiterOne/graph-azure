import {
  Entity,
  createDirectRelationship,
  createMappedRelationship,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext } from '../../../types';
import { ACCOUNT_ENTITY_TYPE, STEP_AD_ACCOUNT } from '../../active-directory';
import { AuthorizationClient } from './client';
import {
  ROLE_DEFINITION_ENTITY_TYPE,
  STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENTS_AND_DEFINITIONS,
  ROLE_ASSIGNMENT_DEPENDS_ON,
  getJupiterTypeForPrincipalType,
  ROLE_ASSIGNMENT_RELATIONSHIP_CLASS,
  ROLE_ASSIGNMENT_RELATIONSHIP_TYPES,
} from './constants';
import {
  createRoleDefinitionEntity,
  getRoleAssignmentRelationshipProperties,
} from './converters';
import { RoleAssignment } from '@azure/arm-authorization/esm/models';
import { generateEntityKey } from '../../../utils/generateKeys';

export * from './constants';

function getRoleDefinitionFromRoleAssignment(
  roleAssignment: RoleAssignment,
): string {
  const fullyQualifiedRoleDefinitionId = roleAssignment.roleDefinitionId as string;
  return fullyQualifiedRoleDefinitionId.replace(
    roleAssignment.scope as string,
    '',
  );
}

function getUniqueRoleDefinitionIdsFromRoleAssignments(
  roleAssignments: RoleAssignment[],
): Set<string> {
  return new Set(roleAssignments.map(getRoleDefinitionFromRoleAssignment));
}

export async function fetchRoleAssignmentsAndDefinitions(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new AuthorizationClient(instance.config, logger);

  const roleAssignments: RoleAssignment[] = [];
  await client.iterateRoleAssignments(async (ra) => {
    roleAssignments.push(ra);
  });

  for (const roleDefinitionId of getUniqueRoleDefinitionIdsFromRoleAssignments(
    roleAssignments,
  )) {
    const roleDefinition = await client.getRoleDefinition(roleDefinitionId);
    if (roleDefinition !== undefined) {
      await jobState.addEntity(
        createRoleDefinitionEntity(webLinker, roleDefinition),
      );
    } else {
      logger.warn(
        { roleDefinitionId },
        'AuthorizationClient.getRoleDefinition returned "undefined" for roleDefinitionId.',
      );
    }
  }

  for (const roleAssignment of roleAssignments) {
    const roleDefinitionId = getRoleDefinitionFromRoleAssignment(
      roleAssignment,
    );
    const roleDefinitionKey = generateEntityKey(
      ROLE_DEFINITION_ENTITY_TYPE,
      roleDefinitionId,
    );
    let roleDefinitionEntity: Entity;
    try {
      roleDefinitionEntity = await jobState.getEntity({
        _type: ROLE_DEFINITION_ENTITY_TYPE,
        _key: roleDefinitionKey,
      });
    } catch (err) {
      logger.warn({ err }, 'Entity not found in job state');
      continue;
    }

    const targetType = getJupiterTypeForPrincipalType(
      roleAssignment.principalType,
    );
    const targetKey = generateEntityKey(targetType, roleAssignment.principalId);
    const properties = getRoleAssignmentRelationshipProperties(
      webLinker,
      roleAssignment,
    );
    try {
      const targetEntity = await jobState.getEntity({
        _type: targetType,
        _key: targetKey,
      });
      await jobState.addRelationship(
        createDirectRelationship({
          _class: ROLE_ASSIGNMENT_RELATIONSHIP_CLASS,
          from: roleDefinitionEntity,
          to: targetEntity,
          properties,
        }),
      );
    } catch (err) {
      // target entity does not need to exist for mapped relationships
      await jobState.addRelationship(
        createMappedRelationship({
          _class: ROLE_ASSIGNMENT_RELATIONSHIP_CLASS,
          source: roleDefinitionEntity,
          target: { _type: targetType, _key: targetKey },
          properties,
        }),
      );
    }
  }
}

export const authorizationSteps = [
  {
    id: STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENTS_AND_DEFINITIONS,
    name: 'Role Assignments & Definitions',
    types: [ROLE_DEFINITION_ENTITY_TYPE, ...ROLE_ASSIGNMENT_RELATIONSHIP_TYPES],
    dependsOn: [STEP_AD_ACCOUNT, ...ROLE_ASSIGNMENT_DEPENDS_ON],
    executionHandler: fetchRoleAssignmentsAndDefinitions,
  },
];
