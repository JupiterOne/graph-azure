import { ServiceBusManagementClient } from '@azure/arm-servicebus';
import {
  SBNamespace,
  SBQueue,
  SBTopic,
  SBSubscription,
} from '@azure/arm-servicebus/esm/models';
import {
  Client,
  iterateAllResources,
  ListResourcesEndpoint,
} from '../../../azure/resource-manager/client';
import { resourceGroupName } from '../../../azure/utils';

export class ServiceBusClient extends Client {
  public async iterateNamespaces(
    callback: (s: SBNamespace) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      ServiceBusManagementClient,
    );

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.namespaces,
      resourceDescription: 'serviceBus.namespace',
      callback,
    });
  }

  public async iterateQueues(
    namespace: { name: string; id: string },
    callback: (s: SBQueue) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      ServiceBusManagementClient,
    );
    const resourceGroup = resourceGroupName(namespace.id, true)!;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => {
          return serviceClient.queues.listByNamespace(
            resourceGroup,
            namespace.name,
          );
        },
        listNext: /* istanbul ignore next: testing iteration might be difficult */ async (
          nextLink: string,
        ) => {
          return serviceClient.queues.listByNamespaceNext(nextLink);
        },
      } as ListResourcesEndpoint,
      resourceDescription: 'serviceBus.queue',
      callback,
    });
  }

  public async iterateTopics(
    namespace: { name: string; id: string },
    callback: (s: SBTopic) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      ServiceBusManagementClient,
    );
    const resourceGroup = resourceGroupName(namespace.id, true)!;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => {
          return serviceClient.topics.listByNamespace(
            resourceGroup,
            namespace.name,
          );
        },
        listNext: /* istanbul ignore next: testing iteration might be difficult */ async (
          nextLink: string,
        ) => {
          return serviceClient.topics.listByNamespaceNext(nextLink);
        },
      } as ListResourcesEndpoint,
      resourceDescription: 'serviceBus.topic',
      callback,
    });
  }

  public async iterateTopicSubscriptions(
    namespace: { name: string; id: string },
    topicName: string,
    callback: (s: SBSubscription) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      ServiceBusManagementClient,
    );
    const resourceGroup = resourceGroupName(namespace.id, true)!;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => {
          return serviceClient.subscriptions.listByTopic(
            resourceGroup,
            namespace.name,
            topicName,
          );
        },
        listNext: /* istanbul ignore next: testing iteration might be difficult */ async (
          nextLink: string,
        ) => {
          return serviceClient.topics.listByNamespaceNext(nextLink);
        },
      } as ListResourcesEndpoint,
      resourceDescription: 'serviceBus.topic.subscription',
      callback,
    });
  }
}
