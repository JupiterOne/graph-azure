import {
  Entity,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk-core';
import { AzureWebLinker } from '../../../azure';
import { ExpressRouteEntities } from './constants';
import { generateEntityKey } from '../../../utils/generateKeys';
import {
  ApplicationGateway,
  BgpServiceCommunity,
  ExpressRouteCircuit,
  ExpressRouteCircuitConnection,
  ExpressRouteCrossConnection,
  PeerExpressRouteCircuitConnection,
} from '@azure/arm-network-latest';

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
  data: ExpressRouteCircuitConnection,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        _type:
          ExpressRouteEntities.AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION._type,
        _class:
          ExpressRouteEntities.AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION._class,
        webLink: webLinker.portalResourceUrl(data.id),
        public: false,
        id: data.id,
        name: data.name,
        provisioningState: data.provisioningState,
        addressPrefix: data.addressPrefix,
        authorizationKey: data.authorizationKey,
        circuitConnectionStatus: data.circuitConnectionStatus,
        etag: data.etag,
        peerExpressRouteCircuitPeeringId:
          data.peerExpressRouteCircuitPeering?.id,
        type: data.type,
        authKey: data.authorizationKey,
        peeringId: data.peerExpressRouteCircuitPeering?.id,
      },
    },
  });
}

export function createAzureExpressRouteCrossConnectionEntity(
  webLinker: AzureWebLinker,
  data: ExpressRouteCrossConnection,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        _type: ExpressRouteEntities.AZURE_EXPRESS_ROUTE_CROSS_CONNECTION._type,
        _class:
          ExpressRouteEntities.AZURE_EXPRESS_ROUTE_CROSS_CONNECTION._class,
        webLink: webLinker.portalResourceUrl(data.id),
        id: data.id,
        name: data.name,
        public: false,
        bandwidthInMbps: data.bandwidthInMbps,
        etag: data.etag,
        expressRouteCircuitId: data.expressRouteCircuit?.id,
        location: data.location,
        peeringLocation: data.peeringLocation,
        serviceProviderProvisioningState: data.serviceProviderProvisioningState,
        primaryAzurePort: data.primaryAzurePort,
        secondaryAzurePort: data.secondaryAzurePort,
        serviceProviderNotes: data.serviceProviderNotes,
      },
    },
  });
}

export function createAzureBgpServiceCommunitiesEntity(
  webLinker: AzureWebLinker,
  data: BgpServiceCommunity,
  subscriptionKey,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        _type: ExpressRouteEntities.AZURE_BGP_SERVICE_COMMUNITIES._type,
        _class: ExpressRouteEntities.AZURE_BGP_SERVICE_COMMUNITIES._class,
        webLink: webLinker.portalResourceUrl(data.id),
        subscriptionKey: subscriptionKey,
        public: false,
        id: data.id,
        name: data.name,
        type: data.type,
        serviceName: data.serviceName,
        location: data.location,
      },
    },
  });
}

export function createAzureApplicationGatewayEntity(
  webLinker: AzureWebLinker,
  data: ApplicationGateway,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        _type: ExpressRouteEntities.AZURE_APPLICATION_GATEWAY._type,
        _class: ExpressRouteEntities.AZURE_APPLICATION_GATEWAY._class,
        webLink: webLinker.portalResourceUrl(data.id),
        public: false,
        name: data.name,
        id: data.id,
        etag: data.etag,
        type: data.type,
        location: data.location,
        provisioningState: data.provisioningState,
        resourceGuid: data.resourceGuid,
        operationalState: data.operationalState,
        skuName: data.sku?.name,
      },
    },
  });
}

export function createAzurePeerExpressRouteCircuitConnectionEntity(
  webLinker: AzureWebLinker,
  data: PeerExpressRouteCircuitConnection,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        _type: ExpressRouteEntities.AZURE_PEER_EXPRESS_ROUTE_CONNECTION._type,
        _class: ExpressRouteEntities.AZURE_PEER_EXPRESS_ROUTE_CONNECTION._class,
        webLink: webLinker.portalResourceUrl(data.id),
        resourceGroups: getEntityFromId(data.id as string, 'resourceGroups'),
        circuitName: getEntityFromId(data.id as string, 'expressRouteCircuits'),
        public: false,
        id: data.id,
        name: data.name,
        addressPrefix: data.addressPrefix,
        authResourceGuid: data.authResourceGuid,
        connectionName: data.connectionName,
        etag: data.etag,
        expressRouteCircuitPeeringId: data.expressRouteCircuitPeering?.id,
        peerExpressRouteCircuitPeeringId:
          data.peerExpressRouteCircuitPeering?.id,
        provisioningState: data.provisioningState,
        type: data.type,
      },
    },
  });
}

export function createAzureExpressRouteEntity(
  instnaceId: string,
  subscriptionKey,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: undefined,
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
        subscriptionKey: subscriptionKey,
      },
    },
  });
}

export function createAzureExpressRouteCircuitEntity(
  webLinker: AzureWebLinker,
  data: ExpressRouteCircuit,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        _type: ExpressRouteEntities.AZURE_EXPRESS_ROUTE_CIRCUIT._type,
        _class: ExpressRouteEntities.AZURE_EXPRESS_ROUTE_CIRCUIT._class,
        webLink: webLinker.portalResourceUrl(data.id),
        resourceGroups: getEntityFromId(data.id as string, 'resourceGroups'),
        public: false,
        name: data.name,
        id: data.id,
        circuitProvisioningState: data.circuitProvisioningState,
        location: data.location,
        type: data.type,
        serviceKey: data.serviceKey,
        etag: data.etag,
      },
    },
  });
}
