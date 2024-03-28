import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { entities } from '../subscriptions/constants';
export const STEP_AZURE_EXPRESS_ROUTE_CIRCUIT =
  'rm-azure-express-route-circuit';
export const STEP_AZURE_PEER_EXPRESS_ROUTE_CONNECTION =
  'rm-azure-peer-express-route-connection';
export const STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION =
  'rm-azure-express-route-circuit-connection';
export const STEP_AZURE_BGP_SERVICE_COMMUNITIES =
  'rm-azure-bgp-service-communities';
export const STEP_AZURE_EXPRESS_ROUTE = 'rm-azure-express-route';
export const STEP_AZURE_EXPRESS_ROUTE_CROSS_CONNECTION =
  'rm-azure-express-route-cross-connection';
export const STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_HAS_AZURE_PEER_EXPRESS_ROUTE_CONNECTION_RELATION =
  'rm-azure-express-route-circuit-has-azure-peer-express-route-connection-relation';
export const STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_RELATION =
  'rm-azure-express-route-has-azure-express-route-circuit-relation';
export const STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION_RELATION =
  'rm-azure-express-route-has-azure-express-route-circuit-connection-relation';
export const STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION_RELATION =
  'rm-azure-express-route-circuit-has-azure-express-route-circuit-connection-relation';
export const STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CROSS_CONNECTION_RELATION =
  'rm-azure-express-route-has-azure-express-route-cross-connection-relation';
export const STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_PEER_EXPRESS_ROUTE_CONNECTION_RELATION =
  'rm-azure-express-route-has-azure-peer-express-route-connection-relation';
export const STEP_AZURE_SUBSCRIPTION_HAS_AZURE_BGP_SERVICE_COMMUNITIES_RELATION =
  'rm-azure-subscription-has-azure-bgp-service-communities-relation';
export const STEP_AZURE_BGP_SERVICE_COMMUNITIES_HAS_AZURE_EXPRESS_ROUTE_RELATION =
  'rm-azure-bgp-service-communities-has-azure-express-route-relation'; 
export const STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_APPLICATION_GATEWAY_RELATION =
  'rm-azure-express-route-has-azure-application-gateway-relation'; 
export const STEP_AZURE_APPLICATION_GATEWAY = 'rm-azure-application-gateway'; 

export const ExpressRouteEntities = {
  AZURE_EXPRESS_ROUTE_CIRCUIT: {
    _type: 'azure_expressroute_circuit',
    _class: ['Network'],
    resourceName: '[RM] Azure Express Route Circuit',
    schema: {
      properties: {
        CIDR: { exclude: true },
        internal: { exclude: true },
      },
    },
  },
  AZURE_PEER_EXPRESS_ROUTE_CONNECTION: {
    _type: 'azure_peer_expressroute_circut_connection',
    _class: ['Network'],
    schema: {
      properties: {
        CIDR: { exclude: true },
        internal: { exclude: true },
      },
    },
    resourceName: '[RM] Azure Peer Express Route Circuit Connection',
  },
  AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION: {
    _type: 'azure_expressroute_circuit_connection',
    _class: ['Network'],
    schema: {
      properties: {
        CIDR: { exclude: true },
        internal: { exclude: true },
      },
    },
    resourceName: '[RM] Azure Express Route Circuit Connections',
  },
  AZURE_EXPRESS_ROUTE_CROSS_CONNECTION: {
    _type: 'azure_expressroute_cross_connection',
    _class: ['Network'],
    schema: {
      properties: {
        CIDR: { exclude: true },
        internal: { exclude: true },
      },
    },
    resourceName: '[RM] Azure Express Route Cross Connections',
  },
  AZURE_EXPRESS_ROUTE: {
    _type: 'azure_expressroute',
    _class: ['Service'],
    schema: {
      properties: {
        CIDR: { exclude: true },
        internal: { exclude: true },
      },
    },
    resourceName: '[RM] Azure Express Route',
  },
  AZURE_BGP_SERVICE_COMMUNITIES: {
    _type: 'azure_bgp_service_communities',
    _class: ['Network'],
    schema: {
      properties: {
        CIDR: { exclude: true },
        internal: { exclude: true },
      },
    },
    resourceName: '[RM] Azure Bgp Service Communities',
  },
  AZURE_APPLICATION_GATEWAY: {
    _type: 'azure_application_gateway',
    _class: ['Network'],
    schema: {
      properties: {
        CIDR: { exclude: true },
        internal: { exclude : true },
      },
    },
    resourceName: 'Azure Application Gateway',
  },
};

