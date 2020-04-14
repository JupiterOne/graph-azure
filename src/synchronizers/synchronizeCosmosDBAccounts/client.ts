import { CosmosDBManagementClient } from "@azure/arm-cosmosdb";
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  DatabaseAccountGetResults,
  SqlDatabaseResource,
} from "@azure/arm-cosmosdb/esm/models";

import {
  Client,
  iterateAllResources,
  ListResourcesEndpoint,
} from "../../azure/resource-manager/client";
import { resourceGroupName } from "../../azure/utils";

export class CosmosDBClient extends Client {
  public async iterateCosmosDBAccounts(
    callback: (
      resource: DatabaseAccountGetResults,
      serviceClient: CosmosDBManagementClient,
    ) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      CosmosDBManagementClient,
    );

    iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.databaseAccounts,
      callback,
    });
  }

  public async iterateCosmosDBs(
    dbAccount: DatabaseAccountGetResults,
    callback: (
      resource: SqlDatabaseResource,
      serviceClient: CosmosDBManagementClient,
    ) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      CosmosDBManagementClient,
    );

    const groupName = resourceGroupName(dbAccount.id, true)!;
    const accountName = dbAccount.name!;

    iterateAllResources({
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
      callback,
    });
  }
}
