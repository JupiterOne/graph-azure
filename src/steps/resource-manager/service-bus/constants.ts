import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createResourceGroupResourceRelationshipMetadata } from '../utils/createResourceGroupResourceRelationship';
import { RESOURCE_GROUP_MATCHER } from '../utils/matchers';

export const STEP_RM_SERVICE_BUS_NAMESPACES = 'rm-service-bus-namespaces';
export const STEP_RM_SERVICE_BUS_QUEUES = 'rm-service-bus-queues';
export const STEP_RM_SERVICE_BUS_TOPICS = 'rm-service-bus-topics';
export const STEP_RM_SERVICE_BUS_SUBSCRIPTIONS = 'rm-service-bus-subscriptions';

export const SERVICE_BUS_NAMESPACE_MATCHER = new RegExp(
  RESOURCE_GROUP_MATCHER + '/providers/Microsoft.ServiceBus/namespaces/[^/]+',
);

export const ServiceBusEntities = {
  NAMESPACE: {
    _type: 'azure_service_bus_namespace',
    _class: ['Service'],
    resourceName: '[RM] Service Bus Namespace',
  },
  QUEUE: {
    _type: 'azure_service_bus_queue',
    _class: ['Queue'],
    resourceName: '[RM] Service Bus Queue',
  },
  TOPIC: {
    _type: 'azure_service_bus_topic',
    _class: ['Queue'],
    resourceName: '[RM] Service Bus Topic',
  },
  SUBSCRIPTION: {
    _type: 'azure_service_bus_subscription',
    _class: ['Subscription'],
    resourceName: '[RM] Service Bus Subscription',
  },
};

export const ServiceBusRelationships = {
  RESOURCE_GROUP_HAS_NAMESPACE: createResourceGroupResourceRelationshipMetadata(
    ServiceBusEntities.NAMESPACE._type,
  ),
  NAMESPACE_HAS_QUEUE: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      ServiceBusEntities.NAMESPACE,
      ServiceBusEntities.QUEUE,
    ),
    sourceType: ServiceBusEntities.NAMESPACE._type,
    _class: RelationshipClass.HAS,
    targetType: ServiceBusEntities.QUEUE._type,
  },
  NAMESPACE_HAS_TOPIC: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      ServiceBusEntities.NAMESPACE,
      ServiceBusEntities.TOPIC,
    ),
    sourceType: ServiceBusEntities.NAMESPACE._type,
    _class: RelationshipClass.HAS,
    targetType: ServiceBusEntities.TOPIC._type,
  },
  TOPIC_HAS_SUBSCRIPTION: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      ServiceBusEntities.TOPIC,
      ServiceBusEntities.SUBSCRIPTION,
    ),
    sourceType: ServiceBusEntities.TOPIC._type,
    _class: RelationshipClass.HAS,
    targetType: ServiceBusEntities.SUBSCRIPTION._type,
  },
};
