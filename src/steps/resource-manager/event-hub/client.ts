import {
  EventHubManagementClient, Eventhub
} from '@azure/arm-eventhub';
import {
  Client
} from '../../../azure/resource-manager/client';
import { IntegrationWarnEventName } from '@jupiterone/integration-sdk-core';

export class EventHubClient extends Client {
  /**
   * Retrieves all EventHub Namespaces data  from an Azure Subscription
   * @param callback A callback function to be called after retrieving an Event Grid Domain
   * @returns A promise that resolves to an array of EHNamespace objects
   */
  /**
   * Retrieves all Event Hub Namespaces from an Azure Subscription
   * @param subscriptionId Azure subscription ID
   * @param callback A callback function to be called after retrieving an Event Hub Namespace
   */
  public async iterateEventHubNamespaces(
    subscriptionId: string,
    callback: (namespace) => void | Promise<void>,
  ): Promise<void> {
    const credential = this.getClientSecretCredentials();
    const client = new EventHubManagementClient(credential, subscriptionId);

    try {
      for await (const namespace of client.namespaces.list()) {
        await callback(namespace);
      }
    } catch (err) {
      if (err.statusCode === 403) {
        this.logger.warn({ err }, err.message);
        this.logger.publishWarnEvent({
          name: IntegrationWarnEventName.MissingPermission,
          description: err.message,
        });
      } else {
        throw err;
      }
    }
  }

  /**
   * Retrieves all EventHub data for a Resource Group from an Azure Subscription
   * @param callback A callback function to be called after retrieving an Event Grid Domain
   * @returns A promise that resolves to an array of EHNamespace objects
   */
  public async iterateEventHubCluster(
    subscriptionId: string,
    callback: (cluster) => void | Promise<void>,
  ): Promise<void> {
    const credential = this.getClientSecretCredentials();
    const serviceClient = new EventHubManagementClient(
      credential,
      subscriptionId,
    );

    try {
      for await (const cluster of serviceClient.clusters.listBySubscription()) {
        await callback(cluster);
      }
    } catch (err) {
      if (err.statusCode === 403) {
        this.logger.warn({ err }, err.message);
        this.logger.publishWarnEvent({
          name: IntegrationWarnEventName.MissingPermission,
          description: err.message,
        });
      } else {
        throw err;
      }
    }
  }

  /**
   * Retrieves all EventHub data for a Resource Group from an Azure Subscription
   * @param callback A callback function to be called after retrieving an Event Grid Domain
   * @returns A promise that resolves to an array of EHNamespace objects
   */
  public async iterateAzureConsumerGroup(
    subscriptionId: string,
    resourceGroupName: string,
    namespaceName: string,
    eventHubName: string,
    callback: (consumerGroups) => void | Promise<void>,
  ): Promise<void> {
    const credential = this.getClientSecretCredentials();
    const serviceClient = new EventHubManagementClient(
      credential,
      subscriptionId,
    );

    try {
      for await (const consumerGroup of serviceClient.consumerGroups.listByEventHub(
        resourceGroupName,
        namespaceName,
        eventHubName,
      )) {
        await callback(consumerGroup);
      }
    } catch (err) {
      if (err.statusCode === 403) {
        this.logger.warn({ err }, err.message);
        this.logger.publishWarnEvent({
          name: IntegrationWarnEventName.MissingPermission,
          description: err.message,
        });
      } else {
        throw err;
      }
    }
  }

  /**
   * Retrieves all EventHub data for a Resource Group from an Azure Subscription
   * @param callback A callback function to be called after retrieving an Event Grid Domain
   * @returns A promise that resolves to an array of EHNamespace objects
   */
  public async iterateEventHubs(
    subscriptionId: string,
    resourceGroupName: string,
    namespaceName: string,
    callback: (eventHubs: Eventhub) => void | Promise<void>,
  ): Promise<void> {
    const credential = this.getClientSecretCredentials();
    const client = new EventHubManagementClient(credential, subscriptionId);

    try {
      for await (const eventHub of client.eventHubs.listByNamespace(
        resourceGroupName,
        namespaceName,
      )) {
        await callback(eventHub);
      }
    } catch (err) {
      if (err.statusCode === 403) {
        this.logger.warn({ err }, err.message);
        this.logger.publishWarnEvent({
          name: IntegrationWarnEventName.MissingPermission,
          description: err.message,
        });
      } else {
        throw err;
      }
    }
  }
}
