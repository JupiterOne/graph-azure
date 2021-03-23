import {
  Step,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { getAccountEntity, STEP_AD_ACCOUNT } from '../../active-directory';
import { ServiceBusClient } from './client';
import {
  ServiceBusEntities,
  ServiceBusRelationships,
  STEP_RM_SERVICE_BUS_NAMESPACES,
  STEP_RM_SERVICE_BUS_QUEUES,
  STEP_RM_SERVICE_BUS_TOPICS,
  STEP_RM_SERVICE_BUS_SUBSCRIPTIONS,
  SERVICE_BUS_NAMESPACE_MATCHER,
} from './constants';
import {
  createServiceBusNamespaceEntity,
  createServiceBusQueueEntity,
  createServiceBusTopicEntity,
  createServiceBusSubscriptionEntity,
} from './converters';
import createResourceGroupResourceRelationship from '../utils/createResourceGroupResourceRelationship';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources';
export * from './constants';

export async function fetchServiceBusNamespaces(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ServiceBusClient(instance.config, logger);

  await client.iterateNamespaces(async (namespace) => {
    const namespaceEntity = createServiceBusNamespaceEntity(
      webLinker,
      namespace,
    );
    await jobState.addEntity(namespaceEntity);

    await createResourceGroupResourceRelationship(
      executionContext,
      namespaceEntity,
    );
  });
}

export async function fetchServiceBusQueues(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ServiceBusClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: ServiceBusEntities.NAMESPACE._type },
    async (namespaceEntity) => {
      await client.iterateQueues(
        (namespaceEntity as unknown) as { name: string; id: string },
        async (queue) => {
          const queueEntity = createServiceBusQueueEntity(webLinker, queue);
          await jobState.addEntity(queueEntity);

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: namespaceEntity,
              to: queueEntity,
            }),
          );
        },
      );
    },
  );
}

export async function fetchServiceBusTopics(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ServiceBusClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: ServiceBusEntities.NAMESPACE._type },
    async (namespaceEntity) => {
      await client.iterateTopics(
        (namespaceEntity as unknown) as { name: string; id: string },
        async (topic) => {
          const topicEntity = createServiceBusTopicEntity(webLinker, topic);
          await jobState.addEntity(topicEntity);

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: namespaceEntity,
              to: topicEntity,
            }),
          );
        },
      );
    },
  );
}

function getNamespaceFromTopicId(
  topicId: string,
): { id: string; name: string } | undefined {
  const match = topicId.match(SERVICE_BUS_NAMESPACE_MATCHER);
  if (match) {
    const id = match[0];
    const name = match[0].split('/').pop() as string;
    return {
      id,
      name,
    };
  }
}

export async function fetchServiceBusSubscriptions(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ServiceBusClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: ServiceBusEntities.TOPIC._type },
    async (topicEntity) => {
      const topicId = topicEntity.id as string;
      const topicName = topicEntity.name as string;
      const namespace = getNamespaceFromTopicId(topicId);

      if (namespace) {
        await client.iterateTopicSubscriptions(
          namespace,
          topicName,
          async (subscription) => {
            const subscriptionEntity = createServiceBusSubscriptionEntity(
              webLinker,
              subscription,
            );
            await jobState.addEntity(subscriptionEntity);

            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.HAS,
                from: topicEntity,
                to: subscriptionEntity,
              }),
            );
          },
        );
      }
    },
  );
}

export const serviceBusSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: STEP_RM_SERVICE_BUS_NAMESPACES,
    name: 'Service Bus Namespaces',
    entities: [ServiceBusEntities.NAMESPACE],
    relationships: [ServiceBusRelationships.RESOURCE_GROUP_HAS_NAMESPACE],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchServiceBusNamespaces,
  },
  {
    id: STEP_RM_SERVICE_BUS_QUEUES,
    name: 'Service Bus Queues',
    entities: [ServiceBusEntities.QUEUE],
    relationships: [ServiceBusRelationships.NAMESPACE_HAS_QUEUE],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_SERVICE_BUS_NAMESPACES],
    executionHandler: fetchServiceBusQueues,
  },
  {
    id: STEP_RM_SERVICE_BUS_TOPICS,
    name: 'Service Bus Topics',
    entities: [ServiceBusEntities.TOPIC],
    relationships: [ServiceBusRelationships.NAMESPACE_HAS_TOPIC],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_SERVICE_BUS_NAMESPACES],
    executionHandler: fetchServiceBusTopics,
  },
  {
    id: STEP_RM_SERVICE_BUS_SUBSCRIPTIONS,
    name: 'Service Bus Topic Subscriptions',
    entities: [ServiceBusEntities.SUBSCRIPTION],
    relationships: [ServiceBusRelationships.TOPIC_HAS_SUBSCRIPTION],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_SERVICE_BUS_TOPICS],
    executionHandler: fetchServiceBusSubscriptions,
  },
];
