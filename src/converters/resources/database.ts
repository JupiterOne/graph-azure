import { Database, Server } from "@azure/arm-sql/esm/models";
import {
  createIntegrationEntity,
  EntityFromIntegration,
  convertProperties,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { AzureWebLinker } from "../../azure";
import { resourceGroupName } from "../../azure/utils";

import {
  SQL_DATABASE_ENTITY_TYPE,
  SQL_DATABASE_ENTITY_CLASS,
  SQL_SERVER_ENTITY_TYPE,
  SQL_SERVER_ENTITY_CLASS,
} from "../../jupiterone";

import { REDACTED_VALUE } from "../../utils/constants";

export function createSqlDatabaseEntity(
  webLinker: AzureWebLinker,
  data: Database,
): EntityFromIntegration {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _type: SQL_DATABASE_ENTITY_TYPE,
        _class: SQL_DATABASE_ENTITY_CLASS,
        displayName: data.name || data.databaseId || data.id || "unnamed",
        webLink: webLinker.portalResourceUrl(data.id),
        resourceGroup: resourceGroupName(data.id),
        active: data.status === "Online",
        createdOn: data.creationDate && data.creationDate.getTime(),
        classification: null,
        encrypted: null,
      },
    },
  });
}

export function createSqlServerEntity(
  webLinker: AzureWebLinker,
  data: Server,
): EntityFromIntegration {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _type: SQL_SERVER_ENTITY_TYPE,
        _class: SQL_SERVER_ENTITY_CLASS,
        displayName:
          data.name || data.fullyQualifiedDomainName || data.id || "unnamed",
        webLink: webLinker.portalResourceUrl(data.id),
        resourceGroup: resourceGroupName(data.id),
        fqdn: data.fullyQualifiedDomainName,
        hostname: data.fullyQualifiedDomainName || data.name || null,
        administratorLogin: REDACTED_VALUE,
        administratorLoginPassword: REDACTED_VALUE,
        classification: null,
        encrypted: null,
      },
    },
  });
}
