import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, AzureIntegrationStep } from '../../../types';
import { getAccountEntity } from '../../active-directory';
import { STEP_AD_ACCOUNT } from '../../active-directory/constants';
import { ExpressRouteClient } from './client';
import {
  ExpressRouteRelationships,
  ExpressRouteEntities,
  STEP_AZURE_APPLICATION_GATEWAY,
  STEP_AZURE_BGP_SERVICE_COMMUNITIES,
  STEP_AZURE_PEER_EXPRESS_ROUTE_CONNECTION,
  STEP_AZURE_EXPRESS_ROUTE_CIRCUIT,
  STEP_AZURE_EXPRESS_ROUTE,
  STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION,
  STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_RELATION,
  STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION_RELATION,
  STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CROSS_CONNECTION_RELATION,
  STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_APPLICATION_GATEWAY_RELATION,
  STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_PEER_EXPRESS_ROUTE_CONNECTION_RELATION,
  STEP_AZURE_SUBSCRIPTION_HAS_AZURE_BGP_SERVICE_COMMUNITIES_RELATION,
  STEP_AZURE_BGP_SERVICE_COMMUNITIES_HAS_AZURE_EXPRESS_ROUTE_RELATION,
} from './constants';
import {
  createAzureApplicationGatewayEntity,
  createAzureBgpServiceCommunitiesEntity,
  createAzureExpressRouteCircuitConnectionEntity,
  createAzureExpressRouteCircuitEntity,
  createAzureExpressRouteCrossConnectionEntity,
  createAzureExpressRouteEntity,
  createAzurePeerExpressRouteCircuitConnectionEntity,
  getazureExpressRouteKey,
} from './converters';
import { INGESTION_SOURCE_IDS } from '../../../constants';
import {
  IntegrationMissingKeyError,
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import { entities, steps } from '../subscriptions/constants';
import { EventHubEntities } from '../event-hub/constants';

export async function fetchAzureExpressRouteCircuit(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  const client = new ExpressRouteClient(instance.config, logger);

  // Fetch all expressRouteCircuits
  await client.iterateExpressRouteCircuit(async (expressRouteCircuit) => {
    const expressRouteCircuitEntity = createAzureExpressRouteCircuitEntity(
      webLinker,
      expressRouteCircuit,
    );
    await jobState.addEntity(expressRouteCircuitEntity);
  });
}

export async function fetchAzureExpressRoute(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, jobState } = executionContext;
  // create Express Route service
  await jobState.addEntity(createAzureExpressRouteEntity(instance.id));

  // if subscription id is not present integartion will throw error while validating config
  const subscriptionKey = `/subscriptions/${instance.config.subscriptionId}`;
  const azureExpressRouteKey = getazureExpressRouteKey(
    instance.id as string,
    ExpressRouteEntities.AZURE_EXPRESS_ROUTE._type,
  );

  if (!jobState.hasKey(azureExpressRouteKey)) {
    throw new IntegrationMissingKeyError(
      `Express Route Service Key Missing ${subscriptionKey}`,
    );
  }
  // add subscription and express route service relationship
  await jobState.addRelationship(
    createDirectRelationship({
      _class: RelationshipClass.HAS,
      fromKey: subscriptionKey,
      fromType: entities.SUBSCRIPTION._type,
      toKey: azureExpressRouteKey,
      toType: ExpressRouteEntities.AZURE_EXPRESS_ROUTE._type,
    }),
  );
}
export async function buildAzureExpressRouteExpressRouteCircuitRelation(
  executionContext: IntegrationStepContext,
) {
  {
    {
      const { instance, jobState } = executionContext;
    const expressRouteKey = getazureExpressRouteKey(
      instance.id,
      ExpressRouteEntities.AZURE_EXPRESS_ROUTE._type,
    );
  
    if (!jobState.hasKey(expressRouteKey)) {
      throw new IntegrationMissingKeyError(
        `Express Route Service Key Missing ${expressRouteKey}`,
      );
    }
    
      await jobState.iterateEntities(
        { _type: ExpressRouteEntities.AZURE_EXPRESS_ROUTE_CIRCUIT._type },
        async (azureExpressRouteCircuitEntity) => {
          if (!jobState.hasKey(azureExpressRouteCircuitEntity._key)) {
            throw new IntegrationMissingKeyError(
              `azureExpressRouteCircuitEntity Key Missing ${azureExpressRouteCircuitEntity._key}`,
            );
          }
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              fromKey: expressRouteKey,
              fromType: ExpressRouteEntities.AZURE_EXPRESS_ROUTE._type,
              toKey: azureExpressRouteCircuitEntity._key,
              toType: ExpressRouteEntities.AZURE_EXPRESS_ROUTE_CIRCUIT._type,
            }),
          );
        },
      );
    }
  }
}
export async function buildAzureExpressRouteExpressRouteConnectionRelation(
  executionContext: IntegrationStepContext,
) {
  {
    {
      const { instance, jobState } = executionContext;
    const expressRouteKey = getazureExpressRouteKey(
      instance.id,
      ExpressRouteEntities.AZURE_EXPRESS_ROUTE._type,
    );
  
    if (!jobState.hasKey(expressRouteKey)) {
      throw new IntegrationMissingKeyError(
        `Express Route Service Key Missing ${expressRouteKey}`,
      );
    }
    
      await jobState.iterateEntities(
        { _type: ExpressRouteEntities.AZURE_PEER_EXPRESS_ROUTE_CONNECTION._type },
        async (azureExpressRouteConnectionEntity) => {
          if (!jobState.hasKey(azureExpressRouteConnectionEntity._key)) {
            throw new IntegrationMissingKeyError(
              `azureExpressRouteConnectionEntity Key Missing ${azureExpressRouteConnectionEntity._key}`,
            );
          }
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              fromKey: expressRouteKey,
              fromType: ExpressRouteEntities.AZURE_EXPRESS_ROUTE._type,
              toKey: azureExpressRouteConnectionEntity._key,
              toType: ExpressRouteEntities.AZURE_PEER_EXPRESS_ROUTE_CONNECTION._type,
            }),
          );
        },
      );
    }
  }
  
}
export async function buildAzureExpressRouteExpressRouteCrossConnectionRelation() {

  
}

