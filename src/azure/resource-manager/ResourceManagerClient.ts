import { ComputeManagementClient } from "@azure/arm-compute";
import { VirtualMachine } from "@azure/arm-compute/esm/models";
import { NetworkManagementClient } from "@azure/arm-network";
import {
  NetworkInterface,
  PublicIPAddress,
  VirtualNetwork,
} from "@azure/arm-network/esm/models";
import { ServiceClientCredentials } from "@azure/ms-rest-js";

import { AzureIntegrationInstanceConfig } from "../../types";
import authenticate from "./authenticate";
import { AzureManagementClientCredentials } from "./types";
import { AzureServiceClient } from "@azure/ms-rest-azure-js";

interface ClientConstructor<T extends AzureServiceClient> {
  new (credentials: ServiceClientCredentials, subscriptionId: string): T;
}

interface ResourceManagementModule {
  listAll: <L>() => Promise<L>;
  listAllNext: <L>(nextLink: string) => Promise<L>;
}

interface ResourceListResponse<T> extends Array<T> {
  readonly nextLink?: string;
}

export default class ResourceManagerClient {
  private auth: AzureManagementClientCredentials;
  private clientCache: Map<
    ClientConstructor<AzureServiceClient>,
    AzureServiceClient
  >;

  constructor(private config: AzureIntegrationInstanceConfig) {
    this.clientCache = new Map();
  }

  public async iterateNetworkInterfaces(
    callback: (vm: NetworkInterface) => void,
  ) {
    const client = await this.getAuthenticatedClient(NetworkManagementClient);
    return this.iterateAllResources(client.networkInterfaces, callback);
  }

  public async iterateVirtualMachines(callback: (vm: VirtualMachine) => void) {
    const client = await this.getAuthenticatedClient(ComputeManagementClient);
    return this.iterateAllResources(client.virtualMachines, callback);
  }

  public async iterateVirtualNetworks(callback: (vm: VirtualNetwork) => void) {
    const client = await this.getAuthenticatedClient(NetworkManagementClient);
    return this.iterateAllResources(client.virtualNetworks, callback);
  }

  public async iteratePublicIPAddresses(
    callback: (vm: PublicIPAddress) => void,
  ) {
    const client = await this.getAuthenticatedClient(NetworkManagementClient);
    return this.iterateAllResources(client.publicIPAddresses, callback);
  }

  private async getAuthenticatedClient<T extends AzureServiceClient>(
    ctor: ClientConstructor<T>,
  ): Promise<T> {
    let client = this.clientCache.get(ctor);
    if (!client) {
      client = await this.createAuthenticatedClient(ctor, this.config);
      this.clientCache.set(ctor, client);
    }
    return client as T;
  }

  private async createAuthenticatedClient<T extends AzureServiceClient>(
    ctor: ClientConstructor<T>,
    config: AzureIntegrationInstanceConfig,
  ): Promise<T> {
    if (!this.auth) {
      this.auth = await authenticate(config);
    }
    return new ctor(this.auth.credentials, this.auth.subscriptionId);
  }

  private async iterateAllResources<T, L extends ResourceListResponse<T>>(
    rmModule: ResourceManagementModule,
    callback: (r: T) => void,
  ) {
    let nextLink: string | undefined;
    do {
      const response = nextLink
        ? /* istanbul ignore next: testing iteration might be difficult */
          await rmModule.listAllNext<L>(nextLink)
        : await rmModule.listAll<L>();

      for (const e of response) {
        callback(e);
      }

      nextLink = response.nextLink;
    } while (nextLink);
  }
}
