import {
  createDirectRelationship,
  getRawData,
  IntegrationMissingKeyError,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { EHNamespace, Eventhub, Namespaces } from '@azure/arm-eventhub';
import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, AzureIntegrationStep } from '../../../types';
import { getAccountEntity } from '../../active-directory';
import { STEP_AD_ACCOUNT } from '../../active-directory/constants';
import {
  steps,
  entities,
} from '../../resource-manager/subscriptions/constants';
import {
  RESOURCE_GROUP_ENTITY,
  STEP_RM_RESOURCES_RESOURCE_GROUPS,
} from '../resources/constants';
// import createResourceGroupResourceRelationship from '../utils/createResourceGroupResourceRelationship';
import { EventHubClient } from './client';
import {
  EventHubEntities,
  EventHubRelationships,
  STEP_EVENT_HUB_KEYS,
  STEP_AZURE_EVENT_HUB,
  STEP_EVENT_HUB_NAMESPACE,
  STEP_AZURE_CONSUMER_GROUP,
  STEP_EVENT_HUB_CLUSTER,
  EVENT_HUB_NAMESPACE_HAS_AZURE_EVENT_HUB_RELATION,
  // AZURE_EVENT_HUB_HAS_EVENT_HUB_CLUSTER,
  STEP_AZURE_CONSUMER_GROUP_HAS_AZURE_EVENT_HUB_RELATION,
  STEP_AZURE_SUBSCRIPTION_HAS_AZURE_EVENT_HUB_RELATION,
  STEP_AZURE_RESOURCE_GROUP_HAS_AZURE_EVENT_HUB_RELATION,
  STEP_EVENT_HUB_CLUSTER_ASSIGNED_EVENT_HUB_NAMESPACE_RELATION,
  STEP_EVENT_HUB_KEYS_USES_AZURE_KEY_VAULT_RELATION,
  EVENT_HUB_NAMESPACE_HAS_EVENT_HUB_KEY_RELATION,
} from './constants';
import {
  createEventHubNamespaceEntity,
  createAzureConsumerGroupEntity,
  createAzureEventHubClusterEntity,
  createAzureEventHubKeysEntity,
  createEventHubEntity,
} from './converters';
// import { resourceGroupName } from '../../../azure/utils';
// import {
//   createDiagnosticSettingsEntitiesAndRelationshipsForResource,
//   diagnosticSettingsEntitiesForResource,
//   getDiagnosticSettingsRelationshipsForResource,
// } from '../utils/createDiagnosticSettingsEntitiesAndRelationshipsForResource';
import { INGESTION_SOURCE_IDS } from '../../../constants';
import {
  KEY_VAULT_SERVICE_ENTITY_TYPE,
  STEP_RM_KEYVAULT_VAULTS,
} from '../key-vault/constants';
// import { steps as storageSteps } from '../storage/constants';
// import { ResourceRecommendationBase } from '@azure/arm-advisor';
// import { buildActivityLogScopeRelationships } from '../monitor';

export async function fetchEventHubNamespaces(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  const client = new EventHubClient(instance.config, logger);

  // Fetch all EventHub namespaces
  await client.iterateEventHubNamespaces(
    instance.config.subscriptionId as string,
    async (namespace) => {
      const namespaceEntity = createEventHubNamespaceEntity(
        webLinker,
        namespace,
      );
      await jobState.addEntity(namespaceEntity);
    },
  );
}

export async function fetchAzureEventHub(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new EventHubClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: EventHubEntities.EVENT_HUB_NAMESPACE._type },
    async (namespaceNameEntity) => {
      const namespaceName = namespaceNameEntity.name as string;
      const resourceGroup = namespaceNameEntity.resourceGroupName as string;
      await client.iterateEventHubs(
        instance.config.subscriptionId as string,
        resourceGroup,
        namespaceName,
        async (eventHub) => {
          const eventHubEntity = createEventHubEntity(webLinker, eventHub);
          if (!jobState.hasKey(eventHub.key)) {
            await jobState.addEntity(eventHubEntity);
          }
        },
      );
    },
  );
}

