import {
  Entity,
  createDirectRelationship,
  createMappedRelationship,
  IntegrationError,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker, AzureWebLinker } from '../../../azure';
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

export function getRoleDefinitionKeyFromRoleAssignment(
  roleAssignment: RoleAssignment,
): string {
  const fullyQualifiedRoleDefinitionId = roleAssignment.roleDefinitionId as string;
  return fullyQualifiedRoleDefinitionId.replace(
    roleAssignment.scope as string,
    '',
  );
}

type PlaceholderEntity = { _type: string; _key: string };

/**
 * Tries to fetch the role definition from the present job state.
 * If the definition is not in the job state, calls Azure client and builds entity
 * If Azure client doesn't return a role definition, throws Integration Error.
 * @throws IntegrationError
 */
export async function findOrCreateRoleDefinitionEntity(
  executionContext: IntegrationStepContext,
  options: {
    client: AuthorizationClient;
    webLinker: AzureWebLinker;
    roleAssignment: RoleAssignment;
  },
): Promise<Entity> {
  const { jobState, logger } = executionContext;
  const { client, webLinker, roleAssignment } = options;
  const roleDefinitionKey = getRoleDefinitionKeyFromRoleAssignment(
    roleAssignment,
  );
  let roleDefinitionEntity: Entity;
  try {
    roleDefinitionEntity = await jobState.getEntity({
      _type: ROLE_DEFINITION_ENTITY_TYPE,
      _key: roleDefinitionKey,
    });
  } catch (err) {
    // entity does not already exist in job state - create it.
    const roleDefinition = await client.getRoleDefinition(roleDefinitionKey);
    if (roleDefinition !== undefined) {
      roleDefinitionEntity = createRoleDefinitionEntity(
        webLinker,
        roleDefinition,
      );
      await jobState.addEntity(roleDefinitionEntity);
    } else {
      logger.warn(
        { roleAssignment },
        'AuthorizationClient.getRoleDefinition returned "undefined" for roleDefinitionId.',
      );
      throw new IntegrationError({
        message:
          'AuthorizationClient.getRoleDefinition returned "undefined" for roleDefinitionId.',
        code: 'AZURE_ROLE_DEFINITION_MISSING',
      });
    }
  }
  return roleDefinitionEntity;
}

/**
 * Tries to fetch the target entity from the job state.
 * If the entity is not in the job state, returns {_key, _type} for mapper.
 */
export async function findOrBuildTargetEntityForRoleDefinition(
  executionContext: IntegrationStepContext,
  options: {
    roleAssignment: RoleAssignment;
  },
): Promise<Entity | PlaceholderEntity> {
  const { jobState } = executionContext;
  const { roleAssignment } = options;
  const targetType = getJupiterTypeForPrincipalType(
    roleAssignment.principalType,
  );
  const targetKey = generateEntityKey(targetType, roleAssignment.principalId);
  let targetEntity: Entity | PlaceholderEntity;
  try {
    targetEntity = await jobState.getEntity({
      _type: targetType,
      _key: targetKey,
    });
  } catch (err) {
    // target entity does not need to exist for mapped relationship
    targetEntity = {
      _type: targetType,
      _key: targetKey,
    };
  }
  return targetEntity;
}

function isPlaceholderEntity(
  targetEntity: Entity | PlaceholderEntity,
): targetEntity is PlaceholderEntity {
  return (targetEntity as any)._class === undefined;
}

export async function fetchRoleAssignmentsAndDefinitions(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new AuthorizationClient(instance.config, logger);

  await client.iterateRoleAssignments(async (roleAssignment) => {
    let roleDefinitionEntity: Entity;
    try {
      roleDefinitionEntity = await findOrCreateRoleDefinitionEntity(
        executionContext,
        { webLinker, roleAssignment, client },
      );
    } catch (err) {
      logger.warn(
        {
          err,
          roleAssignment,
        },
        'Could not find or create Azure Role Definition.',
      );
      return;
    }
    const targetEntity = await findOrBuildTargetEntityForRoleDefinition(
      executionContext,
      { roleAssignment },
    );

    const relationshipProperties = getRoleAssignmentRelationshipProperties(
      webLinker,
      roleAssignment,
    );

    if (isPlaceholderEntity(targetEntity)) {
      await jobState.addRelationship(
        createMappedRelationship({
          _class: ROLE_ASSIGNMENT_RELATIONSHIP_CLASS,
          source: roleDefinitionEntity,
          target: targetEntity,
          properties: relationshipProperties,
        }),
      );
    } else {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: ROLE_ASSIGNMENT_RELATIONSHIP_CLASS,
          from: roleDefinitionEntity,
          to: targetEntity,
          properties: relationshipProperties,
        }),
      );
    }
  });
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
