import { MariaDBManagementClient } from '@azure/arm-mariadb';
import { Database, Server } from '@azure/arm-mariadb';

import { Client, iterateAll } from '../../../../azure/resource-manager/client';
import { resourceGroupName } from '../../../../azure/utils';

export class MariaDBClient extends Client {
  public async iterateServers(
    callback: (s: Server) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = this.getServiceClient(MariaDBManagementClient);

    return iterateAll({
      resourceEndpoint: serviceClient.servers.list(),
      logger: this.logger,
      resourceDescription: 'maria.servers',
      callback,
    });
  }

  public async iterateDatabases(
    server: Server,
    callback: (d: Database) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = this.getServiceClient(MariaDBManagementClient);
    const resourceGroup = resourceGroupName(server.id, true);
    const serverName = server.name as string;

    return iterateAll({
      resourceEndpoint: serviceClient.databases.listByServer(
        resourceGroup,
        serverName,
      ),
      logger: this.logger,
      resourceDescription: 'maria.databases',
      callback,
    });
  }
}
