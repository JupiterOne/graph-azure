import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { entities } from '../subscriptions/constants';
import { RESOURCE_GROUP_ENTITY } from '../resources/constants';
import { KeyVaultEntities } from '../key-vault/constants';

export const STEP_EVENT_HUB_KEYS = 'rm-azure-event-hub-key';
export const STEP_EVENT_HUB_KEYS_USES_AZURE_KEY_VAULT_RELATION =
  'rm-event-hub-keys-uses-azure-key-vault-relation';
export const STEP_EVENT_HUB_NAMESPACE = 'rm-event-hub-namespace';
export const EVENT_HUB_NAMESPACE_HAS_AZURE_EVENT_HUB_RELATION =
  'rm-event-hub-namespace-has-azure-event-hub-relation';
export const EVENT_HUB_NAMESPACE_HAS_EVENT_HUB_KEY_RELATION =
  'rm-event-hub-namespace-has-event-hub-key-relation';
export const STEP_AZURE_EVENT_HUB = 'rm-azure-event-hub';
export const STEP_EVENT_HUB_CLUSTER = 'rm-event-hub-cluster';
export const STEP_EVENT_HUB_CLUSTER_ASSIGNED_EVENT_HUB_NAMESPACE_RELATION =
  'rm-event-hub-cluster-assigned-event-hub-namespace-relation';
export const STEP_AZURE_CONSUMER_GROUP = 'rm-azure-consumer-group';
export const STEP_AZURE_CONSUMER_GROUP_HAS_AZURE_EVENT_HUB_RELATION =
  'rm-azure-consumer-group-has-event-hub-relation';
export const STEP_AZURE_RESOURCE_GROUP_HAS_AZURE_EVENT_HUB_RELATION =
  'rm-azure-resource-group-has-azure-event-hub-relation';
export const STEP_AZURE_SUBSCRIPTION_HAS_AZURE_EVENT_HUB_RELATION =
  'rm-azure-subscription-has-azure-event-hub';
export const STEP_AZURE_EVENT_HUB_HAS_LOCATION_RELATION =
  'rm-azure-event-hub-has-location-relation';

export const EventHubEntities = {
  EVENT_HUB_NAMESPACE: {
    _type: 'azure_event_hub_namespace',
    _class: ['Group'],
    resourceName: '[RM] Event Hub Namespace',
  },
  AZURE_EVENT_HUB: {
    _type: 'azure_event_hub',
    _class: ['Service'],
    resourceName: '[RM] Azure Event Hub',
  },
  EVENT_HUB_KEYS: {
    _type: 'azure_event_hub_key',
    _class: ['Key'],
    resourceName: '[RM] Event Hub Keys',
  },
  EVENT_HUB_CLUSTER: {
    _type: 'azure_event_hub_cluster',
    _class: ['Cluster'],
    resourceName: '[RM] Event Hub Cluster',
  },
  AZURE_CONSUMER_GROUP: {
    _type: 'azure_event_hub_consumer_group',
    _class: ['Channel'],
    resourceName: '[RM] Azure Consumer Group',
  },
};

export const EventHubRelationships = {
  EVENT_HUB_NAMESPACE_HAS_AZURE_EVENT_HUB: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      EventHubEntities.EVENT_HUB_NAMESPACE,
      EventHubEntities.AZURE_EVENT_HUB,
    ),
    sourceType: EventHubEntities.EVENT_HUB_NAMESPACE._type,
    _class: RelationshipClass.HAS,
    targetType: EventHubEntities.AZURE_EVENT_HUB._type,
  },

  EVENT_HUB_NAMESPACE_HAS_EVENT_HUB_KEY: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      EventHubEntities.EVENT_HUB_NAMESPACE,
      EventHubEntities.EVENT_HUB_KEYS,
    ),
    sourceType: EventHubEntities.EVENT_HUB_NAMESPACE._type,
    _class: RelationshipClass.HAS,
    targetType: EventHubEntities.EVENT_HUB_KEYS._type,
  },

  EVENT_HUB_KEYS_USES_AZURE_KEY_VAULT: {
    _type: generateRelationshipType(
      RelationshipClass.USES,
      EventHubEntities.EVENT_HUB_KEYS,
      KeyVaultEntities.KEY_VAULT,
    ),
    sourceType: EventHubEntities.EVENT_HUB_KEYS._type,
    _class: RelationshipClass.USES,
    targetType: KeyVaultEntities.KEY_VAULT._type,
  },

  EVENT_HUB_CLUSTER_ASSIGNED_EVENT_HUB_NAMESPACE: {
    _type: generateRelationshipType(
      RelationshipClass.ASSIGNED,
      EventHubEntities.EVENT_HUB_CLUSTER,
      EventHubEntities.EVENT_HUB_NAMESPACE,
    ),
    sourceType: EventHubEntities.EVENT_HUB_CLUSTER._type,
    _class: RelationshipClass.ASSIGNED,
    targetType: EventHubEntities.EVENT_HUB_NAMESPACE._type,
  },

  AZURE_CONSUMER_GROUP_HAS_AZURE_EVENT_HUB: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      EventHubEntities.AZURE_CONSUMER_GROUP,
      EventHubEntities.AZURE_EVENT_HUB,
    ),
    sourceType: EventHubEntities.AZURE_CONSUMER_GROUP._type,
    _class: RelationshipClass.HAS,
    targetType: EventHubEntities.AZURE_EVENT_HUB._type,
  },

  AZURE_EVENT_HUB_HAS_LOCATION: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      EventHubEntities.AZURE_EVENT_HUB,
      entities.LOCATION,
    ),
    sourceType: EventHubEntities.AZURE_EVENT_HUB._type,
    _class: RelationshipClass.HAS,
    targetType: entities.LOCATION._type,
  },

  AZURE_SUBSCRIPTION_HAS_AZURE_EVENT_HUB: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      entities.SUBSCRIPTION,
      EventHubEntities.AZURE_EVENT_HUB,
    ),
    sourceType: entities.SUBSCRIPTION._type,
    _class: RelationshipClass.HAS,
    targetType: EventHubEntities.AZURE_EVENT_HUB._type,
  },

  AZURE_RESOURCE_GROUP_HAS_AZURE_EVENT_HUB: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      RESOURCE_GROUP_ENTITY,
      EventHubEntities.AZURE_EVENT_HUB,
    ),
    sourceType: RESOURCE_GROUP_ENTITY._type,
    _class: RelationshipClass.HAS,
    targetType: EventHubEntities.AZURE_EVENT_HUB._type,
  },
};
