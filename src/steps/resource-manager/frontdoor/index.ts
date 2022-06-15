import { FrontDoor } from '@azure/arm-frontdoor/esm/models';
import {
  createDirectRelationship,
  getRawData,
  IntegrationStepExecutionContext,
  RelationshipClass,
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
import {
  createBackendPoolEntity,
  createFrontDoorEntity,
  createFrontendEndpointEntity,
  createRoutingRuleEntity,
  createRulesEngineEntity,
} from './converters';

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

async function fetchRulesEngines(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  await jobState.iterateEntities(
    { _type: FrontDoorEntities.FRONTDOOR._type },
    async (frontdoorEntity) => {
      const frontdoor = getRawData<FrontDoor>(frontdoorEntity);
      if (!frontdoor) return;

      for (const rulesEngine of frontdoor.rulesEngines || []) {
        const rulesEngineEntity = await jobState.addEntity(
          createRulesEngineEntity(webLinker, rulesEngine),
        );
        await jobState.addRelationship(
          createDirectRelationship({
            from: frontdoorEntity,
            _class: RelationshipClass.HAS,
            to: rulesEngineEntity,
          }),
        );
      }
    },
  );
}

async function fetchRoutingRules(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  await jobState.iterateEntities(
    { _type: FrontDoorEntities.FRONTDOOR._type },
    async (frontdoorEntity) => {
      const frontdoor = getRawData<FrontDoor>(frontdoorEntity);
      if (!frontdoor) return;

      for (const routingRule of frontdoor.routingRules || []) {
        const routingRuleEntity = await jobState.addEntity(
          createRoutingRuleEntity(webLinker, routingRule),
        );
        await jobState.addRelationship(
          createDirectRelationship({
            from: frontdoorEntity,
            _class: RelationshipClass.HAS,
            to: routingRuleEntity,
          }),
        );
      }
    },
  );
}

async function fetchBackendPools(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  await jobState.iterateEntities(
    { _type: FrontDoorEntities.FRONTDOOR._type },
    async (frontdoorEntity) => {
      const frontdoor = getRawData<FrontDoor>(frontdoorEntity);
      if (!frontdoor) return;

      for (const backendPool of frontdoor.backendPools || []) {
        const backendPoolEntity = await jobState.addEntity(
          createBackendPoolEntity(webLinker, backendPool),
        );
        await jobState.addRelationship(
          createDirectRelationship({
            from: frontdoorEntity,
            _class: RelationshipClass.HAS,
            to: backendPoolEntity,
          }),
        );
      }
    },
  );
}

async function fetchFrontendEndpoints(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  await jobState.iterateEntities(
    { _type: FrontDoorEntities.FRONTDOOR._type },
    async (frontdoorEntity) => {
      const frontdoor = getRawData<FrontDoor>(frontdoorEntity);
      if (!frontdoor) return;

      for (const frontendEndpoint of frontdoor.frontendEndpoints || []) {
        const frontendEndpointEntity = await jobState.addEntity(
          createFrontendEndpointEntity(webLinker, frontendEndpoint),
        );
        await jobState.addRelationship(
          createDirectRelationship({
            from: frontdoorEntity,
            _class: RelationshipClass.HAS,
            to: frontendEndpointEntity,
          }),
        );
      }
    },
  );
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
  {
    id: FrontDoorStepIds.FETCH_RULES_ENGINES,
    name: 'Fetch Frontdoor Rules Engines',
    entities: [FrontDoorEntities.RULES_ENGINE],
    relationships: [FrontDoorRelationships.FRONTDOOR_HAS_RULES_ENGINE],
    executionHandler: fetchRulesEngines,
    dependsOn: [STEP_AD_ACCOUNT, FrontDoorStepIds.FETCH_FRONTDOORS],
  },
  {
    id: FrontDoorStepIds.FETCH_ROUTING_RULES,
    name: 'Fetch Frontdoor Routing Rules',
    entities: [FrontDoorEntities.ROUTING_RULE],
    relationships: [FrontDoorRelationships.FRONTDOOR_HAS_ROUTING_RULE],
    executionHandler: fetchRoutingRules,
    dependsOn: [STEP_AD_ACCOUNT, FrontDoorStepIds.FETCH_FRONTDOORS],
  },
  {
    id: FrontDoorStepIds.FETCH_BACKEND_POOLS,
    name: 'Fetch Frontdoor Backend Pools',
    entities: [FrontDoorEntities.BACKEND_POOL],
    relationships: [FrontDoorRelationships.FRONTDOOR_HAS_BACKEND_POOL],
    executionHandler: fetchBackendPools,
    dependsOn: [STEP_AD_ACCOUNT, FrontDoorStepIds.FETCH_FRONTDOORS],
  },
  {
    id: FrontDoorStepIds.FETCH_FRONTEND_ENDPOINTS,
    name: 'Fetch Frontdoor Frontend Endpoints',
    entities: [FrontDoorEntities.FRONTEND_ENDPOINT],
    relationships: [FrontDoorRelationships.FRONTDOOR_HAS_FRONTEND_ENDPOINT],
    executionHandler: fetchFrontendEndpoints,
    dependsOn: [STEP_AD_ACCOUNT, FrontDoorStepIds.FETCH_FRONTDOORS],
  },
];
