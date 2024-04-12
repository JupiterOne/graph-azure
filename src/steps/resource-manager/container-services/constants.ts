import { createResourceGroupResourceRelationshipMetadata } from '../utils/createResourceGroupResourceRelationship';
import {
  StepEntityMetadata,
  StepRelationshipMetadata,
  RelationshipClass,
  StepMappedRelationshipMetadata,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { entities } from '../subscriptions/constants';

export const STEP_RM_CONTAINER_SERVICES_CLUSTERS =
  'rm-container-services-clusters';

export const STEP_RM_CONTAINER_MAINTENANCE_CONFIGURATION =
  'rm-container-maintenance-configuration';

export const KubernetesServiceEntityProperties = {
  displayName: 'Kubernetes Service',
  name: 'Kubernetes Service',
  category: ['DevOps'],
  function: ['Load Balancing', 'Scaling'],
};

export const ContainerServicesEntities = {
  KUBERNETES_CLUSTER: {
    _type: 'azure_kubernetes_cluster',
    _class: ['Cluster'],
    resourceName: '[RM] Azure Kubernetes Cluster',
    schema: {
      additionalProperties: false,
      properties: {
        _type: { const: 'azure_kubernetes_cluster' },
        _key: { type: 'string' },
        _class: { type: 'array', items: { const: 'Rule' } },
        id: { type: 'string' },
        name: { type: 'string' },
        displayName: { type: 'string' },
        type: { const: 'Microsoft.ContainerService/managedClusters' },
        webLink: { type: 'string' },
        _rawData: { type: 'array', items: { type: 'object' } },
        skuName: { type: 'string' },
        location: { type: 'string' },
        principalId: { type: 'string' },
        tenantId: { type: 'string' },
        provisioningState: { type: 'string' },
        maxAgentPools: { type: 'number' },
        kubernetesVersion: { type: 'string' },
        dnsPrefix: { type: 'string' },
        fqdn: { type: 'string' },
        nodeResourceGroup: { type: 'string' },
        enableRBAC: { type: 'boolean' },
        enablePodSecurityPolicy: { type: 'boolean' },
        disableLocalAccounts: { type: 'boolean' },
      },
    },
  },
};

export const ContainerServicesRelationships = {
  RESOURCE_GROUP_HAS_SERVICE: createResourceGroupResourceRelationshipMetadata(
    ContainerServicesEntities.KUBERNETES_CLUSTER._type,
  ),
};

export const Steps = {
  MAINTENANCE_CONFIGURATION: 'rm-maintenance-configurations',
  ROLE_BINDING: 'rm-role-binding',
  ACCESS_ROLE: 'rm-access-role',
  KUBERNETES_SERVICE: 'rm-kubernetes-service',
  MANAGED_CLUSTER_HAS_MAINTENANCE_CONFIGURATION:
    'rm-managed-cluster-has-maintenance-configuration-relationship',
  MANAGED_CLUSTER_CONTAINS_ROLE_BINDING:
    'rm-managed-cluster-contains-role-binding',
  KUBERNETES_SERVICE_CONTAINS_ACCESS_ROLE:
    'rm-kubernetes-service-contains-access-role-relationship',
  AZURE_SUBSCRIPTION_HAS_KUBERNETES_SERVICE:
    'rm-azure-subscription-has-kubernetes-service-relationship',
  MANAGED_CLUSTER_IS_KUBE_CLUSTER:
    'rm-managed-cluster-is-kube-cluster-relationship'
};

export const Entities: Record<
  | 'MAINTENANCE_CONFIGURATION'
  | 'ACCESS_ROLE'
  | 'ROLE_BINDING'
  | 'KUBERNETES_SERVICE',
  StepEntityMetadata
> = {
  MAINTENANCE_CONFIGURATION: {
    resourceName: '[RM] Managed Cluster',
    _type: 'azure_kube_maintenance_configuration',
    _class: ['Cluster'],
    schema: {
      properties: {},
      required: [],
    },
  },
  ACCESS_ROLE: {
    resourceName: '[RM] Access Role',
    _type: 'azure_kube_trusted_access_role',
    _class: ['AccessRole'],
    schema: {
      properties: {},
      required: [],
    },
  },
  ROLE_BINDING: {
    resourceName: '[RM] Role Binding',
    _type: 'azure_kube_cluster_role_binding',
    _class: ['AccessPolicy'],
    schema: {
      properties: {},
      required: [],
    },
  },
  KUBERNETES_SERVICE: {
    resourceName: '[RM] Kubernetes Service',
    _type: 'azure_kube_service',
    _class: ['Service'],
    schema: {
      properties: {},
      required: [],
    },
  },
};

export const Relationships: Record<
  | 'MANAGED_CLUSTER_HAS_MAINTENANCE_CONFIGURATION'
  | 'MANAGED_CLUSTER_CONTAINS_ROLE_BINDING'
  | 'KUBERNETES_SERVICE_CONTAINS_ACCESS_ROLE'
  | 'AZURE_SUBSCRIPTION_HAS_KUBERNETES_SERVICE'
  | 'MANAGED_CLUSTER_IS_KUBE_CLUSTER'
  | 'ACCESS_ROLE_IS_KUBE_CLUSTER_ROLE',
  StepRelationshipMetadata
> = {
  MANAGED_CLUSTER_HAS_MAINTENANCE_CONFIGURATION: {
    _type: 'azure_kubernetes_cluster_has_kube_maintenance_configuration',
    sourceType: 'azure_kubernetes_cluster',
    _class: RelationshipClass.HAS,
    targetType: Entities.MAINTENANCE_CONFIGURATION._type,
  },
  MANAGED_CLUSTER_CONTAINS_ROLE_BINDING: {
    _type: 'azure_kubernetes_cluster_contains_kube_cluster_role_binding',
    sourceType: 'azure_kubernetes_cluster',
    _class: RelationshipClass.CONTAINS,
    targetType: Entities.ROLE_BINDING._type,
  },
  KUBERNETES_SERVICE_CONTAINS_ACCESS_ROLE: {
    _type: 'azure_kube_service_contains_trusted_access_role',
    sourceType: Entities.KUBERNETES_SERVICE._type,
    _class: RelationshipClass.CONTAINS,
    targetType: Entities.ACCESS_ROLE._type,
  },
  AZURE_SUBSCRIPTION_HAS_KUBERNETES_SERVICE: {
    _type: 'azure_subscription_has_kube_service',
    sourceType: entities.SUBSCRIPTION._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.KUBERNETES_SERVICE._type,
  },
  MANAGED_CLUSTER_IS_KUBE_CLUSTER: {
    _type: 'kubernetes_service_contains_access_role',
    sourceType: Entities.KUBERNETES_SERVICE._type,
    _class: RelationshipClass.CONTAINS,
    targetType: Entities.ACCESS_ROLE._type,
  },
  ACCESS_ROLE_IS_KUBE_CLUSTER_ROLE: {
    _type: 'kubernetes_service_contains_access_role',
    sourceType: Entities.KUBERNETES_SERVICE._type,
    _class: RelationshipClass.CONTAINS,
    targetType: Entities.ACCESS_ROLE._type,
  },
};



export const ContainerServiceMappedRelationships: Record<
  | 'TRUSTED_ACCESS_ROLE_IS_KUBERNETES_CLUSTER'
  | 'ROLE_BINDING_IS_KUBERNETES_CLUSTER_ROLE_BINDING',
  StepMappedRelationshipMetadata
> = {
  TRUSTED_ACCESS_ROLE_IS_KUBERNETES_CLUSTER: {
    _type: 'azure_kube_trusted_access_role_is_kube_cluster_role',
    sourceType: 'azure_kube_trusted_access_role',
    _class: RelationshipClass.IS,
    targetType: 'kube_cluster_role',
    direction: RelationshipDirection.FORWARD,
  },
  ROLE_BINDING_IS_KUBERNETES_CLUSTER_ROLE_BINDING: {
    _type: 'azure_kube_cluster_role_binding_is_kube_cluster_role_binding',
    sourceType: 'azure_kube_cluster_role_binding',
    _class: RelationshipClass.IS,
    targetType: 'kube_cluster_role_binding',
    direction: RelationshipDirection.FORWARD,
  },
}