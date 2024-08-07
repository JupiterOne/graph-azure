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
  IntegrationMissingKeyError,
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
import {
  SetDataTypes,
  entities,
  setDataKeys,
  steps as subscriptionSteps,
} from '../subscriptions/constants';
import {
  createClusterEntity,
  createMaintenanceConfigurationsEntity,
  createAccessRoleEntity,
  createKubernetesServiceEntity,
  getKubernetesServiceKey,
  createRoleBindingEntity,
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
    const clusterEntity = createClusterEntity(logger, webLinker, cluster);
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

export async function fetchRoleBindings(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ContainerServicesClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: ContainerServicesEntities.KUBERNETES_CLUSTER._type },
    async (clusterEntity) => {
      await client.iterateRoleBindings(
        instance.config,
        clusterEntity as unknown as { name: string; id: string },
        async (rolebinding) => {
          const rolebindingEntity = createRoleBindingEntity(
            logger,
            webLinker,
            rolebinding,
          );
          if (!jobState.hasKey(rolebindingEntity._key)) {
            await jobState.addEntity(rolebindingEntity);
          }
          const relationship = createMappedRelationship({
            _key: generateRelationshipKey(rolebindingEntity._key),
            _type:
              ContainerServiceMappedRelationships
                .ROLE_BINDING_IS_KUBERNETES_CLUSTER_ROLE_BINDING._type,
            _class: RelationshipClass.IS,
            _mapping: {
              sourceEntityKey: rolebindingEntity._key,
              relationshipDirection: RelationshipDirection.FORWARD,
              targetEntity: {
                _key: `ClusterRoleBinding:${rolebindingEntity._key}`,
                _class: 'AccessPolicy',
                _type: 'kube_cluster_role_binding',
              },
              targetFilterKeys: [['_key', '_class', '_type']],
              skipTargetCreation: true,
            },
          });
          if (
            !jobState.hasKey(generateRelationshipKey(rolebindingEntity._key))
          ) {
            await jobState.addRelationship(relationship);
          }
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
  const locationsMap: SetDataTypes['locationNameMap'] | undefined =
    await jobState.getData<SetDataTypes['locationNameMap']>(
      setDataKeys.locationNameMap,
    );

  await client.iterateAccessRoles(
    instance.config,
    locationsMap ? Object.keys(locationsMap) : undefined,
    logger,
    async (accessRole, locationName) => {
      const accessRoleEntity = createAccessRoleEntity(
        webLinker,
        accessRole,
        locationName,
      );
      await jobState.addEntity(accessRoleEntity);

      const relationship = createMappedRelationship({
        _key: generateRelationshipKey(accessRoleEntity._key),
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
          targetFilterKeys: [['_key', '_class', '_type']],
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
  const serviceEntity = await jobState.addEntity(
    createKubernetesServiceEntity(instance),
  );

  await jobState.iterateEntities(
    { _type: entities.SUBSCRIPTION._type },
    async (subscription) => {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: subscription,
          to: serviceEntity,
        }),
      );
    },
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

export async function buildKubernetesClusterRoleBindingRelationship(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState } = executionContext;
  await jobState.iterateEntities(
    { _type: Entities.ROLE_BINDING._type },
    async (rolebindingEntity) => {
      // Extract substring till the desired part
      const kubernetesClusterEntityKey = rolebindingEntity._key.substring(
        0,
        rolebindingEntity._key.lastIndexOf('/trustedAccessRoleBindings'),
      );
      if (jobState.hasKey(kubernetesClusterEntityKey)) {
        // Check if the kubernetesClusterEntityKey exists
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.CONTAINS,
            fromKey: kubernetesClusterEntityKey,
            fromType: ContainerServicesEntities.KUBERNETES_CLUSTER._type,
            toKey: rolebindingEntity._key,
            toType: Entities.ROLE_BINDING._type,
          }),
        );
      } else {
        throw new IntegrationMissingKeyError(
          `Build Kubernetes Cluster and Role Binding Relationship: ${kubernetesClusterEntityKey} Missing.`,
        );
      }
    },
  );
}

function generateRelationshipKey(entityKey: string): string {
  return `${entityKey}|IS|ClusterRole:${entityKey}`;
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
    ingestionSourceId: INGESTION_SOURCE_IDS.CONTAINER_SERVICES_EXTRAS,
  },
  {
    id: Steps.KUBERNETES_SERVICE,
    name: 'Kubernetes Service',
    entities: [Entities.KUBERNETES_SERVICE],
    relationships: [Relationships.AZURE_SUBSCRIPTION_HAS_KUBERNETES_SERVICE],
    dependsOn: [
      subscriptionSteps.SUBSCRIPTION,
      STEP_AD_ACCOUNT,
      STEP_RM_CONTAINER_SERVICES_CLUSTERS,
    ],
    executionHandler: kubernetesService,
    ingestionSourceId: INGESTION_SOURCE_IDS.CONTAINER_SERVICES_EXTRAS,
  },
  {
    id: Steps.ACCESS_ROLE,
    name: 'Fetch Trusted Access Roles',
    entities: [Entities.ACCESS_ROLE],
    relationships: [],
    mappedRelationships: [
      ContainerServiceMappedRelationships.TRUSTED_ACCESS_ROLE_IS_KUBERNETES_CLUSTER,
    ],
    dependsOn: [
      STEP_AD_ACCOUNT,
      STEP_RM_CONTAINER_SERVICES_CLUSTERS,
      subscriptionSteps.LOCATIONS,
    ],
    rolePermissions: [
      'Microsoft.ContainerService/managedClusters/trustedAccessRoleBindings/read',
    ],
    executionHandler: fetchAccessRoles,
    ingestionSourceId: INGESTION_SOURCE_IDS.CONTAINER_SERVICES_EXTRAS,
  },
  {
    id: Steps.ROLE_BINDING,
    name: 'Fetch Role Bindings',
    entities: [Entities.ROLE_BINDING],
    relationships: [
      ContainerServiceMappedRelationships.ROLE_BINDING_IS_KUBERNETES_CLUSTER_ROLE_BINDING,
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_CONTAINER_SERVICES_CLUSTERS],
    executionHandler: fetchRoleBindings,
    ingestionSourceId: INGESTION_SOURCE_IDS.CONTAINER_SERVICES_EXTRAS,
  },
  {
    id: Steps.KUBERNETES_SERVICE_CONTAINS_ACCESS_ROLE,
    name: 'Kubernetes Service Contains Access Role Relationship',
    entities: [],
    relationships: [Relationships.KUBERNETES_SERVICE_CONTAINS_ACCESS_ROLE],
    dependsOn: [Steps.ACCESS_ROLE, Steps.KUBERNETES_SERVICE],
    executionHandler: buildKubernetesAccessRoleRelationship,
    ingestionSourceId: INGESTION_SOURCE_IDS.CONTAINER_SERVICES_EXTRAS,
  },
  {
    id: Steps.MANAGED_CLUSTER_CONTAINS_ROLE_BINDING,
    name: 'Kubernetes Service Contains Role Binding',
    entities: [],
    relationships: [Relationships.MANAGED_CLUSTER_CONTAINS_ROLE_BINDING],
    dependsOn: [STEP_RM_CONTAINER_SERVICES_CLUSTERS, Steps.ROLE_BINDING],
    executionHandler: buildKubernetesClusterRoleBindingRelationship,
    ingestionSourceId: INGESTION_SOURCE_IDS.CONTAINER_SERVICES_EXTRAS,
  },
];
