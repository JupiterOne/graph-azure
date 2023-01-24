import { createAzureWebLinker } from '../../../azure';
import { AzureIntegrationStep, IntegrationStepContext } from '../../../types';
import { getAccountEntity } from '../../active-directory';
import { STEP_AD_ACCOUNT } from '../../active-directory/constants';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources/constants';
import createResourceGroupResourceRelationship from '../utils/createResourceGroupResourceRelationship';
import { ContainerServicesClient } from './client';
import {
  ContainerServicesEntities,
  ContainerServicesRelationships,
  STEP_RM_CONTAINER_SERVICES_CLUSTERS,
} from './constants';
import { createClusterEntitiy } from './converters';

export async function fetchClusters(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ContainerServicesClient(instance.config, logger);

  await client.iterateClusters(async (cluster) => {
    const clusterEntity = createClusterEntitiy(webLinker, cluster);
    await jobState.addEntity(clusterEntity);

    await createResourceGroupResourceRelationship(
      executionContext,
      clusterEntity,
    );
  });
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
  },
];
