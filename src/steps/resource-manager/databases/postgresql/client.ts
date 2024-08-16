import { PostgreSQLManagementClient } from '@azure/arm-postgresql';
import {
  Database,
  FirewallRule,
  Server,
} from '@azure/arm-postgresql/esm/models';

import {
  Client,
} from '../../../../azure/resource-manager/client';
import { resourceGroupName } from '../../../../azure/utils';

export class PostgreSQLClient extends Client {
  public async iterateServers(
    callback: (s: Server) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PostgreSQLManagementClient,
    );
    const serversResponse = await serviceClient.servers.list();

    for (const server of serversResponse) {
      await callback(server);
    }
  }

  public async getServerConfigurations(server: { name: string; id: string }) {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PostgreSQLManagementClient,
    );

    const resourceGroup = resourceGroupName(server.id, true);
    const serverName = server.name;

    try {
      const response = await serviceClient.configurations.listByServer(
        resourceGroup,
        serverName,
      );
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
    callback: (
      d: Database,
      serviceClient: PostgreSQLManagementClient,
    ) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PostgreSQLManagementClient,
    );
    const resourceGroup = resourceGroupName(server.id, true);
    const serverName = server.name as string;

    // Fetch the list of databases from the server
    const databasesResponse = await serviceClient.databases.listByServer(
      resourceGroup,
      serverName,
    );
    for (const database of databasesResponse) {
      await callback(database, serviceClient);
    }
  }

  public async iterateServerFirewallRules(
    server: {
      id?: string;
      name?: string;
    },
    callback: (r: FirewallRule) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PostgreSQLManagementClient,
    );

    const resourceGroup = resourceGroupName(server.id, true);
    const serverName = server.name as string;

    // Fetch the list of firewall rules from the server
    const firewallRulesResponse = await serviceClient.firewallRules.listByServer(
      resourceGroup,
      serverName,
    );
    for (const rule of firewallRulesResponse) {
      await callback(rule);
    }
  }
}
