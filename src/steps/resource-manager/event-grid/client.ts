import { EventGridManagementClient } from '@azure/arm-eventgrid';
import {
  Domain,
  DomainTopic,
  EventSubscription,
  Topic,
} from '@azure/arm-eventgrid/esm/models';
import {
  Client,
  iterateAllResources,
  ListResourcesEndpoint,
} from '../../../azure/resource-manager/client';
import { resourceGroupName } from '../../../azure/utils';

export class EventGridClient extends Client {
  public async iterateDomains(
    resourceGroup: { name: string },
    callback: (s: Domain) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      EventGridManagementClient,
    );

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () =>
          serviceClient.domains.listByResourceGroup(resourceGroup.name),
        listNext: async (nextLink: string) =>
          serviceClient.domains.listByResourceGroupNext(nextLink),
      } as ListResourcesEndpoint,
      resourceDescription: 'eventGrid.domain',
      callback,
    });
  }

  public async iterateDomainTopics(
    domain: { id: string; name: string },
    callback: (s: DomainTopic) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      EventGridManagementClient,
    );
    const resourceGroup = resourceGroupName(domain.id, true)!;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () =>
          serviceClient.domainTopics.listByDomain(resourceGroup, domain.name),
        linkNext: async (nextLink: string) =>
          serviceClient.domainTopics.listByDomainNext(nextLink),
      } as ListResourcesEndpoint,
      resourceDescription: 'eventGrid.domainTopic',
      callback,
    });
  }

  public async iterateDomainTopicSubscriptions(
    domainTopic: {
      resourceGroupName: string;
      domainTopicName: string;
      domainName: string;
    },
    callback: (s: EventSubscription) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      EventGridManagementClient,
    );

    const { resourceGroupName, domainName, domainTopicName } = domainTopic;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () =>
          serviceClient.eventSubscriptions.listByDomainTopic(
            resourceGroupName,
            domainName,
            domainTopicName,
          ),
        linkNext: async (nextLink: string) =>
          serviceClient.eventSubscriptions.listByDomainTopicNext(nextLink),
      } as ListResourcesEndpoint,
      resourceDescription: 'eventGrid.subscription',
      callback,
    });
  }

  public async iterateTopics(
    resourceGroup: { name: string },
    callback: (s: Topic) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      EventGridManagementClient,
    );

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () =>
          serviceClient.topics.listByResourceGroup(resourceGroup.name),
        linkNext: async (nextLink: string) =>
          serviceClient.topics.listByResourceGroupNext(nextLink),
      } as ListResourcesEndpoint,
      resourceDescription: 'eventGrid.topic',
      callback,
    });
  }

  public async iterateTopicSubscriptions(
    topic: { id: string; name: string; type: string },
    callback: (s: EventSubscription) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      EventGridManagementClient,
    );
    const resourceGroup = resourceGroupName(topic.id, true)!;
    const [providerNamespace, resourceType] = topic.type.split('/');

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () =>
          serviceClient.eventSubscriptions.listByResource(
            resourceGroup,
            providerNamespace,
            resourceType,
            topic.name,
          ),
        linkNext: async (nextLink: string) =>
          serviceClient.eventSubscriptions.listByResourceNext(nextLink),
      } as ListResourcesEndpoint,
      resourceDescription: 'eventGrid.subscription',
      callback,
    });
  }

  // TODO add iterateSubscriptions method
}