export async function buildEventHubNamespaceEventHubRelationship(
  executionContext: IntegrationStepContext,
) {
  const { jobState } = executionContext;
  await jobState.iterateEntities(
    { _type: EventHubEntities.AZURE_EVENT_HUB._type },
    async (eventHubEntity) => {
      const eventHubNamespaceEntityKey = eventHubEntity._key.substring(
        0,
        eventHubEntity._key.lastIndexOf('/eventhubs'),
      );
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: eventHubNamespaceEntityKey,
          fromType: EventHubEntities.EVENT_HUB_NAMESPACE._type,
          toKey: eventHubEntity._key,
          toType: EventHubEntities.AZURE_EVENT_HUB._type,
        }),
      );
    },
  );
}
export async function buildEventHubNamespaceEventHubKeyRelationship(
  executionContext: IntegrationStepContext,
) {
  const { jobState } = executionContext;
  await jobState.iterateEntities(
    { _type: EventHubEntities.EVENT_HUB_KEYS._type },
    async (eventHubKeyEntity) => {
      const eventHubNamespaceEntityKey =
        eventHubKeyEntity.namespaceId as string;
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: eventHubNamespaceEntityKey,
          fromType: EventHubEntities.EVENT_HUB_NAMESPACE._type,
          toKey: eventHubKeyEntity._key,
          toType: EventHubEntities.EVENT_HUB_KEYS._type,
        }),
      );
    },
  );
}

export async function buildAzureSubscriptionAzureEventHubRelation(
  executionContext: IntegrationStepContext,
) {
  const { jobState } = executionContext;
  await jobState.iterateEntities(
    { _type: EventHubEntities.AZURE_EVENT_HUB._type },
    async (eventHubEntity) => {
      const subscriptionEntityKey = eventHubEntity._key.substring(
        0,
        eventHubEntity._key.lastIndexOf('/subscriptions'),
      );
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: subscriptionEntityKey,
          fromType: entities.SUBSCRIPTION._type,
          toKey: eventHubEntity._key,
          toType: EventHubEntities.AZURE_EVENT_HUB._type,
        }),
      );
    },
  );
}

export async function buildAzureResourceGroupAzureEventHubRelation(
  executionContext: IntegrationStepContext,
) {
  const { jobState } = executionContext;
  await jobState.iterateEntities(
    { _type: EventHubEntities.AZURE_EVENT_HUB._type },
    async (eventHubEntity) => {
      const resourceGroupEntityKey = eventHubEntity._key.substring(
        0,
        eventHubEntity._key.lastIndexOf('/resourceGroups'),
      );
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: resourceGroupEntityKey,
          fromType: RESOURCE_GROUP_ENTITY._type,
          toKey: eventHubEntity._key,
          toType: EventHubEntities.AZURE_EVENT_HUB._type,
        }),
      );
    },
  );
}

export async function fetchEventHubKeys(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState } = executionContext;
  await jobState.iterateEntities(
    { _type: EventHubEntities.EVENT_HUB_NAMESPACE._type },
    async (namespaceEntity) => {
      const namespace = getRawData<EHNamespace>(namespaceEntity);
      // Check if namespace is defined and has the encryption property and keyVaultProperties
      if (
        namespace &&
        namespace.encryption &&
        namespace.encryption.keyVaultProperties
      ) {
        // Iterate over keyVaultProperties array
        for (const keyVaultProperty of namespace.encryption
          .keyVaultProperties) {
          const eventHubKeyEntity = createAzureEventHubKeysEntity(
            keyVaultProperty,
            namespace.id,
          );
          await jobState.addEntity(eventHubKeyEntity);
        }
      }
    },
  );
}

export async function buildEventHubKeysKeyVaultRelation(
  executionContext: IntegrationStepContext,
) {
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: KEY_VAULT_SERVICE_ENTITY_TYPE },
    async (keyVaultEntity) => {
      let eventHubKey = keyVaultEntity.vaultUrl as string;
      eventHubKey = eventHubKey.endsWith('/')
        ? eventHubKey.slice(0, -1)
        : eventHubKey;
      if (jobState.hasKey(eventHubKey)) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            fromKey: eventHubKey,
            fromType: EventHubEntities.EVENT_HUB_KEYS._type,
            toKey: keyVaultEntity._key,
            toType: KEY_VAULT_SERVICE_ENTITY_TYPE,
          }),
        );
      }
    },
  );
}

export async function fetchAzureConsumerGroup(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new EventHubClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: EventHubEntities.AZURE_EVENT_HUB._type },
    async (eventhubEntity) => {
      const resourceGroup = eventhubEntity.resourceGroupName as string;
      const namespaceName = eventhubEntity.namespace as string;
      const eventHubName = eventhubEntity.name as string;
      await client.iterateAzureConsumerGroup(
        instance.config.subscriptionId as string,
        resourceGroup,
        namespaceName,
        eventHubName,
        async (consumerGroup) => {
          const consumerGroupEntity = createAzureConsumerGroupEntity(
            webLinker,
            consumerGroup,
          );
          await jobState.addEntity(consumerGroupEntity);
        },
      );
    },
  );
}

