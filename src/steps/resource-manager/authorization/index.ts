import {
  Entity,
  createDirectRelationship,
  createMappedRelationship,
  IntegrationError,
  Step,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker, AzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import {
  getAccountEntity,
  STEP_AD_ACCOUNT,
  STEP_AD_USERS,
  USER_ENTITY_TYPE,
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
  ROLE_ASSIGNMENT_ENTITY_CLASS,
  ROLE_DEFINITION_ENTITY_CLASS,
  CLASSIC_ADMINISTRATOR_ENTITY_CLASS,
  CLASSIC_ADMINISTRATOR_RELATIONSHIP_CLASS,
  STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENT_SCOPE_RELATIONSHIPS,
  ROLE_ASSIGNMENT_SCOPE_RELATIONSHIP_TYPES,
  ROLE_ASSIGNMENT_SCOPE_RELATIONSHIP_CLASS,
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

export * from './constants';

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
    { _type: ROLE_ASSIGNMENT_ENTITY_TYPE },
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

export async function buildRoleAssignmentScopeRelationships(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = executionContext;

  const missingEntities: PlaceholderEntity[] = [];
  await jobState.iterateEntities(
    { _type: ROLE_ASSIGNMENT_ENTITY_TYPE },
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
            _class: ROLE_ASSIGNMENT_SCOPE_RELATIONSHIP_CLASS,
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
    id: STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENTS,
    name: 'Role Assignments',
    entities: [
      {
        resourceName: '[RM] Role Assignment',
        _type: ROLE_ASSIGNMENT_ENTITY_TYPE,
        _class: ROLE_ASSIGNMENT_ENTITY_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [STEP_AD_ACCOUNT],
    executionHandler: fetchRoleAssignments,
  },
  {
    id: STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENT_PRINCIPAL_RELATIONSHIPS,
    name: 'Role Assignment to Principal Relationships',
    entities: [],
    relationships: ROLE_ASSIGNMENT_PRINCIPAL_RELATIONSHIP_TYPES,
    dependsOn: [
      STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENTS,
      ...ROLE_ASSIGNMENT_PRINCIPAL_DEPENDS_ON,
    ],
    executionHandler: buildRoleAssignmentPrincipalRelationships,
  },
  {
    id: STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENT_SCOPE_RELATIONSHIPS,
    name: 'Role Assignment to Scope Relationships',
    entities: [],
    relationships: ROLE_ASSIGNMENT_SCOPE_RELATIONSHIP_TYPES,
    dependsOn: [
      STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENTS,
      ...SCOPE_MATCHER_DEPENDS_ON,
    ],
    executionHandler: buildRoleAssignmentScopeRelationships,
  },
  {
    id: STEP_RM_AUTHORIZATION_ROLE_DEFINITIONS,
    name: 'Role Definitions',
    entities: [
      {
        resourceName: '[RM] Role Definition',
        _type: ROLE_DEFINITION_ENTITY_TYPE,
        _class: ROLE_DEFINITION_ENTITY_CLASS,
      },
    ],
    relationships: [
      {
        _type: ROLE_DEFINITION_RELATIONSHIP_TYPE,
        sourceType: ROLE_ASSIGNMENT_ENTITY_TYPE,
        _class: ROLE_DEFINITION_RELATIONSHIP_CLASS,
        targetType: ROLE_DEFINITION_ENTITY_TYPE,
      },
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENTS],
    executionHandler: fetchRoleDefinitions,
  },
  {
    id: STEP_RM_AUTHORIZATION_CLASSIC_ADMINISTRATORS,
    name: 'Classic Administrators',
    entities: [
      {
        resourceName: '[RM] Classic Admin',
        _type: CLASSIC_ADMINISTRATOR_ENTITY_TYPE,
        _class: CLASSIC_ADMINISTRATOR_ENTITY_CLASS,
      },
    ],
    relationships: [
      {
        _type: CLASSIC_ADMINISTRATOR_RELATIONSHIP_TYPE,
        sourceType: CLASSIC_ADMINISTRATOR_ENTITY_TYPE,
        _class: CLASSIC_ADMINISTRATOR_RELATIONSHIP_CLASS,
        targetType: USER_ENTITY_TYPE,
      },
    ],
    dependsOn: [STEP_AD_USERS],
    executionHandler: fetchClassicAdministrators,
  },
];
