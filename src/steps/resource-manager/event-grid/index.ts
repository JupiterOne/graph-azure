import {
  Entity,
  Step,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { ACCOUNT_ENTITY_TYPE, STEP_AD_ACCOUNT } from '../../active-directory';
import {
  RESOURCE_GROUP_ENTITY,
  STEP_RM_RESOURCES_RESOURCE_GROUPS,
} from '../resources';
import createResourceGroupResourceRelationship from '../utils/createResourceGroupResourceRelationship';
import { EventGridClient } from './client';
import {
  EventGridEntities,
  EventGridRelationships,
  STEP_RM_EVENT_GRID_DOMAINS,
  STEP_RM_EVENT_GRID_DOMAIN_TOPICS,
  STEP_RM_EVENT_GRID_EVENT_SUBSCRIPTIONS,
  STEP_RM_EVENT_GRID_TOPICS,
} from './constants';

import {
  createEventGridDomainEntity,
  createEventGridDomainTopicEntity,
  createEventGridEventSubscriptionEntity,
  createEventGridTopicEntity,
} from './converters';

export * from './constants';

export async function fetchEventGridDomains(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new EventGridClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: RESOURCE_GROUP_ENTITY._type },
    async (resourceGroupEntity) => {
      await client.iterateDomains(
        (resourceGroupEntity as unknown) as { name: string },
        async (domain) => {
          const domainEntity = createEventGridDomainEntity(webLinker, domain);
          await jobState.addEntity(domainEntity);

          await jobState.addRelationship(
            await createResourceGroupResourceRelationship(
              executionContext,
              domainEntity,
            ),
          );
        },
      );
    },
  );
}

export async function fetchEventGridDomainTopics(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new EventGridClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: EventGridEntities.DOMAIN._type },
    async (domainEntity) => {
      await client.iterateDomainTopics(
        (domainEntity as unknown) as { id: string; name: string },
        async (domainTopic) => {
          const domainTopicEntity = createEventGridDomainTopicEntity(
            webLinker,
            domainTopic,
          );
          await jobState.addEntity(domainTopicEntity);

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: domainEntity,
              to: domainTopicEntity,
            }),
          );
        },
      );
    },
  );
}

export async function fetchEventGridTopics(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new EventGridClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: RESOURCE_GROUP_ENTITY._type },
    async (resourceGroupEntity) => {
      await client.iterateTopics(
        (resourceGroupEntity as unknown) as { name: string },
        async (topic) => {
          const topicEntity = createEventGridTopicEntity(webLinker, topic);
          await jobState.addEntity(topicEntity);

          await jobState.addRelationship(
            await createResourceGroupResourceRelationship(
              executionContext,
              topicEntity,
            ),
          );
        },
      );
    },
  );
}

// TODO: add fetchEventGridSubscriptions function

export const eventGridSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: STEP_RM_EVENT_GRID_DOMAINS,
    name: 'Event Grid Domains',
    entities: [EventGridEntities.DOMAIN],
    relationships: [EventGridRelationships.RESOURCE_GROUP_HAS_DOMAIN],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchEventGridDomains,
  },
  {
    id: STEP_RM_EVENT_GRID_DOMAIN_TOPICS,
    name: 'Event Grid Domain Topics',
    entities: [EventGridEntities.DOMAIN_TOPIC],
    relationships: [EventGridRelationships.DOMAIN_HAS_DOMAIN_TOPIC],
    dependsOn: [
      STEP_AD_ACCOUNT,
      STEP_RM_RESOURCES_RESOURCE_GROUPS,
      STEP_RM_EVENT_GRID_DOMAINS,
    ],
    executionHandler: fetchEventGridDomainTopics,
  },
  // TODO: Subscriptions? Global? regional? account? resource group? domain topic?

  // TODO: Are topics by event subscriptions? regional? global? account subscription?
  {
    id: STEP_RM_EVENT_GRID_TOPICS,
    name: 'Event Grid Topics',
    entities: [EventGridEntities.TOPIC],
    relationships: [EventGridRelationships.RESOURCE_GROUP_HAS_TOPIC],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchEventGridTopics,
  },
];
