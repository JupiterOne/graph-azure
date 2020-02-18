/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { ComputeManagementClient } from "@azure/arm-compute";
import {
  VirtualMachine,
  VirtualMachineImage,
  Disk,
} from "@azure/arm-compute/esm/models";
import { MariaDBManagementClient } from "@azure/arm-mariadb";
import {
  Database as MariaDBDatabase,
  Server as MariaDBServer,
} from "@azure/arm-mariadb/esm/models";
import { MySQLManagementClient } from "@azure/arm-mysql";
import {
  Database as MySQLDatabase,
  Server as MySQLServer,
} from "@azure/arm-mysql/esm/models";
import { NetworkManagementClient } from "@azure/arm-network";
import {
  NetworkInterface,
  NetworkSecurityGroup,
  PublicIPAddress,
  VirtualNetwork,
} from "@azure/arm-network/esm/models";
import { PostgreSQLManagementClient } from "@azure/arm-postgresql";
import {
  Database as PostgreSQLDatabase,
  Server as PostgreSQLServer,
} from "@azure/arm-postgresql/esm/models";
import { SqlManagementClient } from "@azure/arm-sql";
import {
  Database as SQLDatabase,
  Server as SQLServer,
} from "@azure/arm-sql/esm/models";
import { StorageManagementClient } from "@azure/arm-storage";
import { BlobContainer, StorageAccount } from "@azure/arm-storage/esm/models";
import { HttpResponse, RequestPolicyFactory } from "@azure/ms-rest-js";
import { IntegrationLogger } from "@jupiterone/jupiter-managed-integration-sdk";

import { AzureIntegrationInstanceConfig } from "../../types";
import { resourceGroupName } from "../utils";
import authenticate from "./authenticate";
import { bunyanLogPolicy } from "./BunyanLogPolicy";
import { AzureManagementClientCredentials } from "./types";

interface ResourceManagementModule {
  listAll: <L>() => Promise<L>;
  listAllNext: <L>(nextLink: string) => Promise<L>;
}

interface ScopedResourceManagementModule {
  list<L>(): Promise<L>;
  listNext<L>(nextLink: string): Promise<L>;
}

interface ResourceListResponse<T> extends Array<T> {
  readonly _response: HttpResponse;
  readonly nextLink?: string;
}

export default class ResourceManagerClient {
  private auth: AzureManagementClientCredentials;
  private clientCache: Map<any, any>;

  constructor(
    private config: AzureIntegrationInstanceConfig,
    readonly logger: IntegrationLogger,
  ) {
    this.clientCache = new Map();
  }

  //// Compute and Network ////

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

  public async iterateVirtualMachineImages(
    callback: (i: VirtualMachineImage) => void,
  ): Promise<void> {
    const client = await this.getAuthenticatedClient(ComputeManagementClient);
    return this.iterateScopedResources(client.images, callback);
  }

