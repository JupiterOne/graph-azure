/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { ComputeManagementClient } from "@azure/arm-compute";
import { VirtualMachine } from "@azure/arm-compute/esm/models";
import { NetworkManagementClient } from "@azure/arm-network";
import {
  NetworkInterface,
  NetworkSecurityGroup,
  PublicIPAddress,
  VirtualNetwork,
} from "@azure/arm-network/esm/models";
import { StorageManagementClient } from "@azure/arm-storage";
import { BlobContainer, StorageAccount } from "@azure/arm-storage/esm/models";
import { AzureServiceClient } from "@azure/ms-rest-azure-js";
import { ServiceClientCredentials } from "@azure/ms-rest-js";

import { AzureIntegrationInstanceConfig } from "../../types";
import { resourceGroupName } from "../utils";
import authenticate from "./authenticate";
import { AzureManagementClientCredentials } from "./types";

interface ClientConstructor<T extends AzureServiceClient> {
  new (credentials: ServiceClientCredentials, subscriptionId: string): T;
}

interface ResourceManagementModule {
  listAll: <L>() => Promise<L>;
  listAllNext: <L>(nextLink: string) => Promise<L>;
}

interface ScopedResourceManagementModule {
  list<L>(): Promise<L>;
  listNext<L>(nextLink: string): Promise<L>;
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
    callback: (nic: NetworkInterface) => void,
  ): Promise<void> {
    const client = await this.getAuthenticatedClient(NetworkManagementClient);
    return this.iterateAllResources(client.networkInterfaces, callback);
  }

  public async iterateVirtualMachines(
    callback: (vm: VirtualMachine) => void,
  ): Promise<void> {
    const client = await this.getAuthenticatedClient(ComputeManagementClient);
    return this.iterateAllResources(client.virtualMachines, callback);
  }

  public async iterateVirtualNetworks(
    callback: (vnet: VirtualNetwork) => void,
  ): Promise<void> {
    const client = await this.getAuthenticatedClient(NetworkManagementClient);
    return this.iterateAllResources(client.virtualNetworks, callback);
  }

  public async iterateNetworkSecurityGroups(
    callback: (sg: NetworkSecurityGroup) => void,
  ): Promise<void> {
    const client = await this.getAuthenticatedClient(NetworkManagementClient);
    return this.iterateAllResources(client.networkSecurityGroups, callback);
  }

  public async iterateStorageAccounts(
    callback: (sa: StorageAccount) => void | Promise<void>,
  ): Promise<void> {
    const client = await this.getAuthenticatedClient(StorageManagementClient);
    return this.iterateScopedResources(client.storageAccounts, callback);
  }

  public async iterateStorageBlobContainers(
    storageAccount: StorageAccount,
    callback: (e: BlobContainer) => void,
  ): Promise<void> {
    const client = await this.getAuthenticatedClient(StorageManagementClient);
    const resourceGroup = resourceGroupName(storageAccount.id, true)!;
    const accountName = storageAccount.name!;

    return this.iterateScopedResources(
      {
        list: async () => {
          return client.blobContainers.list(resourceGroup, accountName);
        },
        listNext: /* istanbul ignore next: testing iteration might be difficult */ async (
          nextLink: string,
        ) => {
          return client.blobContainers.listNext(nextLink);
        },
      } as any,
      callback,
    );
  }

  public async iteratePublicIPAddresses(
    callback: (ip: PublicIPAddress) => void,
  ): Promise<void> {
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

  /**
   * Iterate ALL resources of a `ResourceManagementModule`. These are Azure
   * Resource Node modules that that support a `listAll` function.
   *
   * @param rmModule a module that supports listAll() and listAllNext()
   * @param callback a function to receive each resource throughout pagination
   */

  private async iterateAllResources<T, L extends ResourceListResponse<T>>(
    rmModule: ResourceManagementModule,
    callback: (r: T) => void | Promise<void>,
  ): Promise<void> {
    let nextLink: string | undefined;
    do {
      const response = nextLink
        ? /* istanbul ignore next: testing iteration might be difficult */
          await rmModule.listAllNext<L>(nextLink)
        : await rmModule.listAll<L>();

      for (const e of response) {
        await callback(e);
      }

      nextLink = response.nextLink;
    } while (nextLink);
  }

  /**
   * Iterate resources of a `ScopedResourceManagementModule`. These are Azure
   * Resource Node modules that do not support a `listAll` function.
   *
   * @param rmModule a module that supports list() and listNext()
   * @param callback a function to receive each resource throughout pagination
   */
  private async iterateScopedResources<T, L extends ResourceListResponse<T>>(
    rmModule: ScopedResourceManagementModule,
    callback: (r: T) => void | Promise<void>,
  ): Promise<void> {
    let nextLink: string | undefined;
    do {
      const response = nextLink
        ? /* istanbul ignore next: testing iteration might be difficult */
          await rmModule.listNext<L>(nextLink)
        : await rmModule.list<L>();

      for (const e of response) {
        await callback(e);
      }

      nextLink = response.nextLink;
    } while (nextLink);
  }
}
