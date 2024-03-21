import {
  IntegrationMissingKeyError,
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import { INGESTION_SOURCE_IDS } from '../../../constants';
import { AzureIntegrationStep, IntegrationStepContext } from '../../../types';
import {
  NetworkEntities,
  STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES,
  STEP_RM_NETWORK_VIRTUAL_NETWORKS,
} from '../network/constants';
import { Ddos } from './client';
import { DdosEntities, DdosRelationships, DdosSteps } from './constant';
import {
  createProtectionPlanEntity,
  getDdosProtectionPlanKey,
} from './converter';
import { entities } from '../subscriptions/constants';
import {
  RESOURCE_GROUP_ENTITY,
  STEP_RM_RESOURCES_RESOURCE_GROUPS,
} from '../resources/constants';

export async function fetchProtectionPlans(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new Ddos(instance.config, logger);

  // if subscription id is not present integartion will throw error while validating config
  const subscriptionKey = `/subscriptions/${instance.config.subscriptionId}`;

  await client.iterateDdosProtectionPlan(async (protection_plan) => {
    const protectionPlanEntity = createProtectionPlanEntity(protection_plan);
    await jobState.addEntity(protectionPlanEntity);

    const protectionPlanKey = getDdosProtectionPlanKey(protectionPlanEntity.id);

    // add subscription and Ddos Protection plan relationship
    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        fromKey: subscriptionKey,
        fromType: entities.SUBSCRIPTION._type,
        toKey: protectionPlanKey,
        toType: DdosEntities.PROTECTION_PLAN._type,
      }),
    );
  });
}

export async function buildProtectionPlanPublicIpRelationship(
  executionContext: IntegrationStepContext,
) {
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: DdosEntities.PROTECTION_PLAN._type },
    async (ddosProtectionPlanEntity) => {
      const publicIPAddresses: string[] =
        ddosProtectionPlanEntity.publicIPAddresses as string[];
      if (!publicIPAddresses) return;
      for (const publicIpAddress of publicIPAddresses) {
        if (publicIpAddress) {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.ASSIGNED,
              fromKey: ddosProtectionPlanEntity._key,
              fromType: DdosEntities.PROTECTION_PLAN._type,
              toKey: publicIpAddress,
              toType: NetworkEntities.PUBLIC_IP_ADDRESS._type,
            }),
          );
        }
      }
    },
  );
}

export async function buildProtectionPlanVnetRelationship(
  executionContext: IntegrationStepContext,
) {
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: DdosEntities.PROTECTION_PLAN._type },
    async (ddosProtectionPlanEntity) => {
      const virtualNetworks: string[] =
        ddosProtectionPlanEntity.virtualNetworks as string[];

      if (!virtualNetworks) return;
      for (const vnet of virtualNetworks) {
        if (vnet) {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.ASSIGNED,
              fromKey: ddosProtectionPlanEntity._key,
              fromType: DdosEntities.PROTECTION_PLAN._type,
              toKey: vnet,
              toType: NetworkEntities.VIRTUAL_NETWORK._type,
            }),
          );
        }
      }
    },
  );
}

export async function buildResourceGroupProtectionPlanRelationship(
  executionContext: IntegrationStepContext,
) {
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: DdosEntities.PROTECTION_PLAN._type },
    async (ddosProtectionPlanEntity) => {
      const ddosProtectionPlanKey = ddosProtectionPlanEntity._key;

      const protectionPlanpath = ddosProtectionPlanKey.split(':')[1];
      const resourceGroupKey = protectionPlanpath
        .split('/')
        .slice(0, 5)
        .join('/');

      if (!resourceGroupKey) {
        throw new IntegrationMissingKeyError(
          `Resource Group Key Missing ${resourceGroupKey}`,
        );
      }
      // build relationship
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: resourceGroupKey,
          fromType: RESOURCE_GROUP_ENTITY._type,
          toKey: ddosProtectionPlanKey,
          toType: DdosEntities.PROTECTION_PLAN._type,
        }),
      );
    },
  );
}

export const DdosServiceSteps: AzureIntegrationStep[] = [
  {
    id: DdosSteps.PROTECTION_PLAN,
    name: 'Fetch Ddos Protection Plan',
    entities: [DdosEntities.PROTECTION_PLAN],
    relationships: [DdosRelationships.SUBSCRIPTION_HAS_PROTECTION_PLAN],
    dependsOn: [],
    executionHandler: fetchProtectionPlans,
    rolePermissions: ['Microsoft.Network/ddosProtectionPlans/read'],
    ingestionSourceId: INGESTION_SOURCE_IDS.DDOS,
  },
  {
    id: DdosSteps.DDOS_PROTECTION_PLAN_PUBLIC_IP_RELATIONSHIP,
    name: 'Build Ddos Protection Plan Public Ip Relationship',
    entities: [],
    relationships: [DdosRelationships.DDOS_PROTECTION_PLAN_ASSIGNED_PUBLIC_IP],
    dependsOn: [DdosSteps.PROTECTION_PLAN, STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES],
    executionHandler: buildProtectionPlanPublicIpRelationship,
    rolePermissions: [],
    ingestionSourceId: INGESTION_SOURCE_IDS.DDOS,
  },
  {
    id: DdosSteps.DDOS_PROTECTION_PLAN_VNET_RELATIONSHIP,
    name: 'Build Ddos Protection Plan Vnet Relationship',
    entities: [],
    relationships: [DdosRelationships.DDOS_PROTECTION_PLAN_ASSIGNED_VNET],
    dependsOn: [DdosSteps.PROTECTION_PLAN, STEP_RM_NETWORK_VIRTUAL_NETWORKS],
    executionHandler: buildProtectionPlanVnetRelationship,
    rolePermissions: [],
    ingestionSourceId: INGESTION_SOURCE_IDS.DDOS,
  },
  {
    id: DdosSteps.RESOURCE_GROUPS_DDOS_PROTECTION_PLAN_RELATIONSHIP,
    name: 'Build Resource Group Ddos Protection Plan Relationship',
    entities: [],
    relationships: [DdosRelationships.RESOURCE_GROUP_HAS_PROTECTION_PLAN],
    dependsOn: [DdosSteps.PROTECTION_PLAN, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: buildResourceGroupProtectionPlanRelationship,
    rolePermissions: [],
    ingestionSourceId: INGESTION_SOURCE_IDS.DDOS,
  },
];
