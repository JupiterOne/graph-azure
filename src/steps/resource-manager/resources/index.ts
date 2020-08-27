import {
  Entity,
  Step,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { ACCOUNT_ENTITY_TYPE, STEP_AD_ACCOUNT } from '../../active-directory';
import { ResourcesClient } from './client';
import {
  STEP_RM_RESOURCES_RESOURCE_GROUPS,
  RESOURCE_GROUP_ENTITY,
} from './constants';
import { createResourceGroupEntity } from './converters';
export * from './constants';

export async function fetchResourceGroups(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ResourcesClient(instance.config, logger);

  await client.iterateResourceGroups(async (resourceGroup) => {
    const resourceGroupEntity = createResourceGroupEntity(
      webLinker,
      resourceGroup,
    );
    await jobState.addEntity(resourceGroupEntity);
  });
}

export const resourcesSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: STEP_RM_RESOURCES_RESOURCE_GROUPS,
    name: 'Resource Groups',
    entities: [RESOURCE_GROUP_ENTITY],
    relationships: [],
    dependsOn: [STEP_AD_ACCOUNT],
    executionHandler: fetchResourceGroups,
  },
];
