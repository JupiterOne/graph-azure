import { NetworkManagementClient } from '@azure/arm-network';
import {
  Client,
  iterateAllResources,
} from '../../../azure/resource-manager/client';

export class ExpressRouteClient extends Client {
  /**
   * Retrieves all ExpressRoute circuit data from an Azure Subscription
   * @param callback A callback function to be called after retrieving an ExpressRoute circuit
   * @returns A promise that resolves to an array of EHNamespace objects
   */
  public async iterateExpressRouteCircuit(
    callback: (s) => void | Promise<void>,
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
    callback: (s) => void | Promise<void>,
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
    callback: (s) => void | Promise<void>,
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
    callback: (s) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      NetworkManagementClient,
    );
    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.peerExpressRouteCircuitConnections,
      resourceDescription: 'peerExpressRouteCircuitConnections',
      callback,
    });
  }

  /**
   * Retrieves all application Gateways from an Azure Subscription
   * @param callback A callback function to be called after retrieving an BgpServiceCommunities
   * @returns A promise that resolves to an array of EHNamespace objects
   */
  public async iterateExpressRouteCrossConnection(
    callback: (s) => void | Promise<void>,
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
    callback: (s) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      NetworkManagementClient,
    );
    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.expressRouteCircuitConnections,
      resourceDescription: 'expressRouteCircuitConnections',
      callback,
    });
  }
}
