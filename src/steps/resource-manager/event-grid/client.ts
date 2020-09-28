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

export class EventGridClient extends Client {
  /**
   * Retrieves all Event Grid Domains for a Resource Group from an Azure Subscription
   * @param resourceGroup A Resource Group belonging to an Azure Subscription
   * @param callback A callback function to be called after retrieving an Event Grid Domain
   */
  public async iterateDomains(
    resourceGroup: { name: string },
    callback: (s: Domain) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      EventGridManagementClient,
    );

    const { name } = resourceGroup;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => serviceClient.domains.listByResourceGroup(name),
        listNext: serviceClient.domains.listByResourceGroupNext,
      } as ListResourcesEndpoint,
      resourceDescription: 'eventGrid.domain',
      callback,
    });
  }

  /**
   * Retrieves all Event Grid Domain Topics for an Event Grid Domain
   * @param domain An Event Grid Domain
   * @param callback A callback function to be called after retrieving an Event Grid Domain Topic
   */
  public async iterateDomainTopics(
    domain: { resourceGroupName: string; name: string },
    callback: (s: DomainTopic) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      EventGridManagementClient,
    );

    const { resourceGroupName, name } = domain;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () =>
          serviceClient.domainTopics.listByDomain(resourceGroupName, name),
        listNext: serviceClient.domainTopics.listByDomainNext,
      } as ListResourcesEndpoint,
      resourceDescription: 'eventGrid.domainTopic',
      callback,
    });
  }

  /**
   * Retrieves all Event Grid Domain Topic Subscriptions for an Event Grid Domain Topic
   * @param domainTopic An Event Grid Domain Topic
   * @param callback A callback function to be called after retrieving an Event Grid Domain Topic Subscription
   */
  public async iterateDomainTopicSubscriptions(
    domainTopic: {
      resourceGroupName: string;
      name: string;
      domainName: string;
    },
    callback: (s: EventSubscription) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      EventGridManagementClient,
    );

    const { resourceGroupName, domainName, name } = domainTopic;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () =>
          serviceClient.eventSubscriptions.listByDomainTopic(
            resourceGroupName,
            domainName,
            name,
          ),
        listNext: serviceClient.eventSubscriptions.listByDomainTopicNext,
      } as ListResourcesEndpoint,
      resourceDescription: 'eventGrid.domainTopicSubscription',
      callback,
    });
  }

  /**
   * Retrieves all Event Grid Topics for a Resource Group from an Azure Subscription
   * @param resourceGroup A Resource Group belonging to an Azure Subscription
   * @param callback A callback function to be called after retrieving an Event Grid Topic
   */
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
        listNext: serviceClient.topics.listByResourceGroupNext,
      } as ListResourcesEndpoint,
      resourceDescription: 'eventGrid.topic',
      callback,
    });
  }

  /**
   * Retrieves all Event Grid Topic Subscriptions for an Event Grid Topic
   * @param topic An Event Grid Topic
   * @param callback A callback function to be called after retrieving an Event Grid Topic Subscription
   */
  public async iterateTopicSubscriptions(
    topic: {
      resourceGroupName: string;
      name: string;
      type: string;
      providerNamespace: string;
    },
    callback: (s: EventSubscription) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      EventGridManagementClient,
    );

    const { resourceGroupName, name, type, providerNamespace } = topic;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () =>
          serviceClient.eventSubscriptions.listByResource(
            resourceGroupName,
            providerNamespace,
            type,
            name,
          ),
        listNext: serviceClient.eventSubscriptions.listByResourceNext,
      } as ListResourcesEndpoint,
      resourceDescription: 'eventGrid.topicSubscription',
      callback,
    });
  }
}
