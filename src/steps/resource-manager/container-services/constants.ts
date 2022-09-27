import { createResourceGroupResourceRelationshipMetadata } from '../utils/createResourceGroupResourceRelationship';

export const STEP_RM_CONTAINER_SERVICES_CLUSTERS =
  'rm-container-services-clusters';

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
