import { MariaDBManagementClient } from '@azure/arm-mariadb';
import { Database, Server } from '@azure/arm-mariadb/esm/models';

import {
  Client,
  iterateAllResources,
  ListResourcesEndpoint,
} from '../../../../azure/resource-manager/client';
import { resourceGroupName } from '../../../../azure/utils';

export class MariaDBClient extends Client {
  public async iterateServers(
    callback: (s: Server) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      MariaDBManagementClient,
    );
    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.servers,
      resourceDescription: 'maria.servers',
      callback,
    });
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
      resourceDescription: 'maria.databases',
      callback,
    });
  }
}
