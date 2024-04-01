import {
  Entity,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk-core';
import { AzureWebLinker } from '../../../azure';
import { ExpressRouteEntities } from './constants';
import { generateEntityKey } from '../../../utils/generateKeys';
import { flattenObject } from '../utils/flattenObj';

// If uniqueId is undefined or not of correct type, raise error
const validateUniqeId = generateEntityKey;

export function getazureExpressRouteKey(uniqueId: string, entityType: string) {
  validateUniqeId(uniqueId);
  return `${entityType}:${uniqueId}`;
}


function getEntityFromId(id: string, entityName): string {
  const parts = id.split('/');
  const index = parts.indexOf(entityName);
  if (index !== -1 && index + 1 < parts.length) {
    return parts[index + 1];
  } else {
    throw new Error('Invalid id format');
  }
}

export function createAzureExpressRouteCircuitConnectionEntity(
  webLinker: AzureWebLinker,
  data,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...flattenObject(data),
        _key: data.id as string,
        _type:
          ExpressRouteEntities.AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION._type,
        _class:
          ExpressRouteEntities.AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION._class,
        webLink: webLinker.portalResourceUrl(data.id),
        public: false,
      },
    },
  });
}

export function createAzureExpressRouteCrossConnectionEntity(
  webLinker: AzureWebLinker,
  data,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...flattenObject(data),
        _key: data.id as string,
        _type: ExpressRouteEntities.AZURE_EXPRESS_ROUTE_CROSS_CONNECTION._type,
        _class:
          ExpressRouteEntities.AZURE_EXPRESS_ROUTE_CROSS_CONNECTION._class,
        webLink: webLinker.portalResourceUrl(data.id),
        public: false,
      },
    },
  });
}

export function createAzureBgpServiceCommunitiesEntity(
  webLinker: AzureWebLinker,
  data,
  subscriptionKey
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...flattenObject(data),
        _key: data.id as string,
        _type: ExpressRouteEntities.AZURE_BGP_SERVICE_COMMUNITIES._type,
        _class: ExpressRouteEntities.AZURE_BGP_SERVICE_COMMUNITIES._class,
        webLink: webLinker.portalResourceUrl(data.id),
        subscriptionKey: subscriptionKey,
        public: false,
      },
    },
  });
}

export function createAzureApplicationGatewayEntity(
  webLinker: AzureWebLinker,
  data,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...flattenObject(data),
        _key: data.id as string,
        _type: ExpressRouteEntities.AZURE_APPLICATION_GATEWAY._type,
        _class: ExpressRouteEntities.AZURE_APPLICATION_GATEWAY._class,
        webLink: webLinker.portalResourceUrl(data.id),
        public: false,
      },
    },
  });
}

export function createAzurePeerExpressRouteCircuitConnectionEntity(
  webLinker: AzureWebLinker,
  data,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...flattenObject(data),
        _key: data.id as string,
        _type: ExpressRouteEntities.AZURE_PEER_EXPRESS_ROUTE_CONNECTION._type,
        _class: ExpressRouteEntities.AZURE_PEER_EXPRESS_ROUTE_CONNECTION._class,
        webLink: webLinker.portalResourceUrl(data.id),
        resourceGroups: getEntityFromId(data.id, 'resourceGroups'),
        circuitName: getEntityFromId(data.id, 'expressRouteCircuits'),
        public: false,
      },
    },
  });
}

export function createAzureExpressRouteEntity(instnaceId: string,
  subscriptionKey
  ): Entity {
  return createIntegrationEntity({
    entityData: {
      source: {},
      assign: {
        _key: getazureExpressRouteKey(
          instnaceId,
          ExpressRouteEntities.AZURE_EXPRESS_ROUTE._type,
        ),
        _type: ExpressRouteEntities.AZURE_EXPRESS_ROUTE._type,
        _class: ExpressRouteEntities.AZURE_EXPRESS_ROUTE._class,
        name: ExpressRouteEntities.AZURE_EXPRESS_ROUTE.resourceName,
        category: ['network'],
        function: ['provisioning', 'encryption', 'networking'],
        endpoint: 'https://portal.azure.com',
        subscriptionKey: subscriptionKey
      },
    },
  });
}

export function createAzureExpressRouteCircuitEntity(
  webLinker: AzureWebLinker,
  data,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...flattenObject(data),
        _key: data.id as string,
        _type: ExpressRouteEntities.AZURE_EXPRESS_ROUTE_CIRCUIT._type,
        _class: ExpressRouteEntities.AZURE_EXPRESS_ROUTE_CIRCUIT._class,
        webLink: webLinker.portalResourceUrl(data.id),
        resourceGroups: getEntityFromId(data.id, 'resourceGroups'),
        public: false,
      },
    },
  });
}
