import {
  IntegrationStepExecutionContext,
  Step,
} from '@jupiterone/integration-sdk-core';
import { createAzureWebLinker } from '../../../azure';
import { IntegrationConfig, IntegrationStepContext } from '../../../types';
import { getAccountEntity } from '../../active-directory';
import { STEP_AD_ACCOUNT } from '../../active-directory/constants';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources/constants';
import createResourceGroupResourceRelationship from '../utils/createResourceGroupResourceRelationship';
import { FrontDoorClient } from './client';
import {
  FrontDoorEntities,
  FrontDoorRelationships,
  FrontDoorStepIds,
} from './constants';
import { createFrontDoorEntity } from './converters';

async function fetchFrontDoors(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new FrontDoorClient(instance.config, logger);

  await client.iterateFrontDoors(async (frontDoor) => {
    const frontdoorEntity = await jobState.addEntity(
      createFrontDoorEntity(webLinker, frontDoor),
    );
    await createResourceGroupResourceRelationship(
      executionContext,
      frontdoorEntity,
    );
  });
}

export const frontdoorSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: FrontDoorStepIds.FETCH_FRONTDOORS,
    name: 'Fetch FrontDoors',
    entities: [FrontDoorEntities.FRONTDOOR],
    relationships: [FrontDoorRelationships.RESOURCE_GROUP_HAS_FRONTDOOR],
    executionHandler: fetchFrontDoors,
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
  },
];