export async function buildAzureConsumerGroupEventHubRelationship(
  executionContext: IntegrationStepContext,
) {
  const { jobState } = executionContext;
  await jobState.iterateEntities(
    { _type: EventHubEntities.AZURE_CONSUMER_GROUP._type },
    async (consumerGroupEntity) => {
      const eventHubEntityKey = consumerGroupEntity._key.substring(
        0,
        consumerGroupEntity._key.lastIndexOf('/eventhubs'),
      );
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: consumerGroupEntity._key,
          fromType: EventHubEntities.AZURE_CONSUMER_GROUP._type,
          toKey: eventHubEntityKey,
          toType: EventHubEntities.AZURE_EVENT_HUB._type,
        }),
      );
    },
  );
}

export async function fetchEventHubCluster(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new EventHubClient(instance.config, logger);

  await client.iterateEventHubCluster(
    instance.config.subscriptionId as string,
    async (cluster) => {
      const clusterEntity = createAzureEventHubClusterEntity(
        webLinker,
        cluster,
      );
      await jobState.addEntity(clusterEntity);
    },
  );
}

export async function buildEventHubEventHubClusterRelationship(
  executionContext: IntegrationStepContext,
) {
  const { jobState } = executionContext;
  await jobState.iterateEntities(
    { _type: EventHubEntities.EVENT_HUB_CLUSTER._type },
    async (clusterEntity) => {
      const eventHubEntityKey = clusterEntity._key;
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: clusterEntity._key,
          fromType: EventHubEntities.EVENT_HUB_CLUSTER._type,
          toKey: eventHubEntityKey,
          toType: EventHubEntities.AZURE_EVENT_HUB._type,
        }),
      );
    },
  );
}

export async function buildEventHubClusterEventHubNamespaceRelation(
  executionContext: IntegrationStepContext,
) {
  const { jobState } = executionContext;
  await jobState.iterateEntities(
    { _type: EventHubEntities.EVENT_HUB_NAMESPACE._type },
    async (eventHubNamespaceEntity) => {
      // Check if clusterArmId is defined
      if (eventHubNamespaceEntity.clusterArmId !== undefined) {
        const clusterEntityKey = eventHubNamespaceEntity.clusterArmId as string;
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            fromKey: clusterEntityKey,
            fromType: EventHubEntities.EVENT_HUB_CLUSTER._type,
            toKey: eventHubNamespaceEntity._key,
            toType: EventHubEntities.AZURE_EVENT_HUB._type,
          }),
        );
      }
    },
  );
}

