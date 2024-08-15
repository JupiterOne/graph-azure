import { MySQLManagementClient } from '@azure/arm-mysql';
import { Database, Server } from '@azure/arm-mysql';

import { Client, iterateAll } from '../../../../azure/resource-manager/client';
import { resourceGroupName } from '../../../../azure/utils';

export class MySQLClient extends Client {
  public async iterateServers(
    callback: (s: Server) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = this.getServiceClient(MySQLManagementClient);
    return iterateAll({
      resourceEndpoint: serviceClient.servers.list(),
      logger: this.logger,
      resourceDescription: 'mysql.servers',
      callback,
    });
  }

  public async iterateDatabases(
    server: Server,
    callback: (d: Database) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = this.getServiceClient(MySQLManagementClient);
    const resourceGroup = resourceGroupName(server.id, true);
    const serverName = server.name as string;

    return iterateAll({
      resourceEndpoint: serviceClient.databases.listByServer(
        resourceGroup,
        serverName,
      ),
      logger: this.logger,
      resourceDescription: 'mysql.databases',
      callback,
    });
  }
}
