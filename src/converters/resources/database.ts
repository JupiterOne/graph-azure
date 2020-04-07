import {
  createIntegrationEntity,
  EntityFromIntegration,
  convertProperties,
} from "@jupiterone/jupiter-managed-integration-sdk";

import {
  Server as MySQLServer,
  Database as MySQLDatabase,
} from "@azure/arm-mysql/esm/models";

import {
  Server as SQLServer,
  Database as SQLDatabase,
} from "@azure/arm-sql/esm/models";

import { AzureWebLinker } from "../../azure";
import { resourceGroupName } from "../../azure/utils";

import {
  AZURE_DATABASE_ENTITY_CLASS,
  AZURE_DB_SERVER_ENTITY_CLASS,
} from "../../jupiterone";

import { REDACTED_VALUE } from "../../utils/constants";

export function createDatabaseEntity(
  webLinker: AzureWebLinker,
  data: MySQLDatabase | SQLDatabase,
  _type: string,
  encrypted: boolean | null,
): EntityFromIntegration {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _type,
        _class: AZURE_DATABASE_ENTITY_CLASS,
        displayName: data.name || data.id || "unnamed",
        webLink: webLinker.portalResourceUrl(data.id),
        resourceGroup: resourceGroupName(data.id),
        classification: null,
        encrypted,
      },
    },
  });
}

export function createDbServerEntity(
  webLinker: AzureWebLinker,
  data: MySQLServer | SQLServer,
  _type: string,
): EntityFromIntegration {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        ...convertProperties((data as any).sku, { prefix: "sku" }),
        ...convertProperties((data as any).storageProfile),
        _type,
        _class: AZURE_DB_SERVER_ENTITY_CLASS,
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
