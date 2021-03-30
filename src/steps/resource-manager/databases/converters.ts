import {
  Database as MariaDBDatabase,
  Server as MariaDBServer,
} from '@azure/arm-mariadb/esm/models';
import {
  Database as MySQLDatabase,
  Server as MySQLServer,
} from '@azure/arm-mysql/esm/models';
import {
  Configuration as PostgreSQLServerConfiguration,
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
  setRawData,
} from '@jupiterone/integration-sdk-core';

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
  configurations?: PostgreSQLServerConfiguration[],
): Entity {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyServer = data as any;
  const serverEntity = createIntegrationEntity({
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
        secureTransport: anyServer.sslEnforcement === 'Enabled',
        'configuration.logCheckpoints': getConfiguration(
          configurations,
          'log_checkpoints',
        ),
        'configuration.logConnections': getConfiguration(
          configurations,
          'log_connections',
        ),
        'configuration.logDisconnections': getConfiguration(
          configurations,
          'log_disconnections',
        ),
        'configuration.connectionThrottling': getConfiguration(
          configurations,
          'connection_throttling',
        ),
        'configuration.logRetentionDays': getConfiguration(
          configurations,
          'log_retention_days',
          'number',
        ),
      },
    },
  });

  if (configurations) {
    setRawData(serverEntity, {
      name: 'serverConfigurations',
      rawData: configurations,
    });
  }
  return serverEntity;
}

function getConfiguration(
  configurations: PostgreSQLServerConfiguration[] | undefined,
  propertyName: string,
  type: 'string' | 'number' = 'string',
) {
  const value = configurations?.find((c) => c.name === propertyName)?.value;
  if (type === 'number') {
    const numericValue = Number(value);
    if (!isNaN(numericValue)) {
      return numericValue;
    }
  }
  return value;
}

export const testFunctions = {
  getConfiguration,
};
