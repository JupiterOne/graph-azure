import { MySQLManagementClient } from "@azure/arm-mysql";
import { Database, Server } from "@azure/arm-mysql/esm/models";

import {
  Client,
  iterateAllResources,
  ListResourcesEndpoint,
} from "../../../../azure/resource-manager/client";
import { resourceGroupName } from "../../../../azure/utils";

export class MySQLClient extends Client {
  public async iterateServers(
    callback: (
      s: Server,
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

  public async iterateDatabases(
    server: Server,
    callback: (
      d: Database,
      serviceClient: MySQLManagementClient,
    ) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      MySQLManagementClient,
    );
    const resourceGroup = resourceGroupName(server.id, true);
    const serverName = server.name as string;

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
      resourceDescription: "mysql.databases",
      callback,
    });
  }
}
