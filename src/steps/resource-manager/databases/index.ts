import { STEP_AD_ACCOUNT } from '../../active-directory/constants';
import {
  STEP_RM_DATABASE_MARIADB_DATABASES,
  STEP_RM_DATABASE_MARIADB_DATABASES_DIAGNOSTIC_SETTINGS,
  STEP_RM_DATABASE_MYSQL_DATABASES,
  STEP_RM_DATABASE_MYSQL_DATABASES_DIAGNOSTIC_SETTINGS,
} from './constants';
import {
  fetchMariaDBDatabases,
  fetchMariaDBDatabasesDiagnosticSettings,
} from './mariadb';
import { MariaDBEntities, MariaDBRelationships } from './mariadb/constants';
import {
  fetchMySQLDatabases,
  fetchMySQLDatabasesDiagnosticSettings,
} from './mysql';
import { MySQLEntities, MySQLRelationships } from './mysql/constants';
import { postgreSqlSteps } from './postgresql';
import { sqlSteps } from './sql';
import { AzureIntegrationStep } from '../../../types';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources/constants';
import {
  diagnosticSettingsEntitiesForResource,
  getDiagnosticSettingsRelationshipsForResource,
} from '../utils/createDiagnosticSettingsEntitiesAndRelationshipsForResource';
import { INGESTION_SOURCE_IDS } from '../../../constants';
import { steps as storageSteps } from '../storage/constants';

export const databaseSteps: AzureIntegrationStep[] = [
  {
    id: STEP_RM_DATABASE_MARIADB_DATABASES,
    name: 'MariaDB Databases',
    entities: [MariaDBEntities.SERVER, MariaDBEntities.DATABASE],
    relationships: [
      MariaDBRelationships.RESOURCE_GROUP_HAS_MARIADB_SERVER,
      MariaDBRelationships.MARIADB_SERVER_HAS_MARIADB_DATABASE,
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchMariaDBDatabases,
    rolePermissions: [
      'Microsoft.DBforMariaDB/servers/databases/read',
      'Microsoft.DBforMariaDB/servers/read',
    ],
    ingestionSourceId: INGESTION_SOURCE_IDS.DATABASES,
  },
  {
    id: STEP_RM_DATABASE_MARIADB_DATABASES_DIAGNOSTIC_SETTINGS,
    name: 'MariaDB Databases Diagnostic Settings',
    entities: [...diagnosticSettingsEntitiesForResource],
    relationships: [
      ...getDiagnosticSettingsRelationshipsForResource(MariaDBEntities.SERVER),
    ],
    dependsOn: [
      STEP_RM_DATABASE_MARIADB_DATABASES,
      storageSteps.STORAGE_ACCOUNTS,
    ],
    executionHandler: fetchMariaDBDatabasesDiagnosticSettings,
    rolePermissions: ['Microsoft.Insights/DiagnosticSettings/Read'],
    ingestionSourceId: INGESTION_SOURCE_IDS.DATABASES,
  },
  {
    id: STEP_RM_DATABASE_MYSQL_DATABASES,
    name: 'MySQL Databases',
    entities: [MySQLEntities.SERVER, MySQLEntities.DATABASE],
    relationships: [
      MySQLRelationships.RESOURCE_GROUP_HAS_MYSQL_SERVER,
      MySQLRelationships.MYSQL_SERVER_HAS_MYSQL_DATABASE,
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchMySQLDatabases,
    rolePermissions: [
      'Microsoft.DBforMySQL/servers/read',
      'Microsoft.DBforMySQL/servers/databases/read',
    ],
    ingestionSourceId: INGESTION_SOURCE_IDS.DATABASES,
  },
  {
    id: STEP_RM_DATABASE_MYSQL_DATABASES_DIAGNOSTIC_SETTINGS,
    name: 'MySQL Databases Diagnostic Settings',
    entities: [...diagnosticSettingsEntitiesForResource],
    relationships: [
      ...getDiagnosticSettingsRelationshipsForResource(MySQLEntities.SERVER),
    ],
    dependsOn: [
      STEP_RM_DATABASE_MYSQL_DATABASES,
      storageSteps.STORAGE_ACCOUNTS,
    ],
    executionHandler: fetchMySQLDatabasesDiagnosticSettings,
    rolePermissions: ['Microsoft.Insights/DiagnosticSettings/Read'],
    ingestionSourceId: INGESTION_SOURCE_IDS.DATABASES,
  },
  ...postgreSqlSteps,
  ...sqlSteps,
];
