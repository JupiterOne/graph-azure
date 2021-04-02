import {
  Entity,
  createDirectRelationship,
  createMappedRelationship,
  IntegrationError,
  Step,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker, AzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import {
  getAccountEntity,
  STEP_AD_ACCOUNT,
  STEP_AD_USERS,
} from '../../active-directory';
import { AuthorizationClient } from './client';
import {
  steps,
  entities,
  relationships,
  ROLE_ASSIGNMENT_PRINCIPAL_DEPENDS_ON,
  getJupiterTypeForPrincipalType,
  SCOPE_MATCHER_DEPENDS_ON,
  SCOPE_TYPES_MAP,
} from './constants';
import {
  createRoleDefinitionEntity,
  createClassicAdministratorEntity as createClassicAdministratorGroupEntity,
  createClassicAdministratorHasUserRelationship,
  createRoleAssignmentEntity,
} from './converters';
import { PrincipalType } from '@azure/arm-authorization/esm/models';
import { generateEntityKey } from '../../../utils/generateKeys';
import findOrBuildResourceEntityFromResourceId, {
  PlaceholderEntity,
  isPlaceholderEntity,
} from '../utils/findOrBuildResourceEntityFromResourceId';

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
  let roleDefinitionEntity = await jobState.findEntity(roleDefinitionId);
  if (roleDefinitionEntity === null) {
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
 * Tries to fetch the principal entity from the job state.
 * If the entity is not in the job state, returns {_key, _type} for mapper.
 */
export async function findOrBuildPrincipalEntityForRoleAssignment(
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
  // let targetEntity: Entity | PlaceholderEntity;
  let targetEntity:
    | Entity
    | PlaceholderEntity
    | null = await jobState.findEntity(targetKey);
  if (targetEntity === null) {
    targetEntity = {
      _type: targetType,
      _key: targetKey,
    };
  }
  return targetEntity;
}

export async function fetchRoleAssignments(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
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
    { _type: entities.ROLE_ASSIGNMENT._type },
    async (roleAssignmentEntity: Entity) => {
      const targetEntity = await findOrBuildPrincipalEntityForRoleAssignment(
        executionContext,
        {
          principalId: roleAssignmentEntity.principalId as string,
          principalType: roleAssignmentEntity.principalType as string,
        },
      );

      if (isPlaceholderEntity(targetEntity)) {
        await jobState.addRelationship(
          createMappedRelationship({
            _class: RelationshipClass.ASSIGNED,
            source: roleAssignmentEntity,
            target: targetEntity,
          }),
        );
      } else {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.ASSIGNED,
            from: roleAssignmentEntity,
            to: targetEntity,
          }),
        );
      }
    },
  );
}

export async function buildRoleAssignmentScopeRelationships(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = executionContext;

  const missingEntities: PlaceholderEntity[] = [];
  await jobState.iterateEntities(
    { _type: entities.ROLE_ASSIGNMENT._type },
    async (roleAssignmentEntity: Entity) => {
      const targetEntity = await findOrBuildResourceEntityFromResourceId(
        executionContext,
        {
          resourceId: roleAssignmentEntity.scope as string,
          resourceIdMap: SCOPE_TYPES_MAP,
        },
      );

      if (targetEntity === undefined) {
        // Target entity not found in job state - OK
      } else if (isPlaceholderEntity(targetEntity)) {
        missingEntities.push(targetEntity);
      } else {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.ALLOWS,
            from: roleAssignmentEntity,
            to: targetEntity,
          }),
        );
      }
    },
  );

  logger.info(
    {
      missingResourceIds: missingEntities.map((e) => e._key),
    },
    '[SKIP] Scopes in RoleAssignments do not match resources currently ingested.',
  );
}

export async function fetchRoleDefinitions(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new AuthorizationClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: entities.ROLE_ASSIGNMENT._type },
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
          _class: RelationshipClass.USES,
          from: roleAssignmentEntity,
          to: roleDefinitionEntity,
        }),
      );
    },
  );
}

export async function fetchClassicAdministrators(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
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

export const authorizationSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: steps.ROLE_ASSIGNMENTS,
    name: 'Role Assignments',
    entities: [entities.ROLE_ASSIGNMENT],
    relationships: [],
    dependsOn: [STEP_AD_ACCOUNT],
    executionHandler: fetchRoleAssignments,
  },
  {
    id: steps.ROLE_ASSIGNMENT_PRINCIPALS,
    name: 'Role Assignment to Principal Relationships',
    entities: [],
    relationships: relationships.ROLE_ASSIGNMENT_ASSIGNED_PRINCIPALS,
    dependsOn: [
      steps.ROLE_ASSIGNMENTS,
      ...ROLE_ASSIGNMENT_PRINCIPAL_DEPENDS_ON,
    ],
    executionHandler: buildRoleAssignmentPrincipalRelationships,
  },
  {
    id: steps.ROLE_ASSIGNMENT_SCOPES,
    name: 'Role Assignment to Scope Relationships',
    entities: [],
    relationships: relationships.ROLE_ASSIGNMENT_ALLOWS_SCOPES,
    dependsOn: [steps.ROLE_ASSIGNMENTS, ...SCOPE_MATCHER_DEPENDS_ON],
    executionHandler: buildRoleAssignmentScopeRelationships,
  },
  {
    id: steps.ROLE_DEFINITIONS,
    name: 'Role Definitions',
    entities: [entities.ROLE_DEFINITION],
    relationships: [relationships.ROLE_ASSIGNMENT_USES_DEFINITION],
    dependsOn: [STEP_AD_ACCOUNT, steps.ROLE_ASSIGNMENTS],
    executionHandler: fetchRoleDefinitions,
  },
  {
    id: steps.CLASSIC_ADMINS,
    name: 'Classic Administrators',
    entities: [entities.CLASSIC_ADMIN],
    relationships: [relationships.CLASSIC_ADMIN_GROUP_HAS_USER],
    dependsOn: [STEP_AD_USERS],
    executionHandler: fetchClassicAdministrators,
  },
];
