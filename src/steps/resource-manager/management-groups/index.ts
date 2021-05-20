import {
  Step,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
  createMappedRelationship,
  RelationshipDirection,
  IntegrationExecutionContext,
  IntegrationProviderAuthorizationError,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker, createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { getAccountEntity, STEP_AD_ACCOUNT } from '../../active-directory';
import { ManagementGroupClient } from './client';
import { entities, relationships, steps } from './constants';
import { entities as SubscriptionEntities } from '../subscriptions/constants';
import { createManagementGroupEntity } from './converters';

export async function fetchManagementGroups(
  executionContext: IntegrationStepContext,
): Promise<void> {
  await validateManagementGroupStepInvocation(executionContext);

  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ManagementGroupClient(instance.config, logger);

  const {
    managementGroupEntity: tenantRootManagementGroupEntity,
  } = await getGraphObjectsForManagementGroup({
    webLinker,
    executionContext,
    client,
    managementGroupId: instance.config.directoryId,
  });

  await jobState.addRelationship(
    createDirectRelationship({
      from: accountEntity,
      _class: RelationshipClass.HAS,
      to: tenantRootManagementGroupEntity,
    }),
  );
}

export async function validateManagementGroupStepInvocation(
  context: IntegrationExecutionContext<IntegrationConfig>,
) {
  const client = new ManagementGroupClient(
    context.instance.config,
    context.logger,
  );
  const tenantId = context.instance.config.directoryId;
  try {
    await client.getManagementGroup(tenantId);
  } catch (err) {
    context.logger.publishEvent({
      name: 'mgmt_group_auth_error',
      description: `Error validating call to fetch the Tenant Root Management Group (https://management.azure.com/providers/Microsoft.Management/managementGroups/${tenantId}). Please grant the "Managemnt Group Reader" role on the Tenant Root Group in order to fetch management group entities/relationships.`,
    });
    throw new IntegrationProviderAuthorizationError({
      cause: err,
      status: err.status || err.code,
      statusText: err.statusText || err.message,
      endpoint: `https://management.azure.com/providers/Microsoft.Management/managementGroups/${tenantId}`,
    });
  }
}

export async function getGraphObjectsForManagementGroup(options: {
  managementGroupId: string;
  client: ManagementGroupClient;
  executionContext: IntegrationStepContext;
  webLinker: AzureWebLinker;
}) {
  const { client, managementGroupId, executionContext, webLinker } = options;
  const { jobState, logger } = executionContext;
  const managementGroup = await client.getManagementGroup(managementGroupId);

  const managementGroupEntity = await jobState.addEntity(
    createManagementGroupEntity(webLinker, managementGroup),
  );

  for (const child of managementGroup.children || []) {
    if (child.type === '/providers/Microsoft.Management/managementGroups') {
      const {
        managementGroupEntity: childManagementGroupEntity,
      } = await getGraphObjectsForManagementGroup({
        ...options,
        managementGroupId: child.name!,
      });
      await jobState.addRelationship(
        createDirectRelationship({
          from: managementGroupEntity,
          _class: RelationshipClass.CONTAINS,
          to: childManagementGroupEntity,
        }),
      );
    } else if (child.type === '/subscriptions') {
      await jobState.addRelationship(
        createMappedRelationship({
          _class: RelationshipClass.HAS,
          _mapping: {
            sourceEntityKey: managementGroupEntity._key,
            relationshipDirection: RelationshipDirection.FORWARD,
            targetFilterKeys: [['_type', 'id']],
            targetEntity: {
              _type: SubscriptionEntities.SUBSCRIPTION._type,
              id: child.id,
              name: child.name,
              displayName: child.displayName,
            },
          },
        }),
      );
    } else {
      logger.warn(
        {
          managementGroupId: managementGroup.id,
          childId: child.id,
          childType: child.type,
        },
        'Unrecognized value for `type` on management group child.',
      );
    }
  }

  return { managementGroup, managementGroupEntity };
}

export const managementGroupSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: steps.MANAGEMENT_GROUPS,
    name: 'Management Groups',
    entities: [entities.MANAGEMENT_GROUP],
    relationships: [
      relationships.ACCOUNT_CONTAINS_ROOT_MANAGEMENT_GROUP,
      relationships.MANAGEMENT_GROUP_CONTAINS_MANAGEMENT_GROUP,
    ], // TODO add support for mapped relationship documentation
    dependsOn: [STEP_AD_ACCOUNT],
    executionHandler: fetchManagementGroups,
  },
];