  public async iterateVirtualMachineDisks(
    callback: (d: Disk) => void,
  ): Promise<void> {
    const client = await this.getAuthenticatedClient(ComputeManagementClient);
    const items = await client.disks.list();
    for (const item of items) {
      callback(item);
    }
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

  public async iteratePublicIPAddresses(
    callback: (ip: PublicIPAddress) => void,
  ): Promise<void> {
    const client = await this.getAuthenticatedClient(NetworkManagementClient);
    return this.iterateAllResources(client.publicIPAddresses, callback);
  }

  //// Storage ////

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

  //// Databases ////

  public async iterateSqlServers(
    callback: (s: SQLServer) => void,
  ): Promise<void> {
    const client = await this.getAuthenticatedClient(SqlManagementClient);
    return this.iterateScopedResources(client.servers, callback);
  }

  public async iterateSqlDatabases(
    server: SQLServer,
    callback: (d: SQLDatabase) => void,
  ): Promise<void> {
    const client = await this.getAuthenticatedClient(SqlManagementClient);
    const resourceGroup = resourceGroupName(server.id, true)!;
    const serverName = server.name!;

    return this.iterateScopedResources(
      {
        list: async () => {
          return client.databases.listByServer(resourceGroup, serverName);
        },
      } as any,
      callback,
    );
  }

  public async iterateMySqlServers(
    callback: (s: MySQLServer) => void,
  ): Promise<void> {
    const client = await this.getAuthenticatedClient(MySQLManagementClient);
    const servers = await client.servers.list();
    for (const server of servers) {
      callback(server);
    }
  }

  public async iterateMySqlDatabases(
    server: MySQLServer,
    callback: (d: MySQLDatabase) => void,
  ): Promise<void> {
    const client = await this.getAuthenticatedClient(MySQLManagementClient);
    const resourceGroup = resourceGroupName(server.id, true)!;
    const serverName = server.name!;

    return this.iterateScopedResources(
      {
        list: async () => {
          return client.databases.listByServer(resourceGroup, serverName);
        },
      } as any,
      callback,
    );
  }

  public async iterateMariaDbServers(
    callback: (s: MariaDBServer) => void,
  ): Promise<void> {
    const client = await this.getAuthenticatedClient(MariaDBManagementClient);
    const servers = await client.servers.list();
    for (const server of servers) {
      callback(server);
    }
  }

  public async iterateMariaDbDatabases(
    server: PostgreSQLServer,
    callback: (d: MariaDBDatabase) => void,
  ): Promise<void> {
    const client = await this.getAuthenticatedClient<MariaDBManagementClient>(
      MariaDBManagementClient,
    );
    const resourceGroup = resourceGroupName(server.id, true)!;
    const serverName = server.name!;

    return this.iterateScopedResources(
      {
        list: async () => {
          return client.databases.listByServer(resourceGroup, serverName);
        },
      } as any,
      callback,
    );
  }

  public async iteratePostgreSqlServers(
    callback: (s: PostgreSQLServer) => void,
  ): Promise<void> {
    const client = await this.getAuthenticatedClient(
      PostgreSQLManagementClient,
    );
    const servers = await client.servers.list();
    for (const server of servers) {
      callback(server);
    }
  }

  public async iteratePostgreSqlDatabases(
    server: PostgreSQLServer,
    callback: (d: PostgreSQLDatabase) => void,
  ): Promise<void> {
    const client = await this.getAuthenticatedClient(
      PostgreSQLManagementClient,
    );
    const resourceGroup = resourceGroupName(server.id, true)!;
    const serverName = server.name!;

    return this.iterateScopedResources(
      {
        list: async () => {
          return client.databases.listByServer(resourceGroup, serverName);
        },
      } as any,
      callback,
    );
  }

  //// Private Functions ////

  private async getAuthenticatedClient<T>(ctor: {
    new (...args: any[]): T;
  }): Promise<T> {
    let client = this.clientCache.get(ctor);
    if (!client) {
      client = await this.createAuthenticatedClient(ctor, this.config);
      this.clientCache.set(ctor, client);
    }
    return client as T;
  }

  private async createAuthenticatedClient<T>(
    ctor: { new (...args: any[]): T },
    config: AzureIntegrationInstanceConfig,
  ): Promise<T> {
    if (!this.auth) {
      this.auth = await authenticate(config);
    }
    return new ctor(this.auth.credentials, this.auth.subscriptionId, {
      requestPolicyFactories: (
        defaultRequestPolicyFactories: RequestPolicyFactory[],
      ): RequestPolicyFactory[] => {
        return [...defaultRequestPolicyFactories, bunyanLogPolicy(this.logger)];
      },
    });
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

      this.logger.info(
        {
          resourceCount: response.length,
          resource: response._response.request.url,
        },
        "Received resources for endpoint",
      );

      for (const e of response) {
        await callback(e);
      }

      nextLink = response.nextLink;
    } while (nextLink);
  }
}
