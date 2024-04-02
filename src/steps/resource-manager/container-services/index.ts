import { createAzureWebLinker } from '../../../azure';
import { INGESTION_SOURCE_IDS } from '../../../constants';
import { AzureIntegrationStep, IntegrationStepContext } from '../../../types';
import { getAccountEntity } from '../../active-directory';
import { STEP_AD_ACCOUNT } from '../../active-directory/constants';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources/constants';
import { ContainerServicesClient } from './client';
import {
  createDirectRelationship,
  createMappedRelationship,
  RelationshipClass,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import {
  ContainerServicesEntities,
  ContainerServicesRelationships,
  STEP_RM_CONTAINER_SERVICES_CLUSTERS,
  Steps,
  Entities,
  Relationships,
  ContainerServiceMappedRelationships,
} from './constants';
import { entities } from '../subscriptions/constants';
import {
  createClusterEntity,
  createMaintenanceConfigurationsEntity,
  createAccessRoleEntity,
  createKubernetesServiceEntity,
  getKubernetesServiceKey,
} from './converters';
import createResourceGroupResourceRelationship from '../utils/createResourceGroupResourceRelationship';

export async function fetchClusters(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ContainerServicesClient(instance.config, logger);

  await client.iterateClusters(instance.config, async (cluster) => {
    const clusterEntity = createClusterEntity(webLinker, cluster);
    await jobState.addEntity(clusterEntity);

    await createResourceGroupResourceRelationship(
      executionContext,
      clusterEntity,
    );
  });
}

export async function fetchMaintenanceConfigurations(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ContainerServicesClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: ContainerServicesEntities.KUBERNETES_CLUSTER._type },
    async (clusterEntity) => {
      await client.iterateMaintenanceConfigurations(
        instance.config,
        clusterEntity as unknown as { name: string; id: string },
        async (maintenanceConfig) => {
          const maintenanceConfigEntity = createMaintenanceConfigurationsEntity(
            webLinker,
            maintenanceConfig,
          );
          await jobState.addEntity(maintenanceConfigEntity);
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: clusterEntity,
              to: maintenanceConfigEntity,
            }),
          );
        },
      );
    },
  );
}

export async function fetchAccessRoles(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ContainerServicesClient(instance.config, logger);

  await client.iterateAccessRoles(
    instance.config,
    logger,
    async (accessRole, locationName) => {
      const accessRoleEntity = createAccessRoleEntity(
        webLinker,
        accessRole,
        locationName,
      );
      await jobState.addEntity(accessRoleEntity);

      const relationship = createMappedRelationship({
        _key: `${accessRoleEntity._key}|IS|ClusterRole:${accessRoleEntity._key}`,
        _type:
          ContainerServiceMappedRelationships
            .TRUSTED_ACCESS_ROLE_IS_KUBERNETES_CLUSTER._type,
        _class: RelationshipClass.IS,
        _mapping: {
          sourceEntityKey: accessRoleEntity._key,
          relationshipDirection: RelationshipDirection.FORWARD,
          targetEntity: {
            _key: `ClusterRole:${accessRoleEntity._key}`,
            _class: 'AccessRole',
            _type: 'kube_cluster_role',
          },
          targetFilterKeys: [['_class', '_type']],
          skipTargetCreation: true,
        },
      });
      await jobState.addRelationship(relationship);
    },
  );
}
export async function kubernetesService(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, jobState } = executionContext;
  await jobState.addEntity(createKubernetesServiceEntity(instance));

  const subscriptionKey = `/subscriptions/${instance.config.subscriptionId}`;

  const kubernetesServiceKey = getKubernetesServiceKey(instance.id);
  await jobState.addRelationship(
    createDirectRelationship({
      _class: RelationshipClass.HAS,
      fromKey: subscriptionKey,
      fromType: entities.SUBSCRIPTION._type,
      toKey: kubernetesServiceKey,
      toType: Entities.KUBERNETES_SERVICE._type,
    }),
  );
}

export async function buildKubernetesAccessRoleRelationship(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, jobState } = executionContext;
  await jobState.iterateEntities(
    { _type: Entities.ACCESS_ROLE._type },
    async (accessRoleEntity) => {
      const kubernetesServiceKey = getKubernetesServiceKey(instance.id);
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.CONTAINS,
          fromKey: kubernetesServiceKey,
          fromType: Entities.KUBERNETES_SERVICE._type,
          toKey: accessRoleEntity._key,
          toType: Entities.ACCESS_ROLE._type,
        }),
      );
    },
  );
}

export const containerServicesSteps: AzureIntegrationStep[] = [
  {
    id: STEP_RM_CONTAINER_SERVICES_CLUSTERS,
    name: 'Fetch Container Services Clusters',
    entities: [ContainerServicesEntities.KUBERNETES_CLUSTER],
    relationships: [ContainerServicesRelationships.RESOURCE_GROUP_HAS_SERVICE],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchClusters,
    rolePermissions: ['Microsoft.ContainerService/managedClusters/read'],
    ingestionSourceId: INGESTION_SOURCE_IDS.CONTAINER_SERVICES,
  },
  {
    id: Steps.MAINTENANCE_CONFIGURATION,
    name: 'Fetch Container Maintenance Configurations',
    entities: [Entities.MAINTENANCE_CONFIGURATION],
    relationships: [
      Relationships.MANAGED_CLUSTER_HAS_MAINTENANCE_CONFIGURATION,
    ],
    dependsOn: [
      STEP_RM_CONTAINER_SERVICES_CLUSTERS,
      STEP_RM_RESOURCES_RESOURCE_GROUPS,
    ],
    rolePermissions: [
      'Microsoft.ContainerService/managedClusters/maintenanceConfigurations/read',
    ],
    executionHandler: fetchMaintenanceConfigurations,
  },
  {
    id: Steps.KUBERNETES_SERVICE,
    name: 'Kubernetes Service',
    entities: [Entities.KUBERNETES_SERVICE],
    relationships: [Relationships.AZURE_SUBSCRIPTION_HAS_KUBERNETES_SERVICE],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_CONTAINER_SERVICES_CLUSTERS],
    executionHandler: kubernetesService,
  },
  {
    id: Steps.ACCESS_ROLE,
    name: 'Fetch Trusted Access Roles',
    entities: [Entities.ACCESS_ROLE],
    relationships: [
      ContainerServiceMappedRelationships.TRUSTED_ACCESS_ROLE_IS_KUBERNETES_CLUSTER,
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_CONTAINER_SERVICES_CLUSTERS],
    executionHandler: fetchAccessRoles,
  },
  {
    id: Steps.KUBERNETES_SERVICE_CONTAINS_ACCESS_ROLE,
    name: 'Kubernetes Service Contains Access Role Relationship',
    entities: [],
    relationships: [Relationships.KUBERNETES_SERVICE_CONTAINS_ACCESS_ROLE],
    dependsOn: [Steps.ACCESS_ROLE, Steps.KUBERNETES_SERVICE],
    executionHandler: buildKubernetesAccessRoleRelationship,
  },
];
