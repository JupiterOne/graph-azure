import { CosmosDBManagementClient } from '@azure/arm-cosmosdb';
import {
  DatabaseAccountGetResults,
  SqlDatabaseGetResults,
} from '@azure/arm-cosmosdb/esm/models';

import {
  Client,
  iterateAllResources,
  ListResourcesEndpoint,
} from '../../../azure/resource-manager/client';
import { resourceGroupName } from '../../../azure/utils';

export class CosmosDBClient extends Client {
  public async iterateAccounts(
    callback: (
      resource: DatabaseAccountGetResults,
      serviceClient: CosmosDBManagementClient,
    ) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      CosmosDBManagementClient,
    );

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.databaseAccounts,
      resourceDescription: 'cosmosdb.databaseAccounts',
      callback,
    });
  }

  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  public async iterateSQLDatabases(
    dbAccount: DatabaseAccountGetResults,
    callback: (
      resource: SqlDatabaseGetResults,
      serviceClient: CosmosDBManagementClient,
    ) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      CosmosDBManagementClient,
    );

    const groupName = resourceGroupName(dbAccount.id, true)!;
    const accountName = dbAccount.name!;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => {
          return serviceClient.sqlResources.listSqlDatabases(
            groupName,
            accountName,
          );
        },
      } as ListResourcesEndpoint,
      resourceDescription: 'cosmosdb.listSqlDatabases',
      callback,
    });
  }
}
