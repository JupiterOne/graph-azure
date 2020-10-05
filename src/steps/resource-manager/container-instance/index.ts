import {
  Entity,
  Step,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { ACCOUNT_ENTITY_TYPE, STEP_AD_ACCOUNT } from '../../active-directory';
import { createAzureWebLinker } from '../../../azure';
import {
  RESOURCE_GROUP_ENTITY,
  STEP_RM_RESOURCES_RESOURCE_GROUPS,
} from '../resources';
import createResourceGroupResourceRelationship from '../utils/createResourceGroupResourceRelationship';
import { ContainerInstanceClient } from './client';
import {
  createContainerGroupEntity,
  createContainerEntity,
  createVolumeEntity,
} from './converters';
import {
  ContainerInstanceEntities,
  ContainerInstanceRelationships,
  STEP_RM_CONTAINER_GROUPS,
} from './contants';
export * from './contants';

export async function fetchContainerGroups(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ContainerInstanceClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: RESOURCE_GROUP_ENTITY._type },
    async (resourceGroupEntity) => {
      const { name } = resourceGroupEntity;

      await client.iterateContainerGroups(
        { resourceGroupName: name as string },
        async (containerGroup) => {
          const { id } = containerGroup;

          const containerGroupEntity = createContainerGroupEntity(
            webLinker,
            containerGroup,
          );

          await jobState.addEntity(containerGroupEntity);
          await jobState.addRelationship(
            await createResourceGroupResourceRelationship(
              executionContext,
              containerGroupEntity,
            ),
          );

          /**
           * NOTE: There is not call/function in the Container Instance Management Client to get volumes by container group.
           * Instead, volumes are returned in an array on the container group.
           * Iterating over them in memory shouldn't cause an issues, because there is a limit set at 20 volumes per container group.
           * https://docs.microsoft.com/en-us/azure/container-instances/container-instances-quotas
           */
          containerGroup.volumes?.forEach(async (volume) => {
            // NOTE: Volumes do not have ids. We create our own by using the id of the resource group and pre-pending it to the volume name.
            // The result should look something like `subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.ContainerInstance/containerGroups/${containerGroup}/volumes/${volumeName}
            const volumeEntity = createVolumeEntity({
              id: `${id}/volumes/${volume.name}`,
              ...volume,
            });

            await jobState.addEntity(volumeEntity);
            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.HAS,
                from: containerGroupEntity,
                to: volumeEntity,
              }),
            );
          });

          /**
           * NOTE: There is not call/function in the Container Instance Management Client to get containers by container group.
           * Instead, containers are returned in an array on the container group.
           * Iterating over them in memory shouldn't cause an issue, because there is a limit set at 60 containers per container group.
           * https://docs.microsoft.com/en-us/azure/container-instances/container-instances-quotas
           */
          containerGroup.containers.forEach(async (container) => {
            /**
             * NOTE: Containers in Azure Container Groups do not have an id. We are creating one by adding /containers/${containerName} at the end of the Azure Container Group Id
             * The result should look like /subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.ContainerInstance/containerGroups/${containerGroup}/containers/${containerName}
             */
            const containerEntity = createContainerEntity({
              id: `${id}/containers/${container.name}`,
              ...container,
            });

            await jobState.addEntity(containerEntity);
            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.HAS,
                from: containerGroupEntity,
                to: containerEntity,
              }),
            );

            /**
             * NOTE: If the Container is connected to a Volume via a volumeMount,
             * we want to record that relationship.
             */
            container.volumeMounts?.forEach(async (volumeMount) => {
              const volumeKey = `${id}/volumes/${volumeMount.name}`;
              // Find the previously tracked volume so that we can record a relationship between the container and the volume
              const connectedVolumeEntity = await jobState.findEntity(
                volumeKey,
              );

              if (connectedVolumeEntity) {
                await jobState.addRelationship(
                  createDirectRelationship({
                    _class: RelationshipClass.USES,
                    from: containerEntity,
                    to: connectedVolumeEntity,
                    properties: volumeMount,
                  }),
                );
              }
            });
          });
        },
      );
    },
  );
}

export const containerInstanceSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: STEP_RM_CONTAINER_GROUPS,
    name: 'Container Groups',
    entities: [
      ContainerInstanceEntities.CONTAINER_GROUP,
      ContainerInstanceEntities.CONTAINER,
      ContainerInstanceEntities.CONTAINER_VOLUME,
    ],
    relationships: [
      ContainerInstanceRelationships.RESOURCE_GROUP_HAS_CONTAINER_GROUP,
      ContainerInstanceRelationships.CONTAINER_GROUP_HAS_CONTAINER,
      ContainerInstanceRelationships.CONTAINER_GROUP_HAS_CONTAINER_VOLUME,
      ContainerInstanceRelationships.CONTAINER_USES_CONTAINER_VOLUME,
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchContainerGroups,
  },
];
