import { NetworkManagementClient } from '@azure/arm-network';
import {
  Client,
  iterateAllResources,
} from '../../../azure/resource-manager/client';
import { IntegrationWarnEventName } from '@jupiterone/integration-sdk-core';
import { EventHubManagementClient } from '@azure/arm-eventhub';
import { ApplicationGateway, BgpServiceCommunity, ExpressRouteCircuit, ExpressRouteCircuitConnection, ExpressRouteCrossConnection, PeerExpressRouteCircuitConnection } from '@azure/arm-network-latest';

export class ExpressRouteClient extends Client {
  /**
   * Retrieves all ExpressRoute circuit data from an Azure Subscription
   * @param callback A callback function to be called after retrieving an ExpressRoute circuit
   * @returns A promise that resolves to an array of EHNamespace objects
   */
  public async iterateExpressRouteCircuit(
    callback: (s: ExpressRouteCircuit) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      NetworkManagementClient,
    );
    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.expressRouteCircuits,
      resourceDescription: 'expressRouteCircuits',
      callback,
    });
  }

  /**
   * Retrieves all BGP service communities from an Azure Subscription
   * @param callback A callback function to be called after retrieving an BgpServiceCommunities
   * @returns A promise that resolves to an array of EHNamespace objects
   */
  public async iterateBgpServiceCommunities(
    callback: (s: BgpServiceCommunity) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      NetworkManagementClient,
    );
    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.bgpServiceCommunities,
      resourceDescription: 'bgpServiceCommunities',
      callback,
    });
  }

  /**
   * Retrieves all application Gateways from an Azure Subscription
   * @param callback A callback function to be called after retrieving an BgpServiceCommunities
   * @returns A promise that resolves to an array of EHNamespace objects
   */
  public async iterateApplicationGateway(
    callback: (s: ApplicationGateway) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      NetworkManagementClient,
    );
    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.applicationGateways,
      resourceDescription: 'applicationGateways',
      callback,
    });
  }

  /**
   * Retrieves all application Gateways from an Azure Subscription
   * @param callback A callback function to be called after retrieving an BgpServiceCommunities
   * @returns A promise that resolves to an array of EHNamespace objects
   */
  public async iteratePeerExpressRouteConnection(
    resourceGroup,
    circuitName,
    callback: (s: PeerExpressRouteCircuitConnection) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      NetworkManagementClient,
    );
    try {
      for (const expressRouteCircuitConnection of await serviceClient.peerExpressRouteCircuitConnections.list(
        resourceGroup,
        circuitName,
        "AzurePrivatePeering",
      )) {
        await callback(expressRouteCircuitConnection);
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
   * Retrieves all application Gateways from an Azure Subscription
   * @param callback A callback function to be called after retrieving an BgpServiceCommunities
   * @returns A promise that resolves to an array of EHNamespace objects
   */
  public async iterateExpressRouteCrossConnection(
    callback: (s: ExpressRouteCrossConnection) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      NetworkManagementClient,
    );
    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.expressRouteCrossConnections,
      resourceDescription: 'expressRouteCrossConnections',
      callback,
    });
  }

  /**
   * Retrieves all application Gateways from an Azure Subscription
   * @param callback A callback function to be called after retrieving an BgpServiceCommunities
   * @returns A promise that resolves to an array of EHNamespace objects
   */
  public async iterateExpressRouteCircuitConnection(
    resourceGroupName,
    circuitName,
    peeringName,
    callback: (s: ExpressRouteCircuitConnection) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      NetworkManagementClient,
    );
    try {
      for (const expressRouteCircuitConnection of await serviceClient.expressRouteCircuitConnections.list(
        resourceGroupName,
        circuitName,
        peeringName,
      )) {
        await callback(expressRouteCircuitConnection);
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
    callback: (eventHubs) => void | Promise<void>,
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
