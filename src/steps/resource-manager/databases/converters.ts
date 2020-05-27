import {
  Database as MariaDBDatabase,
  Server as MariaDBServer,
} from '@azure/arm-mariadb/esm/models';
import {
  Database as MySQLDatabase,
  Server as MySQLServer,
} from '@azure/arm-mysql/esm/models';
import {
  Database as PostgreSQLDatabase,
  Server as PostgreSQLServer,
} from '@azure/arm-postgresql/esm/models';
import {
  Database as SQLDatabase,
  Server as SQLServer,
} from '@azure/arm-sql/esm/models';
import {
  convertProperties,
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk';

import { AzureWebLinker } from '../../../azure';
import { resourceGroupName } from '../../../azure/utils';
import { REDACTED_VALUE } from '../../../utils/constants';
import {
  RM_DATABASE_ENTITY_CLASS,
  RM_DATABASE_SERVER_ENTITY_CLASS,
} from './constants';

export function createDatabaseEntity(
  webLinker: AzureWebLinker,
  data: MySQLDatabase | SQLDatabase | MariaDBDatabase | PostgreSQLDatabase,
  _type: string,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _type,
        _class: RM_DATABASE_ENTITY_CLASS,
        displayName: data.name || data.id || 'unnamed',
        webLink: webLinker.portalResourceUrl(data.id),
        resourceGroup: resourceGroupName(data.id),
        classification: null,
        encrypted: null,
      },
    },
  });
}

export function createDbServerEntity(
  webLinker: AzureWebLinker,
  data: MySQLServer | SQLServer | MariaDBServer | PostgreSQLServer,
  _type: string,
): Entity {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyServer = data as any;
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        ...convertProperties(anyServer.sku, { prefix: 'sku' }),
        ...convertProperties(anyServer.storageProfile),
        _type,
        _class: RM_DATABASE_SERVER_ENTITY_CLASS,
        displayName:
          data.name || data.fullyQualifiedDomainName || data.id || 'unnamed',
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
