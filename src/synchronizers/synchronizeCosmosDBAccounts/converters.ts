import {
  DatabaseAccountGetResults,
  SqlDatabaseResource,
} from "@azure/arm-cosmosdb/esm/models";
import {
  createIntegrationEntity,
  EntityFromIntegration,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { AzureWebLinker } from "../../azure";
import { resourceGroupName } from "../../azure/utils";

export function createAccountEntity(
  webLinker: AzureWebLinker,
  data: DatabaseAccountGetResults,
): EntityFromIntegration {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id,
        _type: "azure_cosmosdb_account",
        _class: ["Account"],
        webLink: webLinker.portalResourceUrl(data.id),
        region: data.location,
        resourceGroup: resourceGroupName(data.id),
      },
      tagProperties: ["environment"],
    },
  });
}

export function createSQLDatabaseEntity(
  webLinker: AzureWebLinker,
  dbAccount: DatabaseAccountGetResults,
  data: SqlDatabaseResource,
): EntityFromIntegration {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id,
        _type: "azure_cosmosdb_sql_database",
        _class: ["Database", "DataStore"],
        dbAccountId: dbAccount.id, // Maintained for synchronization subset
        webLink: webLinker.portalResourceUrl(data.id),
        encrypted: true, // Cosmos DB's are always encrypted, it cannot be turned off
        classification: null,
        resourceGroup: resourceGroupName(data.id),
        region: dbAccount.location,
      },
    },
  });
}