export async function buildAzureExpressRouteExpressRouteCircuitConnectionRelation() {}

export async function buildAzureSubscriptionAndAzureBgpCommunitiesRelation(
  executionContext: IntegrationStepContext) {

  }
  
export async function buildAzureExpressRouteApplicationGatewayRelation( 
   executionContext: IntegrationStepContext,
  ) {
  {
    const { instance, jobState } = executionContext;
  const expressRouteKey = getazureExpressRouteKey(
    instance.id,
    ExpressRouteEntities.AZURE_EXPRESS_ROUTE._type,
  );

  if (!jobState.hasKey(expressRouteKey)) {
    throw new IntegrationMissingKeyError(
      `Express Route Service Key Missing ${expressRouteKey}`,
    );
  }
  
    await jobState.iterateEntities(
      { _type: ExpressRouteEntities.AZURE_APPLICATION_GATEWAY._type },
      async (applicationGatewayEntity) => {
        if (!jobState.hasKey(applicationGatewayEntity._key)) {
          throw new IntegrationMissingKeyError(
            `applicationGatewayEntity Key Missing ${applicationGatewayEntity._key}`,
          );
        }
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            fromKey: expressRouteKey,
            fromType: ExpressRouteEntities.AZURE_EXPRESS_ROUTE._type,
            toKey: applicationGatewayEntity._key,
            toType: ExpressRouteEntities.AZURE_APPLICATION_GATEWAY._type,
          }),
        );
      },
    );
  }
}

