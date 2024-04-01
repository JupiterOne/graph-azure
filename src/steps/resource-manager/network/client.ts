import * as msRest from '@azure/ms-rest-js';
import { NetworkManagementClient } from '@azure/arm-network';
import {
  AzureFirewall,
  FirewallPolicy,
  FlowLog,
  LoadBalancer,
  NetworkInterface,
  NetworkSecurityGroup,
  NetworkWatcher,
  PrivateEndpoint,
  PublicIPAddress,
  VirtualNetwork,
} from '@azure/arm-network/esm/models';

import {
  Client,
  FIVE_MINUTES,
  iterateAllResources,
  request,
} from '../../../azure/resource-manager/client';
import { resourceGroupName } from '../../../azure/utils';
import * as Mappers from './mappers';
import * as Parameters from './parameters';
import { FirewallPolicyRuleCollectionGroup } from '@azure/arm-network-latest';
import { IntegrationWarnEventName } from '@jupiterone/integration-sdk-core';

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

  public async iterateFirewallPolicies(
    resourceGroupName: string,
    callback: (firewallPolicy: FirewallPolicy) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      NetworkManagementClient,
    );

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () =>
          serviceClient.firewallPolicies.list(resourceGroupName),
        listNext: serviceClient.firewallPolicies.listNext,
      },
      resourceDescription: 'network.firewallPolicies',
      callback,
    });
  }

  public async iterateFirewallPolicyRuleGroups(
    subscriptionId: string,
    resourceGroupName: string,
    policyName: string,
    callback: (
      firewallPolicyRuleCollectionGroup: FirewallPolicyRuleCollectionGroup,
    ) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      NetworkManagementClient,
    );
    try {
      let nextPageLink: string | undefined;
      do {
        const groups = await request(
          async () =>
            nextPageLink
              ? await serviceClient.sendOperationRequest(
                  {
                    resourceGroupName,
                    firewallPolicyName: policyName,
                    nextLink: nextPageLink,
                    subscriptionId,
                  },
                  listFirewallPolicyRuleCollectionGroupsNextOperationSpec,
                )
              : await serviceClient.sendOperationRequest(
                  {
                    resourceGroupName,
                    firewallPolicyName: policyName,
                    subscriptionId,
                  },
                  listFirewallPolicyRuleCollectionGroupsOperationSpec,
                ),
          this.logger,
          'firewallPolicyRuleCollectionGroups',
          FIVE_MINUTES,
        );
        for (const group of groups?.value || []) {
          await callback(group);
        }
        nextPageLink = groups?.nexLink;
      } while (nextPageLink);
    } catch (error) {
      if (error.status === 403) {
        this.logger.warn(
          { error: error.message, resourceUrl: resourceGroupName },
          'Encountered auth error in Azure Graph client.',
        );
        this.logger.publishWarnEvent({
          name: IntegrationWarnEventName.MissingPermission,
          description: `Received authorization error when attempting to call ${resourceGroupName}. Please update credentials to grant access.`,
        });
        return;
      } else {
        throw error;
      }
    }
  }

  public async iteratePrivateEndpoints(
    resourceGroupName: string,
    callback: (pe: PrivateEndpoint) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      NetworkManagementClient,
    );

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () =>
          serviceClient.privateEndpoints.list(resourceGroupName),
        listNext: async (nextPageLink: string) =>
          serviceClient.privateEndpoints.listNext(nextPageLink),
      },
      resourceDescription: 'network.privateEndpoints',
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

  public async iterateNetworkWatchers(
    resourceGroupName: string,
    callback: (watcher: NetworkWatcher) => void | Promise<void>,
  ) {
    const serviceClient = await this.getAuthenticatedServiceClient(
      NetworkManagementClient,
    );
    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => {
          return serviceClient.networkWatchers.list(resourceGroupName);
        },
      },
      resourceDescription: 'network.networkWatchers',
      callback,
    });
  }

  public async iterateNetworkSecurityGroupFlowLogs(
    networkWatcher: {
      name: string;
      id: string;
    },
    callback: (nsgFlowLog: FlowLog) => void | Promise<void>,
  ) {
    const serviceClient = await this.getAuthenticatedServiceClient(
      NetworkManagementClient,
    );
    const resourceGroup = resourceGroupName(networkWatcher.id, true)!;
    const networkWatcherName = networkWatcher.name;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => {
          return serviceClient.flowLogs.list(resourceGroup, networkWatcherName);
        },
        listNext:
          /* istanbul ignore next: testing iteration might be difficult */ async (
            nextLink: string,
          ) => {
            return serviceClient.flowLogs.listNext(nextLink);
          },
      },
      resourceDescription: 'network.networkSecurityGroupFlowLogs',
      callback,
    });
  }
}

const listFirewallPolicyRuleCollectionGroupsOperationSpec: msRest.OperationSpec =
  {
    path: '/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Network/firewallPolicies/{firewallPolicyName}/ruleCollectionGroups',
    httpMethod: 'GET',
    responses: {
      200: {
        bodyMapper: Mappers.FirewallPolicyRuleCollectionGroupListResult,
      },
      default: {
        bodyMapper: Mappers.CloudError,
      },
    },
    queryParameters: [Parameters.apiVersion],
    urlParameters: [
      Parameters.resourceGroupName,
      Parameters.subscriptionId,
      Parameters.firewallPolicyName,
    ],
    headerParameters: [Parameters.accept],
    serializer: new msRest.Serializer(Mappers, false),
  };
const listFirewallPolicyRuleCollectionGroupsNextOperationSpec: msRest.OperationSpec =
  {
    path: '{nextLink}',
    httpMethod: 'GET',
    responses: {
      200: {
        bodyMapper: Mappers.FirewallPolicyRuleCollectionGroupListResult,
      },
      default: {
        bodyMapper: Mappers.CloudError,
      },
    },
    urlParameters: [
      Parameters.resourceGroupName,
      Parameters.subscriptionId,
      Parameters.nextLink,
      Parameters.firewallPolicyName,
    ],
    headerParameters: [Parameters.accept],
    serializer: new msRest.Serializer(Mappers, false),
  };
