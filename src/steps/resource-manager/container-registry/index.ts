import {
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, AzureIntegrationStep } from '../../../types';
import { getAccountEntity } from '../../active-directory';
import { STEP_AD_ACCOUNT } from '../../active-directory/constants';
import { J1ContainerRegistryManagementClient } from './client';
import {
  ContainerRegistryEntities,
  ContainerRegistryRelationships,
  STEP_RM_CONTAINER_REGISTRIES,
  STEP_RM_CONTAINER_REGISTRIES_DIAGNOSTIC_SETTINGS,
  STEP_RM_CONTAINER_REGISTRY_WEBHOOKS,
} from './constants';
import {
  createContainerRegistryEntity,
  createContainerRegistryWebhookEntity,
} from './converters';
import createResourceGroupResourceRelationship from '../utils/createResourceGroupResourceRelationship';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources/constants';
import {
  createDiagnosticSettingsEntitiesAndRelationshipsForResource,
  diagnosticSettingsEntitiesForResource,
  getDiagnosticSettingsRelationshipsForResource,
} from '../utils/createDiagnosticSettingsEntitiesAndRelationshipsForResource';
import { INGESTION_SOURCE_IDS } from '../../../constants';
import { steps as storageSteps } from '../storage/constants';

export async function fetchContainerRegistries(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new J1ContainerRegistryManagementClient(
    instance.config,
    logger,
  );

  await client.iterateRegistries(async (registry) => {
    const registryEntity = createContainerRegistryEntity(webLinker, registry);
    await jobState.addEntity(registryEntity);

    await createResourceGroupResourceRelationship(
      executionContext,
      registryEntity,
    );
  });
}

async function fetchContainerRegistriesDiagnosticSettings(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState } = executionContext;
  await jobState.iterateEntities(
    { _type: ContainerRegistryEntities.REGISTRY._type },
    async (registryEntity) => {
      await createDiagnosticSettingsEntitiesAndRelationshipsForResource(
        executionContext,
        registryEntity,
      );
    },
  );
}

export async function fetchContainerRegistryWebhooks(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new J1ContainerRegistryManagementClient(
    instance.config,
    logger,
  );

  await jobState.iterateEntities(
    { _type: ContainerRegistryEntities.REGISTRY._type },
    async (registryEntity) => {
      await client.iterateRegistryWebhooks(
        registryEntity as unknown as { name: string; id: string },
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

export const containerRegistrySteps: AzureIntegrationStep[] = [
  {
    id: STEP_RM_CONTAINER_REGISTRIES,
    name: 'Container Registries',
    entities: [ContainerRegistryEntities.REGISTRY],
    relationships: [ContainerRegistryRelationships.RESOURCE_GROUP_HAS_ZONE],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchContainerRegistries,
    rolePermissions: ['Microsoft.ContainerRegistry/registries/read'],
    ingestionSourceId: INGESTION_SOURCE_IDS.CONTAINER_REGISTRY,
  },
  {
    id: STEP_RM_CONTAINER_REGISTRIES_DIAGNOSTIC_SETTINGS,
    name: 'Container Registries Diagnostic Settings',
    entities: [...diagnosticSettingsEntitiesForResource],
    relationships: [
      ...getDiagnosticSettingsRelationshipsForResource(
        ContainerRegistryEntities.REGISTRY,
      ),
    ],
    dependsOn: [STEP_RM_CONTAINER_REGISTRIES, storageSteps.STORAGE_ACCOUNTS],
    executionHandler: fetchContainerRegistriesDiagnosticSettings,
    rolePermissions: ['Microsoft.Insights/DiagnosticSettings/Read'],
    ingestionSourceId: INGESTION_SOURCE_IDS.CONTAINER_REGISTRY,
  },
  {
    id: STEP_RM_CONTAINER_REGISTRY_WEBHOOKS,
    name: 'Container Registry Webhooks',
    entities: [ContainerRegistryEntities.WEBHOOK],
    relationships: [ContainerRegistryRelationships.REGISTRY_HAS_WEBHOOK],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_CONTAINER_REGISTRIES],
    executionHandler: fetchContainerRegistryWebhooks,
    rolePermissions: ['Microsoft.ContainerRegistry/registries/webhooks/read'],
    ingestionSourceId: INGESTION_SOURCE_IDS.CONTAINER_REGISTRY,
  },
];
