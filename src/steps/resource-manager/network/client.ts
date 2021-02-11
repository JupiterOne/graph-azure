import { NetworkManagementClient } from '@azure/arm-network';
import {
  AzureFirewall,
  LoadBalancer,
  NetworkInterface,
  NetworkSecurityGroup,
  PublicIPAddress,
  VirtualNetwork,
} from '@azure/arm-network/esm/models';

import {
  Client,
  iterateAllResources,
} from '../../../azure/resource-manager/client';

export class NetworkClient extends Client {
  /**
   * Fetches all Azure Firewalls in an Azure Resource Group
   * @param resourceGroupName name of the Azure Resource Group
   * @param callback A callback function to be called after retrieving an Azure Firewall
   */
  public async iterateAzureFirewalls(
    resourceGroupName: string,
    callback: (azureFirewall: AzureFirewall) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      NetworkManagementClient,
    );

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => serviceClient.azureFirewalls.list(resourceGroupName),
        listNext: serviceClient.azureFirewalls.listNext,
      },
      resourceDescription: 'network.azureFirewalls',
      callback,
    });
  }

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
      resourceDescription: 'network.networkInterfaces',
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
      resourceDescription: 'network.publicIPAddresses',
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
      resourceDescription: 'network.loadBalancers',
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
      resourceDescription: 'network.networkSecurityGroups',
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
      resourceDescription: 'network.virtualNetworks',
      callback,
    });
  }
}
