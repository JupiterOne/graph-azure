import {
  Entity,
  createDirectRelationship,
  createMappedRelationship,
  IntegrationError,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker, AzureWebLinker } from '../../../azure';
import { IntegrationStepContext } from '../../../types';
import {
  ACCOUNT_ENTITY_TYPE,
  STEP_AD_ACCOUNT,
  STEP_AD_USERS,
} from '../../active-directory';
import { AuthorizationClient } from './client';
import {
  ROLE_DEFINITION_ENTITY_TYPE,
  STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENTS,
  ROLE_ASSIGNMENT_PRINCIPAL_DEPENDS_ON,
  getJupiterTypeForPrincipalType,
  ROLE_ASSIGNMENT_PRINCIPAL_RELATIONSHIP_CLASS,
  ROLE_ASSIGNMENT_PRINCIPAL_RELATIONSHIP_TYPES,
  STEP_RM_AUTHORIZATION_CLASSIC_ADMINISTRATORS,
  CLASSIC_ADMINISTRATOR_ENTITY_TYPE,
  CLASSIC_ADMINISTRATOR_RELATIONSHIP_TYPE,
  ROLE_ASSIGNMENT_ENTITY_TYPE,
  STEP_RM_AUTHORIZATION_ROLE_DEFINITIONS,
  ROLE_DEFINITION_RELATIONSHIP_TYPE,
  ROLE_DEFINITION_RELATIONSHIP_CLASS,
  STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENT_PRINCIPAL_RELATIONSHIPS,
} from './constants';
import {
  createRoleDefinitionEntity,
  createClassicAdministratorEntity as createClassicAdministratorGroupEntity,
  createClassicAdministratorHasUserRelationship,
  createRoleAssignmentEntity,
} from './converters';
import { PrincipalType } from '@azure/arm-authorization/esm/models';
import { generateEntityKey } from '../../../utils/generateKeys';

export * from './constants';

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
    roleDefinitionId: string;
  },
): Promise<Entity> {
  const { jobState, logger } = executionContext;
  const { client, webLinker, roleDefinitionId } = options;
  let roleDefinitionEntity: Entity;
  try {
    roleDefinitionEntity = await jobState.getEntity({
      _type: ROLE_DEFINITION_ENTITY_TYPE,
      _key: roleDefinitionId,
    });
  } catch (err) {
    // entity does not already exist in job state - create it.
    const roleDefinition = await client.getRoleDefinition(roleDefinitionId);
    if (roleDefinition !== undefined) {
      roleDefinitionEntity = createRoleDefinitionEntity(
        webLinker,
        roleDefinition,
      );
      await jobState.addEntity(roleDefinitionEntity);
    } else {
      logger.warn(
        { roleDefinitionId },
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
    principalId: string;
    principalType: string;
  },
): Promise<Entity | PlaceholderEntity> {
  const { jobState } = executionContext;
  const { principalId, principalType } = options;
  const targetType = getJupiterTypeForPrincipalType(
    principalType as PrincipalType,
  );
  const targetKey = generateEntityKey(principalId);
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

export async function fetchRoleAssignments(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new AuthorizationClient(instance.config, logger);

  await client.iterateRoleAssignments(async (roleAssignment) => {
    const roleAssignmentEntity = createRoleAssignmentEntity(
      webLinker,
      roleAssignment,
    );
    await jobState.addEntity(roleAssignmentEntity);
  });
}

export async function buildRoleAssignmentPrincipalRelationships(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: ROLE_ASSIGNMENT_ENTITY_TYPE },
    async (roleAssignmentEntity: Entity) => {
      const targetEntity = await findOrBuildTargetEntityForRoleDefinition(
        executionContext,
        {
          principalId: roleAssignmentEntity.principalId as string,
          principalType: roleAssignmentEntity.principalType as string,
        },
      );

      if (isPlaceholderEntity(targetEntity)) {
        await jobState.addRelationship(
          createMappedRelationship({
            _class: ROLE_ASSIGNMENT_PRINCIPAL_RELATIONSHIP_CLASS,
            source: roleAssignmentEntity,
            target: targetEntity,
          }),
        );
      } else {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: ROLE_ASSIGNMENT_PRINCIPAL_RELATIONSHIP_CLASS,
            from: roleAssignmentEntity,
            to: targetEntity,
          }),
        );
      }
    },
  );
}

export async function fetchRoleDefinitions(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new AuthorizationClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: ROLE_ASSIGNMENT_ENTITY_TYPE },
    async (roleAssignmentEntity: Entity) => {
      const roleDefinitionId = roleAssignmentEntity.roleDefinitionId as string;
      let roleDefinitionEntity: Entity;
      try {
        roleDefinitionEntity = await findOrCreateRoleDefinitionEntity(
          executionContext,
          { webLinker, roleDefinitionId, client },
        );
      } catch (err) {
        logger.warn(
          {
            err,
            roleAssignment: roleAssignmentEntity,
          },
          'Could not find or create Azure Role Definition.',
        );
        return;
      }
      await jobState.addRelationship(
        createDirectRelationship({
          _class: ROLE_DEFINITION_RELATIONSHIP_CLASS,
          from: roleDefinitionEntity,
          to: roleAssignmentEntity,
        }),
      );
    },
  );
}

export async function fetchClassicAdministrators(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new AuthorizationClient(instance.config, logger);

  const classicAdministratorGroupEntity = createClassicAdministratorGroupEntity();
  await jobState.addEntity(classicAdministratorGroupEntity);

  await client.iterateClassicAdministrators(async (ca) => {
    await jobState.addRelationship(
      createClassicAdministratorHasUserRelationship({
        webLinker,
        classicAdministratorGroupEntity,
        data: ca,
      }),
    );
  });
}

export const authorizationSteps = [
  {
    id: STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENTS,
    name: 'Role Assignments',
    types: [ROLE_ASSIGNMENT_ENTITY_TYPE],
    dependsOn: [STEP_AD_ACCOUNT],
    executionHandler: fetchRoleAssignments,
  },
  {
    id: STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENT_PRINCIPAL_RELATIONSHIPS,
    name: 'Role Assignment to Principal Relationships',
    types: ROLE_ASSIGNMENT_PRINCIPAL_RELATIONSHIP_TYPES,
    dependsOn: [
      STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENTS,
      ...ROLE_ASSIGNMENT_PRINCIPAL_DEPENDS_ON,
    ],
    executionHandler: buildRoleAssignmentPrincipalRelationships,
  },
  {
    id: STEP_RM_AUTHORIZATION_ROLE_DEFINITIONS,
    name: 'Role Definitions',
    types: [ROLE_DEFINITION_ENTITY_TYPE, ROLE_DEFINITION_RELATIONSHIP_TYPE],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENTS],
    executionHandler: fetchRoleDefinitions,
  },
  {
    id: STEP_RM_AUTHORIZATION_CLASSIC_ADMINISTRATORS,
    name: 'Classic Administrators',
    types: [
      CLASSIC_ADMINISTRATOR_ENTITY_TYPE,
      CLASSIC_ADMINISTRATOR_RELATIONSHIP_TYPE,
    ],
    dependsOn: [STEP_AD_USERS],
    executionHandler: fetchClassicAdministrators,
  },
];
