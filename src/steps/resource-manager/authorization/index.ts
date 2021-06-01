import {
  Entity,
  createDirectRelationship,
  createMappedRelationship,
  Step,
  IntegrationStepExecutionContext,
  RelationshipClass,
  getRawData,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { getAccountEntity, STEP_AD_ACCOUNT } from '../../active-directory';
import {
  steps as subscriptionSteps,
  entities as subscriptionEntities,
} from '../subscriptions/constants';
import { AuthorizationClient } from './client';
import {
  steps,
  entities,
  relationships,
  getJupiterTypeForPrincipalType,
} from './constants';
import {
  createRoleDefinitionEntity,
  createClassicAdministratorEntity as createClassicAdministratorGroupEntity,
  createClassicAdministratorHasUserMappedRelationship,
  createRoleAssignmentEntity,
} from './converters';
import {
  RoleAssignment,
  RoleDefinition,
} from '@azure/arm-authorization/esm/models';
import { generateEntityKey } from '../../../utils/generateKeys';
import { Subscription } from '@azure/arm-subscriptions/esm/models';
import { getResourceManagerSteps } from '../../../getStepStartStates';

export async function fetchRoleAssignments(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new AuthorizationClient(instance.config, logger);

  await client.iterateRoleAssignments(async (roleAssignment) => {
    const roleDefinitionEntity = await jobState.findEntity(
      roleAssignment.roleDefinitionId!,
    );

    const roleAssignmentEntity = createRoleAssignmentEntity(
      webLinker,
      roleAssignment,
      roleDefinitionEntity
        ? getRawData<RoleDefinition>(roleDefinitionEntity)
        : undefined,
    );
    await jobState.addEntity(roleAssignmentEntity);
  });
}

export async function buildRoleAssignmentPrincipalRelationships(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = executionContext;

  await jobState.iterateEntities(
    { _type: entities.ROLE_ASSIGNMENT._type },
    async (roleAssignmentEntity: Entity) => {
      const roleAssignment = getRawData<RoleAssignment>(roleAssignmentEntity);

      if (!roleAssignment) {
        logger.warn(
          {
            'roleAssignmentEntity._key': roleAssignmentEntity._key,
          },
          'Could not fetch role assignment raw data.',
        );
        return;
      }

      await jobState.addRelationship(
        createMappedRelationship({
          _class: RelationshipClass.ASSIGNED,
          source: roleAssignmentEntity,
          target: {
            _type: getJupiterTypeForPrincipalType(roleAssignment.principalType),
            _key: generateEntityKey(roleAssignment.principalId!),
          },
        }),
      );
    },
  );
}

export async function buildRoleAssignmentScopeRelationships(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = executionContext;

  await jobState.iterateEntities(
    { _type: entities.ROLE_ASSIGNMENT._type },
    async (roleAssignmentEntity: Entity) => {
      const roleAssignment = getRawData<RoleAssignment>(roleAssignmentEntity);

      if (!roleAssignment) {
        logger.warn(
          {
            'roleAssignmentEntity._key': roleAssignmentEntity._key,
          },
          'Could not fetch role assignment raw data.',
        );
        return;
      }

      const targetEntity = await jobState.findEntity(roleAssignment.scope!);

      if (targetEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            from: roleAssignmentEntity,
            _class: RelationshipClass.ALLOWS,
            to: targetEntity,
          }),
        );
        return;
      }

      await jobState.addRelationship(
        createMappedRelationship({
          _class: RelationshipClass.ALLOWS,
          source: roleAssignmentEntity,
          targetFilterKeys: [['id']],
          target: {
            id: roleAssignment.scope,
            _type: 'azure_scope',
            _key: roleAssignment.scope!,
          },
        }),
      );
    },
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
    { _type: subscriptionEntities.SUBSCRIPTION._type },
    async (subscriptionEntity) => {
      const subscription = getRawData<Subscription>(subscriptionEntity);

      if (!subscription?.id) return;

      await client.iterateRoleDefinitions(
        subscription.id,
        async (roleDefinition) => {
          const roleDefinitionEntity = await jobState.addEntity(
            createRoleDefinitionEntity(webLinker, roleDefinition),
          );
          await jobState.addRelationship(
            createDirectRelationship({
              from: subscriptionEntity,
              _class: RelationshipClass.CONTAINS,
              to: roleDefinitionEntity,
            }),
          );
        },
      );
    },
  );
}