export const ExpressRouteRelationships = {
  AZURE_EXPRESS_ROUTE_CIRCUIT_HAS_AZURE_PEER_EXPRESS_ROUTE_CONNECTION: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      ExpressRouteEntities.AZURE_EXPRESS_ROUTE_CIRCUIT,
      ExpressRouteEntities.AZURE_PEER_EXPRESS_ROUTE_CONNECTION,
    ),
    sourceType: ExpressRouteEntities.AZURE_EXPRESS_ROUTE_CIRCUIT._type,
    _class: RelationshipClass.HAS,
    targetType: ExpressRouteEntities.AZURE_PEER_EXPRESS_ROUTE_CONNECTION._type,
  },

  AZURE_EXPRESS_ROUTE_CIRCUIT_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      ExpressRouteEntities.AZURE_EXPRESS_ROUTE_CIRCUIT,
      ExpressRouteEntities.AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION,
    ),
    sourceType: ExpressRouteEntities.AZURE_EXPRESS_ROUTE_CIRCUIT._type,
    _class: RelationshipClass.HAS,
    targetType:
      ExpressRouteEntities.AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION._type,
  },

  AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      ExpressRouteEntities.AZURE_EXPRESS_ROUTE,
      ExpressRouteEntities.AZURE_EXPRESS_ROUTE_CIRCUIT,
    ),
    sourceType: ExpressRouteEntities.AZURE_EXPRESS_ROUTE._type,
    _class: RelationshipClass.HAS,
    targetType: ExpressRouteEntities.AZURE_EXPRESS_ROUTE._type,
  },

  AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      ExpressRouteEntities.AZURE_EXPRESS_ROUTE,
      ExpressRouteEntities.AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION,
    ),
    sourceType: ExpressRouteEntities.AZURE_EXPRESS_ROUTE._type,
    _class: RelationshipClass.HAS,
    targetType:
      ExpressRouteEntities.AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION._type,
  },

  AZURE_EXPRESS_ROUTE_HAS_AZURE_PEER_EXPRESS_ROUTE_CONNECTION: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      ExpressRouteEntities.AZURE_EXPRESS_ROUTE,
      ExpressRouteEntities.AZURE_PEER_EXPRESS_ROUTE_CONNECTION,
    ),
    sourceType: ExpressRouteEntities.AZURE_EXPRESS_ROUTE._type,
    _class: RelationshipClass.HAS,
    targetType: ExpressRouteEntities.AZURE_PEER_EXPRESS_ROUTE_CONNECTION._type,
  },

  AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CROSS_CONNECTION: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      ExpressRouteEntities.AZURE_EXPRESS_ROUTE,
      ExpressRouteEntities.AZURE_EXPRESS_ROUTE_CROSS_CONNECTION,
    ),
    sourceType: ExpressRouteEntities.AZURE_EXPRESS_ROUTE._type,
    _class: RelationshipClass.HAS,
    targetType: ExpressRouteEntities.AZURE_EXPRESS_ROUTE_CROSS_CONNECTION._type,
  },

  AZURE_BGP_SERVICE_COMMUNITIES_HAS_AZURE_EXPRESS_ROUTE: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      ExpressRouteEntities.AZURE_BGP_SERVICE_COMMUNITIES,
      ExpressRouteEntities.AZURE_EXPRESS_ROUTE,
    ),
    sourceType: ExpressRouteEntities.AZURE_BGP_SERVICE_COMMUNITIES._type,
    _class: RelationshipClass.HAS,
    targetType: ExpressRouteEntities.AZURE_EXPRESS_ROUTE._type,
  },

  AZURE_EXPRESS_ROUTE_HAS_AZURE_APPLICATION_GATEWAY: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      ExpressRouteEntities.AZURE_EXPRESS_ROUTE,
      ExpressRouteEntities.AZURE_APPLICATION_GATEWAY,
    ),
    sourceType: ExpressRouteEntities.AZURE_EXPRESS_ROUTE._type,
    _class: RelationshipClass.HAS,
    targetType: ExpressRouteEntities.AZURE_APPLICATION_GATEWAY._type,
  },

  AZURE_SUBSCRIPTION_HAS_AZURE_EXPRESS_ROUTE: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      entities.SUBSCRIPTION,
      ExpressRouteEntities.AZURE_EXPRESS_ROUTE,
    ),
    sourceType: entities.SUBSCRIPTION._type,
    _class: RelationshipClass.HAS,
    targetType: ExpressRouteEntities.AZURE_EXPRESS_ROUTE._type,
  },

  AZURE_SUBSCRIPTION_HAS_AZURE_BGP_SERVICE_COMMUNITIES: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      entities.SUBSCRIPTION,
      ExpressRouteEntities.AZURE_BGP_SERVICE_COMMUNITIES,
    ),
    sourceType: entities.SUBSCRIPTION._type,
    _class: RelationshipClass.HAS,
    targetType: ExpressRouteEntities.AZURE_BGP_SERVICE_COMMUNITIES._type,
  },
};
