import { NetworkManagementClient } from "@azure/arm-network";
import {
  LoadBalancer,
  NetworkInterface,
  NetworkSecurityGroup,
  PublicIPAddress,
  VirtualNetwork,
} from "@azure/arm-network/esm/models";

import {
  Client,
  iterateAllResources,
} from "../../../azure/resource-manager/client";

export class NetworkClient extends Client {
  public async iterateNetworkInterfaces(
    callback: (nic: NetworkInterface) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      NetworkManagementClient,
    );
    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.networkInterfaces,
      resourceDescription: "network.networkInterfaces",
      callback,
    });
  }

  public async iteratePublicIPAddresses(
    callback: (ip: PublicIPAddress) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      NetworkManagementClient,
    );
    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.publicIPAddresses,
      resourceDescription: "network.publicIPAddresses",
      callback,
    });
  }

  /* istanbul ignore next: core functionality covered by other tests */
  public async iterateLoadBalancers(
    callback: (lb: LoadBalancer) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      NetworkManagementClient,
    );
    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.loadBalancers,
      resourceDescription: "network.loadBalancers",
      callback,
    });
  }

  public async iterateNetworkSecurityGroups(
    callback: (sg: NetworkSecurityGroup) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      NetworkManagementClient,
    );
    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.networkSecurityGroups,
      resourceDescription: "network.networkSecurityGroups",
      callback,
    });
  }

  public async iterateVirtualNetworks(
    callback: (vnet: VirtualNetwork) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      NetworkManagementClient,
    );
    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.virtualNetworks,
      resourceDescription: "network.virtualNetworks",
      callback,
    });
  }
}
