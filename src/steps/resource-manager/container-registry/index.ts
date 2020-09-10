import {
  Entity,
  Step,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { ACCOUNT_ENTITY_TYPE, STEP_AD_ACCOUNT } from '../../active-directory';
import { J1ContainerRegistryManagementClient } from './client';
import {
  ContainerRegistryEntities,
  ContainerRegistryRelationships,
  STEP_RM_CONTAINER_REGISTRIES,
  STEP_RM_CONTAINER_REGISTRY_WEBHOOKS,
} from './constants';
import {
  createContainerRegistryEntity,
  createContainerRegistryWebhookEntity,
} from './converters';
import createResourceGroupResourceRelationship from '../utils/createResourceGroupResourceRelationship';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources';
export * from './constants';

export async function fetchContainerRegistries(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new J1ContainerRegistryManagementClient(
    instance.config,
    logger,
  );

  await client.iterateRegistries(async (registry) => {
    const registryEntity = createContainerRegistryEntity(webLinker, registry);
    await jobState.addEntity(registryEntity);

    await jobState.addRelationship(
      await createResourceGroupResourceRelationship(
        executionContext,
        registryEntity,
      ),
    );
  });
}

export async function fetchContainerRegistryWebhooks(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new J1ContainerRegistryManagementClient(
    instance.config,
    logger,
  );

  await jobState.iterateEntities(
    { _type: ContainerRegistryEntities.REGISTRY._type },
    async (registryEntity) => {
      await client.iterateRegistryWebhooks(
        (registryEntity as unknown) as { name: string; id: string },
        async (registryWebhook) => {
          const registryWebhookEntity = createContainerRegistryWebhookEntity(
            webLinker,
            registryWebhook,
          );
          await jobState.addEntity(registryWebhookEntity);

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: registryEntity,
              to: registryWebhookEntity,
            }),
          );
        },
      );
    },
  );
}

export const containerRegistrySteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: STEP_RM_CONTAINER_REGISTRIES,
    name: 'Container Registries',
    entities: [ContainerRegistryEntities.REGISTRY],
    relationships: [ContainerRegistryRelationships.RESOURCE_GROUP_HAS_ZONE],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchContainerRegistries,
  },
  {
    id: STEP_RM_CONTAINER_REGISTRY_WEBHOOKS,
    name: 'Container Registry Webhooks',
    entities: [ContainerRegistryEntities.WEBHOOK],
    relationships: [ContainerRegistryRelationships.REGISTRY_HAS_WEBHOOK],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_CONTAINER_REGISTRIES],
    executionHandler: fetchContainerRegistryWebhooks,
  },
];
