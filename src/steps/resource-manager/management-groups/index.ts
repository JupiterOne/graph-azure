import {
  createDirectRelationship,
  RelationshipClass,
  createMappedRelationship,
  RelationshipDirection,
  IntegrationExecutionContext,
  IntegrationWarnEventName,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker, createAzureWebLinker } from '../../../azure';
import {
  IntegrationStepContext,
  IntegrationConfig,
  AzureIntegrationStep,
} from '../../../types';
import { getAccountEntity } from '../../active-directory';
import { STEP_AD_ACCOUNT } from '../../active-directory/constants';
import { ManagementGroupClient } from './client';
import {
  ManagementGroupEntities,
  ManagementGroupMappedRelationships,
  ManagementGroupRelationships,
  ManagementGroupSteps,
} from './constants';
import { entities as SubscriptionEntities } from '../subscriptions/constants';
import { createManagementGroupEntity } from './converters';
import { INGESTION_SOURCE_IDS } from '../../../constants';
import { KnownManagementGroupChildType } from '@azure/arm-managementgroups';

export async function fetchManagementGroups(
  executionContext: IntegrationStepContext,
): Promise<void> {
  if (!(await validateManagementGroupStepInvocation(executionContext))) {
    return;
  }

  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ManagementGroupClient(instance.config, logger);

  const { managementGroupEntity: tenantRootManagementGroupEntity } =
    await getGraphObjectsForManagementGroup({
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
): Promise<boolean> {
  const client = new ManagementGroupClient(
    context.instance.config,
    context.logger,
  );
  const tenantId = context.instance.config.directoryId;
  try {
    await client.getManagementGroup(tenantId);
    return true;
  } catch (err) {
    context.logger.publishWarnEvent({
      name: IntegrationWarnEventName.MissingPermission,
      description: `Error validating call to fetch the Tenant Root Management Group (https://management.azure.com/providers/Microsoft.Management/managementGroups/${tenantId}). Please grant the "Management Group Reader" role on the Tenant Root Group in order to fetch management group entities/relationships.`,
    });
    return false;
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
    if (
      child.type ===
      KnownManagementGroupChildType.MicrosoftManagementManagementGroups
    ) {
      const { managementGroupEntity: childManagementGroupEntity } =
        await getGraphObjectsForManagementGroup({
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
    } else if (child.type === KnownManagementGroupChildType.Subscriptions) {
      await jobState.addRelationship(
        createMappedRelationship({
          _class: RelationshipClass.HAS,
          _mapping: {
            sourceEntityKey: managementGroupEntity._key,
            relationshipDirection: RelationshipDirection.FORWARD,
            targetFilterKeys: [['id']],
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

export const managementGroupSteps: AzureIntegrationStep[] = [
  {
    id: ManagementGroupSteps.MANAGEMENT_GROUPS,
    name: 'Management Groups',
    entities: [ManagementGroupEntities.MANAGEMENT_GROUP],
    relationships: [
      ManagementGroupRelationships.ACCOUNT_HAS_ROOT_MANAGEMENT_GROUP,
      ManagementGroupRelationships.MANAGEMENT_GROUP_CONTAINS_MANAGEMENT_GROUP,
    ],
    mappedRelationships: [
      ManagementGroupMappedRelationships.MANAGEMENT_GROUP_HAS_SUBSCRIPTION,
    ],
    dependsOn: [STEP_AD_ACCOUNT],
    executionHandler: fetchManagementGroups,
    rolePermissions: ['Microsoft.Management/managementGroups/read'],
    ingestionSourceId: INGESTION_SOURCE_IDS.MANAGEMENT_GROUPS,
  },
];