export const eventHubStep: AzureIntegrationStep[] = [
  {
    id: STEP_EVENT_HUB_NAMESPACE,
    name: 'Event Hub Namespace',
    entities: [EventHubEntities.EVENT_HUB_NAMESPACE],
    relationships: [],
    dependsOn: [STEP_AD_ACCOUNT],
    executionHandler: fetchEventHubNamespaces,
    ingestionSourceId: INGESTION_SOURCE_IDS.EVENT_HUB,
  },
  {
    id: EVENT_HUB_NAMESPACE_HAS_AZURE_EVENT_HUB_RELATION,
    name: 'Build Event Hub Namespace Has Event Hub Relation',
    entities: [],
    relationships: [
      EventHubRelationships.EVENT_HUB_NAMESPACE_HAS_AZURE_EVENT_HUB,
    ],
    dependsOn: [STEP_EVENT_HUB_NAMESPACE, STEP_AZURE_EVENT_HUB],
    executionHandler: buildEventHubNamespaceEventHubRelationship,
    ingestionSourceId: INGESTION_SOURCE_IDS.EVENT_HUB,
  },
  {
    id: STEP_EVENT_HUB_KEYS,
    name: 'Event Hub Keys',
    entities: [EventHubEntities.EVENT_HUB_KEYS],
    relationships: [],
    dependsOn: [STEP_EVENT_HUB_NAMESPACE],
    executionHandler: fetchEventHubKeys,
    ingestionSourceId: INGESTION_SOURCE_IDS.EVENT_HUB,
  },
  {
    id: EVENT_HUB_NAMESPACE_HAS_EVENT_HUB_KEY_RELATION,
    name: 'Build Event Hub Namespace Has Event Hub key Relation',
    entities: [],
    relationships: [
      EventHubRelationships.EVENT_HUB_NAMESPACE_HAS_EVENT_HUB_KEY,
    ],
    dependsOn: [STEP_EVENT_HUB_NAMESPACE, STEP_EVENT_HUB_KEYS],
    executionHandler: buildEventHubNamespaceEventHubKeyRelationship,
    ingestionSourceId: INGESTION_SOURCE_IDS.EVENT_HUB,
  },
  {
    id: STEP_EVENT_HUB_KEYS_USES_AZURE_KEY_VAULT_RELATION,
    name: 'Build Event Hub Keys Uses Key Vault Relation',
    entities: [],
    relationships: [EventHubRelationships.EVENT_HUB_KEYS_USES_AZURE_KEY_VAULT],
    dependsOn: [STEP_EVENT_HUB_KEYS, STEP_RM_KEYVAULT_VAULTS],
    executionHandler: buildEventHubKeysKeyVaultRelation,
    ingestionSourceId: INGESTION_SOURCE_IDS.EVENT_HUB,
  },
  {
    id: STEP_AZURE_CONSUMER_GROUP,
    name: 'Azure Consumer Group',
    entities: [EventHubEntities.AZURE_CONSUMER_GROUP],
    relationships: [],
    dependsOn: [
      STEP_AD_ACCOUNT,
      STEP_EVENT_HUB_NAMESPACE,
      STEP_AZURE_EVENT_HUB,
      STEP_RM_RESOURCES_RESOURCE_GROUPS,
    ],
    executionHandler: fetchAzureConsumerGroup,
    ingestionSourceId: INGESTION_SOURCE_IDS.EVENT_HUB,
  },
  {
    id: STEP_AZURE_CONSUMER_GROUP_HAS_AZURE_EVENT_HUB_RELATION,
    name: 'Build Azure Consumer Group Has Azure Event Hub Relation',
    entities: [],
    relationships: [
      EventHubRelationships.AZURE_CONSUMER_GROUP_HAS_AZURE_EVENT_HUB,
    ],
    dependsOn: [STEP_AZURE_EVENT_HUB, STEP_AZURE_CONSUMER_GROUP],
    executionHandler: buildAzureConsumerGroupEventHubRelationship,
    ingestionSourceId: INGESTION_SOURCE_IDS.EVENT_HUB,
  },
  {
    id: STEP_AZURE_EVENT_HUB,
    name: 'Azure Event Hub',
    entities: [EventHubEntities.AZURE_EVENT_HUB],
    relationships: [],
    dependsOn: [
      STEP_AD_ACCOUNT,
      STEP_EVENT_HUB_NAMESPACE,
      STEP_RM_RESOURCES_RESOURCE_GROUPS,
    ],
    executionHandler: fetchAzureEventHub,
    ingestionSourceId: INGESTION_SOURCE_IDS.EVENT_HUB,
  },
  {
    id: STEP_AZURE_SUBSCRIPTION_HAS_AZURE_EVENT_HUB_RELATION,
    name: 'Build Azure Subscription Has Azure Event Hub',
    entities: [],
    relationships: [],
    dependsOn: [STEP_AZURE_EVENT_HUB, steps.SUBSCRIPTION],
    executionHandler: buildAzureSubscriptionAzureEventHubRelation,
    ingestionSourceId: INGESTION_SOURCE_IDS.EVENT_HUB,
  },
  {
    id: STEP_AZURE_RESOURCE_GROUP_HAS_AZURE_EVENT_HUB_RELATION,
    name: 'Build Azure ResourceGroup Has Azure Event Hub',
    entities: [],
    relationships: [],
    dependsOn: [STEP_AZURE_EVENT_HUB, steps.SUBSCRIPTION],
    executionHandler: buildAzureResourceGroupAzureEventHubRelation,
    ingestionSourceId: INGESTION_SOURCE_IDS.EVENT_HUB,
  },
  {
    id: STEP_EVENT_HUB_CLUSTER,
    name: 'Event Hub Cluster',
    entities: [EventHubEntities.EVENT_HUB_CLUSTER],
    relationships: [],
    dependsOn: [STEP_AD_ACCOUNT],
    executionHandler: fetchEventHubCluster,
    ingestionSourceId: INGESTION_SOURCE_IDS.EVENT_HUB,
  },
  {
    id: STEP_EVENT_HUB_CLUSTER_ASSIGNED_EVENT_HUB_NAMESPACE_RELATION,
    name: 'Build Event Hub Cluster Assigned Event Hub Namespace Relation',
    entities: [],
    relationships: [
      EventHubRelationships.EVENT_HUB_CLUSTER_ASSIGNED_EVENT_HUB_NAMESPACE,
    ],
    dependsOn: [STEP_EVENT_HUB_CLUSTER, STEP_EVENT_HUB_NAMESPACE],
    executionHandler: buildEventHubClusterEventHubNamespaceRelation,
    ingestionSourceId: INGESTION_SOURCE_IDS.EVENT_HUB,
  },
  // {
  //   id: AZURE_EVENT_HUB_HAS_EVENT_HUB_CLUSTER,
  //   name: 'Event Hub Has Event Hub Cluster',
  //   entities: [],
  //   relationships: [
  //     EventHubRelationships.AZURE_EVENT_HUB_HAS_EVENT_HUB_CLUSTER
  //   ],
  //   dependsOn: [STEP_AZURE_EVENT_HUB, STEP_EVENT_HUB_CLUSTER],
  //   executionHandler: buildEventHubEventHubClusterRelationship,
  //   ingestionSourceId: INGESTION_SOURCE_IDS.EVENT_HUB,
  // }
];
