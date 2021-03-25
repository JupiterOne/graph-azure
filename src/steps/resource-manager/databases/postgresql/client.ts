import { PostgreSQLManagementClient } from '@azure/arm-postgresql';
import {
  Database,
  FirewallRule,
  Server,
} from '@azure/arm-postgresql/esm/models';
import { IntegrationProviderAPIError } from '@jupiterone/integration-sdk-core';

import {
  Client,
  iterateAllResources,
} from '../../../../azure/resource-manager/client';
import { resourceGroupName } from '../../../../azure/utils';

export class PostgreSQLClient extends Client {
  public async iterateServers(
    callback: (s: Server) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PostgreSQLManagementClient,
    );
    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.servers,
      resourceDescription: 'postgresql.servers',
      callback,
    });
  }

  public async getServerConfigurations(server: { name: string; id: string }) {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PostgreSQLManagementClient,
    );

    const resourceGroup = resourceGroupName(server.id, true);
    const serverName = server.name;

    try {
      const response = serviceClient.configurations.listByServer(
        resourceGroup,
        serverName,
      );
      return response;
    } catch (err) {
      this.logger.warn(
        {
          err: new IntegrationProviderAPIError({
            endpoint: 'postgresql.servers.configurations',
            status: err.status,
            statusText: err.statusText,
            cause: err,
          }),
          server: server.id,
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
      },
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
    const serviceClient = await this.getAuthenticatedServiceClient(
      PostgreSQLManagementClient,
    );

    const resourceGroup = resourceGroupName(server.id, true);
    const serverName = server.name as string;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => {
          return serviceClient.firewallRules.listByServer(
            resourceGroup,
            serverName,
          );
        },
      },
      resourceDescription: 'postgresql.firewallRules',
      callback,
    });
  }
}
