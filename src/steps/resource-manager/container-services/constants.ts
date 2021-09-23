import { createResourceGroupResourceRelationshipMetadata } from '../utils/createResourceGroupResourceRelationship';

export const STEP_RM_CONTAINER_SERVICES_CLUSTERS =
  'rm-container-services-clusters';

export const ContainerServicesEntities = {
  SERVICE: {
    _type: 'azure_container_services_cluster',
    _class: ['Cluster'],
    resourceName: '[RM] Container Services Cluster',
  },
};

export const ContainerServicesRelationships = {
  RESOURCE_GROUP_HAS_SERVICE: createResourceGroupResourceRelationshipMetadata(
    ContainerServicesEntities.SERVICE._type,
  ),
};
