/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { ComputeManagementClient } from "@azure/arm-compute";
import {
  Disk,
  VirtualMachine,
  VirtualMachineImage,
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
  LoadBalancer,
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
import {
  exponentialRetryPolicy,
  HttpResponse,
  RequestPolicyFactory,
  systemErrorRetryPolicy,
  throttlingRetryPolicy,
} from "@azure/ms-rest-js";
import { IntegrationLogger } from "@jupiterone/jupiter-managed-integration-sdk";
import { retry } from "@lifeomic/attempt";

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

/**
 * Retries a resource request that throws an error on a 429 response.
 *
 * Note that the documentation at
 * https://docs.microsoft.com/en-us/azure/virtual-machines/troubleshooting/troubleshooting-throttling-errors
 * states plainly:
 *
 * > In high-volume API automation cases, consider implementing proactive
 * > client-side self-throttling when the available call count for a target
 * > operation group drops below some low threshold.
 *
 * That would be nice for them to handle in the client, and it would be great to
 * see the endpoints always return the resource provider counts remaining, and
 * they'd get bonus points for having use `retry-after` header values.
 *
 * Some resource provider endpoints have returned 429 a response with a
 * `retry-after` that is useless, and another try gets another 429, which the
 * `ThrottlingRetryPolicy` will not handle. That is, given 100 req/5 minutes, a
 * burst of 100 requests will burn the allowed requests, a 429 is returned with
 * `retry-after: 17`, but in fact the API will not answer again until up to 5
 * minutes has passed!
 *
 * The approach here is designed to:
 *
 * 1. Allow a burst of requests up to the maximum per period supported by the
 *    resource provider vs. always spreading out requests, which makes scenarios
 *    where the endpoint is only called 10 times really slow.
 * 2. Wait the period out after two subsequent 429 responses, because once we've
 *    seen a 429, it means we've burned up our limit for the period.
 * 3. Allow resource providers that return a useful `retry-after` to continue to
 *    work, because the `ThrottlingRetryPolicy` is still in place.
 * 4. Allow specific resource provider endpoint period wait times.
 *
 * @param requestFunc code making a request to Azure RM
 * @param resourceProviderRatePeriod the resource provider's rate limiting
 * period; the time in a reqs/time ratio
 */
/* istanbul ignore next: testing iteration might be difficult */
function retryResourceRequest<T>(
  requestFunc: () => Promise<T>,
  resourceProviderRatePeriod: number,
): Promise<T> {
  return retry(
    async _context => {
      return requestFunc();
    },
    {
      // Things aren't working as expected if we're asked to retry more than
      // once. The request policy of the `ServiceClient` will handle all other
      // retry scenarios.
      maxAttempts: 2,

      // No delay on the first attempt, wait for next period on subsequent
      // attempts. Assumes non-429 responses will not lead to subsequent
      // attempts (`handleError` will abort for other error responses).
      calculateDelay: (context, _options) => {
        return context.attemptNum === 0 ? 0 : resourceProviderRatePeriod;
      },

      // Most errors will be handled by the request policies. They will raise
      // a `RestError.statusCode: 429` when they see two 429 responses in a row,
      // which is the scenario we're aiming to address with our retry.
      handleError: (err, context, _options) => {
        if (err.statusCode !== 429) {
          context.abort();
        }
      },
    },
  );
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

  public async iterateLoadBalancers(
    callback: (lb: LoadBalancer) => void,
  ): Promise<void> {
    const client = await this.getAuthenticatedClient(NetworkManagementClient);
    return this.iterateAllResources(client.loadBalancers, callback);
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

    // Builds a custom policy chain to address
    // https://github.com/Azure/azure-sdk-for-js/issues/7989
    // See also: https://docs.microsoft.com/en-us/azure/virtual-machines/troubleshooting/troubleshooting-throttling-errors
    return new ctor(this.auth.credentials, this.auth.subscriptionId, {
      noRetryPolicy: true, // < -- This removes retry policies so they can be added after the Deserialization
      requestPolicyFactories: (
        defaultRequestPolicyFactories: RequestPolicyFactory[],
      ): RequestPolicyFactory[] => {
        const policyChain = [
          ...defaultRequestPolicyFactories,
          exponentialRetryPolicy(), // < -- This will not retry a 429 response
          systemErrorRetryPolicy(),
          throttlingRetryPolicy(), // < -- This thing will only retry once
          bunyanLogPolicy(this.logger),
        ];
        return policyChain;
      },
    });
  }

  /**
   * Iterate ALL resources of a `ResourceManagementModule`. These are Azure
   * Resource Node modules that that support a `listAll` function.
   *
   * @param rmModule a module that supports listAll() and listAllNext()
   * @param callback a function to receive each resource throughout pagination
   * @param resourceProviderRateLimit number of requests allowed per rate period
   * @param resourceProviderRatePeriod number of milliseconds over which rate
   * limit applies
   */
  private async iterateAllResources<T, L extends ResourceListResponse<T>>(
    rmModule: ResourceManagementModule,
    callback: (r: T) => void | Promise<void>,
    resourceProviderRatePeriod = 6 * 60 * 1000,
  ): Promise<void> {
    let nextLink: string | undefined;
    do {
      const response = await retryResourceRequest(async () => {
        return nextLink
          ? /* istanbul ignore next: testing iteration might be difficult */
            await rmModule.listAllNext<L>(nextLink)
          : await rmModule.listAll<L>();
      }, resourceProviderRatePeriod);

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
   * @param resourceProviderRateLimit number of requests allowed per rate period
   * @param resourceProviderRatePeriod number of milliseconds over which rate
   * limit applies
   */
  private async iterateScopedResources<T, L extends ResourceListResponse<T>>(
    rmModule: ScopedResourceManagementModule,
    callback: (r: T) => void | Promise<void>,
    resourceProviderRatePeriod = 6 * 60 * 1000,
  ): Promise<void> {
    let nextLink: string | undefined;
    do {
      const response = await retryResourceRequest(async () => {
        return nextLink
          ? /* istanbul ignore next: testing iteration might be difficult */
            await rmModule.listNext<L>(nextLink)
          : await rmModule.list<L>();
      }, resourceProviderRatePeriod);

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
