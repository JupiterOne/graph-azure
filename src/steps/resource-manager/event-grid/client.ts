import { EventGridManagementClient } from '@azure/arm-eventgrid';
import { Domain, DomainTopic, Topic } from '@azure/arm-eventgrid/esm/models';
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

  // TODO add iterateSubscriptions method
}
