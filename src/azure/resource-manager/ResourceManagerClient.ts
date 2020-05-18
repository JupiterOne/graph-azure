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

import { resourceGroupName } from "../utils";
import { Client, iterateAllResources, ListResourcesEndpoint } from "./client";

export default class ResourceManagerClient extends Client {
  //// Compute and Network ////

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
      callback,
    });
  }

  public async iterateVirtualMachines(
    callback: (vm: VirtualMachine) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      ComputeManagementClient,
    );
    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.virtualMachines,
      callback,
    });
  }

  /* istanbul ignore next: core functionality covered by other tests */
  public async iterateVirtualMachineImages(
    callback: (i: VirtualMachineImage) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      ComputeManagementClient,
    );
    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.images,
      callback,
    });
  }

  public async iterateVirtualMachineDisks(
    callback: (d: Disk) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      ComputeManagementClient,
    );
    const items = await serviceClient.disks.list();
    for (const item of items) {
      await callback(item);
    }
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
      callback,
    });
  }

  //// Databases ////

  public async iterateSqlServers(
    callback: (
      s: SQLServer,
      serviceClient: SqlManagementClient,
    ) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      SqlManagementClient,
    );
    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.servers,
      callback,
    });
  }

  public async iterateSqlDatabases(
    server: SQLServer,
    callback: (
      d: SQLDatabase,
      serviceClient: SqlManagementClient,
    ) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      SqlManagementClient,
    );
    const resourceGroup = resourceGroupName(server.id, true)!;
    const serverName = server.name!;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => {
          return serviceClient.databases.listByServer(
            resourceGroup,
            serverName,
          );
        },
      } as ListResourcesEndpoint,
      callback,
    });
  }

  public async iterateMySqlServers(
    callback: (
      s: MySQLServer,
      serviceClient: MySQLManagementClient,
    ) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      MySQLManagementClient,
    );
    const servers = await serviceClient.servers.list();
    for (const server of servers) {
      await callback(server, serviceClient);
    }
  }

  public async iterateMySqlDatabases(
    server: MySQLServer,
    callback: (
      d: MySQLDatabase,
      serviceClient: MySQLManagementClient,
    ) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      MySQLManagementClient,
    );
    const resourceGroup = resourceGroupName(server.id, true)!;
    const serverName = server.name!;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => {
          return serviceClient.databases.listByServer(
            resourceGroup,
            serverName,
          );
        },
      } as ListResourcesEndpoint,
      callback,
    });
  }

  /* istanbul ignore next: core functionality covered by other tests */
  public async iterateMariaDbServers(
    callback: (
      s: MariaDBServer,
      serviceClient: MariaDBManagementClient,
    ) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      MariaDBManagementClient,
    );
    const servers = await serviceClient.servers.list();
    for (const server of servers) {
      await callback(server, serviceClient);
    }
  }

  /* istanbul ignore next: core functionality covered by other tests */
  public async iterateMariaDbDatabases(
    server: MariaDBServer,
    callback: (
      d: MariaDBDatabase,
      serviceClient: MariaDBManagementClient,
    ) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient<
      MariaDBManagementClient
    >(MariaDBManagementClient);
    const resourceGroup = resourceGroupName(server.id, true)!;
    const serverName = server.name!;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => {
          return serviceClient.databases.listByServer(
            resourceGroup,
            serverName,
          );
        },
      } as ListResourcesEndpoint,
      callback,
    });
  }

  /* istanbul ignore next: core functionality covered by other tests */
  public async iteratePostgreSqlServers(
    callback: (
      s: PostgreSQLServer,
      serviceClient: PostgreSQLManagementClient,
    ) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PostgreSQLManagementClient,
    );
    const servers = await serviceClient.servers.list();
    for (const server of servers) {
      await callback(server, serviceClient);
    }
  }

  /* istanbul ignore next: core functionality covered by other tests */
  public async iteratePostgreSqlDatabases(
    server: PostgreSQLServer,
    callback: (
      resource: PostgreSQLDatabase,
      serviceClient: PostgreSQLManagementClient,
    ) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PostgreSQLManagementClient,
    );
    const resourceGroup = resourceGroupName(server.id, true)!;
    const serverName = server.name!;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => {
          return serviceClient.databases.listByServer(
            resourceGroup,
            serverName,
          );
        },
      } as ListResourcesEndpoint,
      callback,
    });
  }
}
