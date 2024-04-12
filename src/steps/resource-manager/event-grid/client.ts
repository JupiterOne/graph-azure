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
} from '../../../azure/resource-manager/client';

export class EventGridClient extends Client {
  /**
   * Retrieves all Event Grid Domains for a Resource Group from an Azure Subscription
   * @param domainInfo An object containing information about the domain to retrieve like the Resource Group name belonging to an Azure Subscription
   * @param callback A callback function to be called after retrieving an Event Grid Domain
   */
  public async iterateDomains(
    domainInfo: { resourceGroupName: string },
    callback: (s: Domain) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      EventGridManagementClient,
    );

    const { resourceGroupName } = domainInfo;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () =>
          serviceClient.domains.listByResourceGroup(resourceGroupName),
        listNext: serviceClient.domains.listByResourceGroupNext,
      },
      resourceDescription: 'eventGrid.domain',
      callback,
    });
  }

  /**
   * Retrieves all Event Grid Domain Topics for an Event Grid Domain
   * @param domainInfo An object containing information about the domain to retrieve like the Resource Group and Event Grid Domain
   * @param callback A callback function to be called after retrieving an Event Grid Domain Topic
   */
  public async iterateDomainTopics(
    domainInfo: { resourceGroupName: string; domainName: string },
    callback: (s: DomainTopic) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      EventGridManagementClient,
    );

    const { resourceGroupName, domainName } = domainInfo;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () =>
          serviceClient.domainTopics.listByDomain(
            resourceGroupName,
            domainName,
          ),
        listNext: serviceClient.domainTopics.listByDomainNext,
      },
      resourceDescription: 'eventGrid.domainTopic',
      callback,
    });
  }

  /**
   * Retrieves all Event Grid Domain Topic Subscriptions for an Event Grid Domain Topic
   * @param domainTopicInfo An object containing information about the Domain Topic. Should include the Resource Group name, Event Grid Domain name, and Event Grid Domain Topic name
   * @param callback A callback function to be called after retrieving an Event Grid Domain Topic Subscription
   */
  public async iterateDomainTopicSubscriptions(
    domainTopicInfo: {
      resourceGroupName: string;
      domainTopicName: string;
      domainName: string;
    },
    callback: (s: EventSubscription) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      EventGridManagementClient,
    );

    const { resourceGroupName, domainName, domainTopicName } = domainTopicInfo;

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
        listNext: serviceClient.eventSubscriptions.listByDomainTopicNext,
      },
      resourceDescription: 'eventGrid.domainTopicSubscription',
      callback,
    });
  }

  /**
   * Retrieves all Event Grid Topics for a Resource Group from an Azure Subscription
   * @param resourceGroupInfo An object containing information about the Resource Group. It should include the Resource Group name.
   * @param callback A callback function to be called after retrieving an Event Grid Topic
   */
  public async iterateTopics(
    resourceGroupInfo: { resourceGroupName: string },
    callback: (s: Topic) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      EventGridManagementClient,
    );

    const { resourceGroupName } = resourceGroupInfo;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () =>
          serviceClient.topics.listByResourceGroup(resourceGroupName),
        listNext: serviceClient.topics.listByResourceGroupNext,
      },
      resourceDescription: 'eventGrid.topic',
      callback,
    });
  }

  /**
   * Retrieves all Event Grid Topic Subscriptions for an Event Grid Topic
   * @param topicInfo An object containing information about the Event Grid Topic. Should include the Resource Group name, Event Grid Topic name, Event Grid Topic type, and the name of the Event Grid Topic provider
   * @param callback A callback function to be called after retrieving an Event Grid Topic Subscription
   */
  public async iterateTopicSubscriptions(
    topicInfo: {
      resourceGroupName: string;
      topicName: string;
      topicType: string;
      providerNamespace: string;
    },
    callback: (s: EventSubscription) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      EventGridManagementClient,
    );

    const { resourceGroupName, topicName, topicType, providerNamespace } =
      topicInfo;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () =>
          serviceClient.eventSubscriptions.listByResource(
            resourceGroupName,
            providerNamespace,
            topicType,
            topicName,
          ),
        listNext: serviceClient.eventSubscriptions.listByResourceNext,
      },
      resourceDescription: 'eventGrid.topicSubscription',
      callback,
    });
  }
}
