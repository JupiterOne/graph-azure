import { PostgreSQLManagementClient } from '@azure/arm-postgresql';
import { Database, Server } from '@azure/arm-postgresql/esm/models';

import {
  Client,
  iterateAllResources,
  ListResourcesEndpoint,
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
      } as ListResourcesEndpoint,
      resourceDescription: 'postgresql.databases',
      callback,
    });
  }
}
