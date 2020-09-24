import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createResourceGroupResourceRelationshipMetadata } from '../utils/createResourceGroupResourceRelationship';
import { RESOURCE_GROUP_MATCHER } from '../utils/matchers';

export const SERVICE_BUS_DOMAIN_MATCHER = new RegExp(
  RESOURCE_GROUP_MATCHER + '/providers/Microsoft.EventGrid/domains/[^/]+',
);

export const EventGridEntities = {
  DOMAIN: {
    _type: 'azure_event_grid_domain',
    _class: ['Service'],
    resourceName: '[RM] Event Grid Domain',
  },
  DOMAIN_TOPIC: {
    _type: 'azure_event_grid_domain_topic',
    _class: ['Queue'],
    resourceName: '[RM] Event Grid Domain Topic',
  },
  TOPIC: {
    _type: 'azure_event_grid_topic',
    _class: ['Queue'],
    resourceName: '[RM] Event Grid Topic',
  },
  EVENT_SUBSCRIPTION: {
    _type: 'azure_event_grid_event_subscription',
    _class: ['Subscription'],
    resourceName: '[RM] Event Grid Subscription',
  },
};

export const ServiceBusRelationships = {
  RESOURCE_GROUP_HAS_DOMAIN: createResourceGroupResourceRelationshipMetadata(
    EventGridEntities.DOMAIN._type,
  ),

  DOMAIN_HAS_DOMAIN_TOPIC: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      EventGridEntities.DOMAIN,
      EventGridEntities.DOMAIN_TOPIC,
    ),
    sourceType: EventGridEntities.DOMAIN._type,
    _class: RelationshipClass.HAS,
    targetType: EventGridEntities.DOMAIN_TOPIC._type,
  },

  RESOURCE_GROUP_HAS_TOPIC: createResourceGroupResourceRelationshipMetadata(
    EventGridEntities.TOPIC._type,
  ),

  // TODO : Figure out what kinds of subscriptions we want to capture.
  // global, regional, subscription (account level), resource group
};