export async function buildRoleAssignmentDefinitionRelationships(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: entities.ROLE_ASSIGNMENT._type },
    async (roleAssignmentEntity: Entity) => {
      const roleAssignment = getRawData<RoleAssignment>(roleAssignmentEntity);

      if (!roleAssignment) {
        logger.warn(
          {
            _key: roleAssignmentEntity._key,
            rawDataNames: roleAssignmentEntity._rawData?.map((r) => r.name),
          },
          'Could not find default roleAssignment in roleAssignmentEntity._rawData',
        );
        return;
      }

      if (!roleAssignment.roleDefinitionId) {
        logger.warn(
          {
            roleAssignmentId: roleAssignment.id,
          },
          'Role Assignment has no roleDefinitionId',
        );
        return;
      }
      const roleDefinitionEntity = await jobState.findEntity(
        roleAssignment.roleDefinitionId,
      );

      if (!roleDefinitionEntity) {
        logger.warn(
          {
            roleAssignmentId: roleAssignment.id,
            roleDefinitionId: roleAssignment.roleDefinitionId,
          },
          'Could not find roleDefinition for roleDefinitionId in jobState',
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
      createClassicAdministratorHasUserMappedRelationship({
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
    dependsOn: [STEP_AD_ACCOUNT, steps.ROLE_DEFINITIONS],
    executionHandler: fetchRoleAssignments,
  },
  {
    id: steps.ROLE_ASSIGNMENT_PRINCIPALS,
    name: 'Role Assignment to Principal Relationships',
    entities: [],
    relationships: relationships.ROLE_ASSIGNMENT_ASSIGNED_PRINCIPALS,
    dependsOn: [steps.ROLE_ASSIGNMENTS],
    executionHandler: buildRoleAssignmentPrincipalRelationships,
  },
  {
    id: steps.ROLE_ASSIGNMENT_SCOPES,
    name: 'Role Assignment to Scope Relationships',
    entities: [],
    relationships: [relationships.ROLE_ASSIGNMENT_ALLOWS_ANY_SCOPE],
    dependsOn: [
      steps.ROLE_ASSIGNMENTS,
      ...getResourceManagerSteps().executeFirstSteps,
    ],
    executionHandler: buildRoleAssignmentScopeRelationships,
  },
  {
    id: steps.ROLE_DEFINITIONS,
    name: 'Role Definitions',
    entities: [entities.ROLE_DEFINITION],
    relationships: [relationships.SUBSCRIPTION_CONTAINS_ROLE_DEFINITION],
    dependsOn: [STEP_AD_ACCOUNT, subscriptionSteps.SUBSCRIPTION],
    executionHandler: fetchRoleDefinitions,
  },
  {
    id: steps.ROLE_ASSIGNMENT_DEFINITIONS,
    name: 'Role Assignment -> Role Definition Relationships',
    entities: [],
    relationships: [relationships.ROLE_ASSIGNMENT_USES_DEFINITION],
    dependsOn: [steps.ROLE_ASSIGNMENTS, steps.ROLE_DEFINITIONS],
    executionHandler: buildRoleAssignmentDefinitionRelationships,
  },
  {
    id: steps.CLASSIC_ADMINS,
    name: 'Classic Administrators',
    entities: [entities.CLASSIC_ADMIN],
    relationships: [relationships.CLASSIC_ADMIN_GROUP_HAS_USER],
    dependsOn: [STEP_AD_ACCOUNT],
    executionHandler: fetchClassicAdministrators,
  },
];
