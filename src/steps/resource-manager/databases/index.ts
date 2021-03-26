import { STEP_AD_ACCOUNT } from '../../active-directory';
import {
  STEP_RM_DATABASE_MARIADB_DATABASES,
  STEP_RM_DATABASE_MYSQL_DATABASES,
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
import { postgreSqlSteps } from './postgresql';
import { sqlSteps } from './sql';
import {
  Step,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../../types';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources';
import {
  diagnosticSettingsEntitiesForResource,
  getDiagnosticSettingsRelationshipsForResource,
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
      ...getDiagnosticSettingsRelationshipsForResource(
        MariaDBEntities.SERVER._type,
      ),
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
      ...getDiagnosticSettingsRelationshipsForResource(
        MySQLEntities.SERVER._type,
      ),
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchMySQLDatabases,
  },
  ...postgreSqlSteps,
  ...sqlSteps,
];
