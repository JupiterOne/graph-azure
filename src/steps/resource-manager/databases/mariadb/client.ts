import { MariaDBManagementClient } from '@azure/arm-mariadb';
import { Database, Server } from '@azure/arm-mariadb/esm/models';

import {
  Client,
} from '../../../../azure/resource-manager/client';
import { resourceGroupName } from '../../../../azure/utils';

export class MariaDBClient extends Client {
  public async iterateServers(
    callback: (s: Server) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      MariaDBManagementClient,
    );
    const serversResponse = await serviceClient.servers.list();
    for (const server of serversResponse) {
      await callback(server);
    }
  }

  public async iterateDatabases(
    server: Server,
    callback: (
      d: Database,
      serviceClient: MariaDBManagementClient,
    ) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      MariaDBManagementClient,
    );
    const resourceGroup = resourceGroupName(server.id, true);
    const serverName = server.name as string;

    // Fetch the list of databases from the server
    const databasesResponse = await serviceClient.databases.listByServer(
      resourceGroup,
      serverName,
    );

    // Assuming that databasesResponse contains an array of databases directly
    for (const database of databasesResponse) {
      await callback(database, serviceClient);
    }
  }
}