export async function buildAzureBgpServiceCommunitiesAzureExpressRouteRelation(executionContext: IntegrationStepContext) 
{
  const { instance, jobState } = executionContext;
  const expressRouteKey = getazureExpressRouteKey(
    instance.id,
    ExpressRouteEntities.AZURE_EXPRESS_ROUTE._type,
  );

  if (!jobState.hasKey(expressRouteKey)) {
    throw new IntegrationMissingKeyError(
      `Express Route Service Key Missing ${expressRouteKey}`,
    );
  }
  await jobState.iterateEntities(
    { _type: ExpressRouteEntities.AZURE_BGP_SERVICE_COMMUNITIES._type },
    async (bgpServiceCommunityEntity) => {
      if (!jobState.hasKey(bgpServiceCommunityEntity._key)) {
        throw new IntegrationMissingKeyError(
          `bgpServiceCommunityEntity Key Missing ${bgpServiceCommunityEntity._key}`,
        );
      }
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: bgpServiceCommunityEntity._key,
          fromType: ExpressRouteEntities.AZURE_BGP_SERVICE_COMMUNITIES._type,
          toKey: expressRouteKey,
          toType: ExpressRouteEntities.AZURE_EXPRESS_ROUTE._type,
        }),
      );
    },
  );
  
}

export async function fetchAzureExpressRouteCircuitConnection(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ExpressRouteClient(instance.config, logger);

  // Fetch all AzureExpressRoute CircuitConnection
  await client.iterateExpressRouteCircuitConnection(
    "j1dev",
    "direct",
    "AzurePrivatePeering",
    async (routeCircuitConnection) => {
      const routeCircuitConnectionEntity =
        createAzureExpressRouteCircuitConnectionEntity(
          webLinker,
          routeCircuitConnection,
        );
      await jobState.addEntity(routeCircuitConnectionEntity);
    },
  );
}

export async function fetchAzureExpressRouteCrossConnection(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ExpressRouteClient(instance.config, logger);

  // Fetch all EventHub namespaces
  await client.iterateExpressRouteCrossConnection(
    async (expressRouteCrossConnection) => {
      const expressRouteCrossConnectionEntity =
        createAzureExpressRouteCrossConnectionEntity(
          webLinker,
          expressRouteCrossConnection,
        );
      await jobState.addEntity(expressRouteCrossConnectionEntity);
    },
  );
}

export async function fetchAzurePeerExpressRouteConnection(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ExpressRouteClient(instance.config, logger);

  // Fetch all EventHub namespaces
  await client.iteratePeerExpressRouteConnection(async (namespace) => {
    const namespaceEntity = createAzurePeerExpressRouteCircuitConnectionEntity(
      webLinker,
      namespace,
    );
    await jobState.addEntity(namespaceEntity);
  });
}

export async function fetchAzureBgpServiceCommunities(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ExpressRouteClient(instance.config, logger);

   const subscriptionKey = `/subscriptions/${instance.config.subscriptionId}`;

  // Fetch all EventHub namespaces
  await client.iterateBgpServiceCommunities(async (bgpServiceCommunity) => {
    const bgpServiceCommunityEntity = createAzureBgpServiceCommunitiesEntity(
      webLinker,
      bgpServiceCommunity,
    );
    await jobState.addEntity(bgpServiceCommunityEntity);
  });
}

export async function fetchAzureApplicationGateway(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ExpressRouteClient(instance.config, logger);

  // Fetch all EventHub namespaces
  await client.iterateApplicationGateway(async (applicationGateway) => {
    const applicationGatewayEntity = createAzureApplicationGatewayEntity(
      webLinker,
      applicationGateway,
    );
    await jobState.addEntity(applicationGatewayEntity);
  });
}

