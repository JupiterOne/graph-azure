import { STEP_AD_ACCOUNT } from '../../active-directory';
import {
  STEP_RM_DATABASE_MARIADB_DATABASES,
  STEP_RM_DATABASE_MYSQL_DATABASES,
  STEP_RM_DATABASE_POSTGRESQL_DATABASES,
  STEP_RM_DATABASE_SQL_DATABASES,
} from './constants';
import {
  fetchMariaDBDatabases,
  MariaDBEntities,
  MariaDBRelationships,
} from './mariadb';
import {
  fetchMySQLDatabases,
  MySQLEntities,
  MySQLRelationships,
} from './mysql';
import {
  fetchPostgreSQLDatabases,
  PostgreSQLEntities,
  PostgreSQLRelationships,
} from './postgresql';
import { fetchSQLDatabases, SQLEntities, SQLRelationships } from './sql';
import {
  Step,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../../types';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources';
import {
  diagnosticSettingsEntitiesForResource,
  diagnosticSettingsRelationshipsForResource,
} from '../utils/createDiagnosticSettingsEntitiesAndRelationshipsForResource';

export * from './constants';

export const databaseSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: STEP_RM_DATABASE_MARIADB_DATABASES,
    name: 'MariaDB Databases',
    entities: [
      MariaDBEntities.SERVER,
      MariaDBEntities.DATABASE,
      ...diagnosticSettingsEntitiesForResource,
    ],
    relationships: [
      MariaDBRelationships.RESOURCE_GROUP_HAS_MARIADB_SERVER,
      MariaDBRelationships.MARIADB_SERVER_HAS_MARIADB_DATABASE,
      ...diagnosticSettingsRelationshipsForResource,
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchMariaDBDatabases,
  },
  {
    id: STEP_RM_DATABASE_MYSQL_DATABASES,
    name: 'MySQL Databases',
    entities: [
      MySQLEntities.SERVER,
      MySQLEntities.DATABASE,
      ...diagnosticSettingsEntitiesForResource,
    ],
    relationships: [
      MySQLRelationships.RESOURCE_GROUP_HAS_MYSQL_SERVER,
      MySQLRelationships.MYSQL_SERVER_HAS_MYSQL_DATABASE,
      ...diagnosticSettingsRelationshipsForResource,
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchMySQLDatabases,
  },
  {
    id: STEP_RM_DATABASE_POSTGRESQL_DATABASES,
    name: 'PostgreSQL Databases',
    entities: [
      PostgreSQLEntities.SERVER,
      PostgreSQLEntities.DATABASE,
      ...diagnosticSettingsEntitiesForResource,
    ],
    relationships: [
      PostgreSQLRelationships.RESOURCE_GROUP_HAS_POSTGRESQL_SERVER,
      PostgreSQLRelationships.POSTGRESQL_SERVER_HAS_POSTGRESQL_DATABASE,
      ...diagnosticSettingsRelationshipsForResource,
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchPostgreSQLDatabases,
  },
  {
    id: STEP_RM_DATABASE_SQL_DATABASES,
    name: 'SQL Databases',
    entities: [
      SQLEntities.SERVER,
      SQLEntities.DATABASE,
      ...diagnosticSettingsEntitiesForResource,
    ],
    relationships: [
      SQLRelationships.RESOURCE_GROUP_HAS_SQL_SERVER,
      SQLRelationships.SQL_SERVER_HAS_SQL_DATABASE,
      ...diagnosticSettingsRelationshipsForResource,
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchSQLDatabases,
  },
];
