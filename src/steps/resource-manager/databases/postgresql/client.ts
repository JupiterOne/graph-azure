import {
  Configuration,
  PostgreSQLManagementClient,
} from '@azure/arm-postgresql';
import { Database, FirewallRule, Server } from '@azure/arm-postgresql';

import { Client, iterateAll } from '../../../../azure/resource-manager/client';
import { resourceGroupName } from '../../../../azure/utils';

export class PostgreSQLClient extends Client {
  public async iterateServers(
    callback: (s: Server) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = this.getServiceClient(PostgreSQLManagementClient);

    return iterateAll({
      resourceEndpoint: serviceClient.servers.list(),
      logger: this.logger,
      resourceDescription: 'postgresql.servers',
      callback,
    });
  }

  public async getServerConfigurations(server: { name: string; id: string }) {
    const serviceClient = this.getServiceClient(PostgreSQLManagementClient);

    const resourceGroup = resourceGroupName(server.id, true);
    const serverName = server.name;

    try {
      const response: Configuration[] = [];
      await iterateAll({
        resourceEndpoint: serviceClient.configurations.listByServer(
          resourceGroup,
          serverName,
        ),
        logger: this.logger,
        resourceDescription: 'postgresql.configuration',
        callback: (config) => {
          response.push(config);
        },
      });
      return response;
    } catch (err) {
      this.logger.warn(
        {
          error: err.message,
          server: server.id,
          resourceGroup,
        },
        'Failed to obtain configurations for server.',
      );
    }
  }

  public async iterateDatabases(
    server: Server,
    callback: (d: Database) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = this.getServiceClient(PostgreSQLManagementClient);
    const resourceGroup = resourceGroupName(server.id, true);
    const serverName = server.name as string;

    return iterateAll({
      resourceEndpoint: serviceClient.databases.listByServer(
        resourceGroup,
        serverName,
      ),
      logger: this.logger,
      resourceDescription: 'postgresql.databases',
      callback,
    });
  }

  public async iterateServerFirewallRules(
    server: {
      id?: string;
      name?: string;
    },
    callback: (r: FirewallRule) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = this.getServiceClient(PostgreSQLManagementClient);

    const resourceGroup = resourceGroupName(server.id, true);
    const serverName = server.name as string;

    return iterateAll({
      resourceEndpoint: serviceClient.firewallRules.listByServer(
        resourceGroup,
        serverName,
      ),
      logger: this.logger,
      resourceDescription: 'postgresql.firewallRules',
      callback,
    });
  }
}
