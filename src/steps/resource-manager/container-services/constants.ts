import { createResourceGroupResourceRelationshipMetadata } from '../utils/createResourceGroupResourceRelationship';

export const STEP_RM_CONTAINER_SERVICES_CLUSTERS =
  'rm-container-services-clusters';

export const ContainerServicesEntities = {
  KUBERNETES_CLUSTER: {
    _type: 'azure_kubernetes_cluster',
    _class: ['Cluster'],
    resourceName: '[RM] Azure Kubernetes Cluster',
  },
};

export const ContainerServicesRelationships = {
  RESOURCE_GROUP_HAS_SERVICE: createResourceGroupResourceRelationshipMetadata(
    ContainerServicesEntities.KUBERNETES_CLUSTER._type,
  ),
};