export const expressRouteSteps: AzureIntegrationStep[] = [
  {
    id: STEP_AZURE_EXPRESS_ROUTE_CIRCUIT,
    name: 'Express Route Circuit',
    entities: [ExpressRouteEntities.AZURE_EXPRESS_ROUTE_CIRCUIT],
    relationships: [
    ],
    dependsOn: [STEP_AD_ACCOUNT],
    executionHandler: fetchAzureExpressRouteCircuit,
    ingestionSourceId: INGESTION_SOURCE_IDS.EXPRESS_ROUTE,
  },
  {
    id: STEP_AZURE_EXPRESS_ROUTE,
    name: 'Azure Express Route',
    entities: [ExpressRouteEntities.AZURE_EXPRESS_ROUTE],
    relationships: [
      ExpressRouteRelationships.AZURE_SUBSCRIPTION_HAS_AZURE_EXPRESS_ROUTE,
    ],
    dependsOn: [steps.SUBSCRIPTION],
    executionHandler: fetchAzureExpressRoute,
    ingestionSourceId: INGESTION_SOURCE_IDS.EXPRESS_ROUTE,
  },
  {
    id: STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_RELATION,
    name: 'Build Azure Express Route Has Express Route Circuit',
    entities: [],
    relationships: [
      ExpressRouteRelationships.AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT,
    ],
    dependsOn: [steps.SUBSCRIPTION, STEP_AZURE_EXPRESS_ROUTE],
    executionHandler: buildAzureExpressRouteExpressRouteCircuitRelation,
    ingestionSourceId: INGESTION_SOURCE_IDS.EXPRESS_ROUTE,
  },
  {
    id: STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION_RELATION,
    name: 'Azure Express Route',
    entities: [],
    relationships: [
      ExpressRouteRelationships.AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION,
    ],
    dependsOn: [steps.SUBSCRIPTION, STEP_AZURE_EXPRESS_ROUTE],
    executionHandler:
      buildAzureExpressRouteExpressRouteCircuitConnectionRelation,
    ingestionSourceId: INGESTION_SOURCE_IDS.EXPRESS_ROUTE,
  },
  // {
  //   id: STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CROSS_CONNECTION_RELATION,
  //   name: 'Azure Express Route',
  //   entities: [],
  //   relationships: [
  //     ExpressRouteRelationships.AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CROSS_CONNECTION,
  //   ],
  //   dependsOn: [steps.SUBSCRIPTION, STEP_AZURE_EXPRESS_ROUTE],
  //   executionHandler: buildAzureExpressRouteExpressRouteCrossConnectionRelation,
  //   ingestionSourceId: INGESTION_SOURCE_IDS.EXPRESS_ROUTE,
  // },
  // {
  //   id: STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_PEER_EXPRESS_ROUTE_CONNECTION_RELATION,
  //   name: 'Azure Express Route',
  //   entities: [],
  //   relationships: [
  //     ExpressRouteRelationships.AZURE_EXPRESS_ROUTE_HAS_AZURE_PEER_EXPRESS_ROUTE_CONNECTION,
  //   ],
  //   dependsOn: [steps.SUBSCRIPTION, STEP_AZURE_EXPRESS_ROUTE],
  //   executionHandler: buildAzureExpressRouteExpressRouteConnectionRelation,
  //   ingestionSourceId: INGESTION_SOURCE_IDS.EXPRESS_ROUTE,
  // },
  {
    id: STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_APPLICATION_GATEWAY_RELATION,
    name: 'Build Azure Express Route and Azure Application Gateway Relation',
    entities: [],
    relationships: [
      ExpressRouteRelationships.AZURE_EXPRESS_ROUTE_HAS_AZURE_APPLICATION_GATEWAY,
    ],
    dependsOn: [STEP_AZURE_APPLICATION_GATEWAY, STEP_AZURE_EXPRESS_ROUTE],
    executionHandler: buildAzureExpressRouteApplicationGatewayRelation,
    ingestionSourceId: INGESTION_SOURCE_IDS.EXPRESS_ROUTE,
  },
  {
    id: STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION,
    name: 'Express Route Circuit Connection',
    entities: [ExpressRouteEntities.AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION],
    relationships: [],
    dependsOn: [STEP_AD_ACCOUNT],
    executionHandler: fetchAzureExpressRouteCircuitConnection,
    ingestionSourceId: INGESTION_SOURCE_IDS.EXPRESS_ROUTE,
  },
  // {
  //   id: STEP_AZURE_EXPRESS_ROUTE_CROSS_CONNECTION,
  //   name: 'Express Route Cross Circuit',
  //   entities: [ExpressRouteEntities.AZURE_EXPRESS_ROUTE_CROSS_CONNECTION],
  //   relationships: [],
  //   dependsOn: [STEP_AD_ACCOUNT],
  //   executionHandler: fetchAzureExpressRouteCrossConnection,
  //   ingestionSourceId: INGESTION_SOURCE_IDS.EXPRESS_ROUTE
  // },
  // {
  //   id: STEP_AZURE_PEER_EXPRESS_ROUTE_CONNECTION,
  //   name: 'Azure Peer Express Route Connection',
  //   entities: [ExpressRouteEntities.AZURE_PEER_EXPRESS_ROUTE_CONNECTION],
  //   relationships: [],
  //   dependsOn: [STEP_AD_ACCOUNT],
  //   executionHandler: fetchAzurePeerExpressRouteConnection,
  //   ingestionSourceId: INGESTION_SOURCE_IDS.EXPRESS_ROUTE,
  // },
  {
    id: STEP_AZURE_BGP_SERVICE_COMMUNITIES,
    name: 'Azure Bgp Service Communities',
    entities: [ExpressRouteEntities.AZURE_BGP_SERVICE_COMMUNITIES],
    relationships: [
      ExpressRouteRelationships.AZURE_BGP_SERVICE_COMMUNITIES_HAS_AZURE_EXPRESS_ROUTE,
    ],
    dependsOn: [STEP_AD_ACCOUNT],
    executionHandler: fetchAzureBgpServiceCommunities,
    ingestionSourceId: INGESTION_SOURCE_IDS.EXPRESS_ROUTE,
  },
  {
    id: STEP_AZURE_SUBSCRIPTION_HAS_AZURE_BGP_SERVICE_COMMUNITIES_RELATION,
    name: 'Azure Bgp Service Communities',
    entities: [ExpressRouteEntities.AZURE_BGP_SERVICE_COMMUNITIES],
    relationships: [
      ExpressRouteRelationships.AZURE_BGP_SERVICE_COMMUNITIES_HAS_AZURE_EXPRESS_ROUTE,
    ],
    dependsOn: [steps.SUBSCRIPTION, STEP_AZURE_BGP_SERVICE_COMMUNITIES],
    executionHandler: buildAzureSubscriptionAndAzureBgpCommunitiesRelation,
    ingestionSourceId: INGESTION_SOURCE_IDS.EXPRESS_ROUTE,
  },
  {
    id: STEP_AZURE_BGP_SERVICE_COMMUNITIES_HAS_AZURE_EXPRESS_ROUTE_RELATION,
    name: 'Build Azure Bgp Service Communities and Azure Express Route Relation',
    entities: [],
    relationships: [ExpressRouteRelationships.AZURE_BGP_SERVICE_COMMUNITIES_HAS_AZURE_EXPRESS_ROUTE],
    dependsOn: [STEP_AZURE_BGP_SERVICE_COMMUNITIES, STEP_AZURE_EXPRESS_ROUTE],
    executionHandler: buildAzureBgpServiceCommunitiesAzureExpressRouteRelation,
    ingestionSourceId: INGESTION_SOURCE_IDS.EXPRESS_ROUTE,
  },
  {
    id: STEP_AZURE_APPLICATION_GATEWAY,
    name: 'Azure Application Gateway',
    entities: [ExpressRouteEntities.AZURE_APPLICATION_GATEWAY],
    relationships: [],
    dependsOn: [STEP_AD_ACCOUNT],
    executionHandler: fetchAzureApplicationGateway,
    ingestionSourceId: INGESTION_SOURCE_IDS.EXPRESS_ROUTE,
  },
];
