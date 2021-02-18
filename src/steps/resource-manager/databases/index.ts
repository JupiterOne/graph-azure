import { STEP_AD_ACCOUNT } from '../../active-directory';
import {
  STEP_RM_DATABASE_MARIADB_DATABASES,
  STEP_RM_DATABASE_MYSQL_DATABASES,
  STEP_RM_DATABASE_POSTGRESQL_DATABASES,
  STEP_RM_DATABASE_SQL_DATABASES,
  RM_DATABASE_SERVER_ENTITY_CLASS,
  RM_DATABASE_ENTITY_CLASS,
} from './constants';
import {
  fetchMariaDBDatabases,
  RM_MARIADB_DATABASE_ENTITY_TYPE,
  RM_MARIADB_SERVER_DATABASE_RELATIONSHIP_TYPE,
  RM_MARIADB_SERVER_ENTITY_TYPE,
  RM_MARIADB_SERVER_DATABASE_RELATIONSHIP_CLASS,
} from './mariadb';
import {
  fetchMySQLDatabases,
  RM_MYSQL_DATABASE_ENTITY_TYPE,
  RM_MYSQL_SERVER_DATABASE_RELATIONSHIP_TYPE,
  RM_MYSQL_SERVER_ENTITY_TYPE,
  RM_MYSQL_SERVER_DATABASE_RELATIONSHIP_CLASS,
} from './mysql';
import {
  fetchPostgreSQLDatabases,
  PostgreSQLEntities,
  PostgreSQLRelationships,
} from './postgresql';
import {
  fetchSQLDatabases,
  RM_SQL_DATABASE_ENTITY_TYPE,
  RM_SQL_SERVER_DATABASE_RELATIONSHIP_TYPE,
  RM_SQL_SERVER_ENTITY_TYPE,
  RM_SQL_SERVER_DATABASE_RELATIONSHIP_CLASS,
} from './sql';
import {
  Step,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../../types';
import { createResourceGroupResourceRelationshipMetadata } from '../utils/createResourceGroupResourceRelationship';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources';

export * from './constants';

export const databaseSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: STEP_RM_DATABASE_MARIADB_DATABASES,
    name: 'MariaDB Databases',
    entities: [
      {
        resourceName: '[RM] MariaDB Server',
        _type: RM_MARIADB_SERVER_ENTITY_TYPE,
        _class: RM_DATABASE_SERVER_ENTITY_CLASS,
      },
      {
        resourceName: '[RM] MariaDB Database',
        _type: RM_MARIADB_DATABASE_ENTITY_TYPE,
        _class: RM_DATABASE_ENTITY_CLASS,
      },
    ],
    relationships: [
      {
        _type: RM_MARIADB_SERVER_DATABASE_RELATIONSHIP_TYPE,
        sourceType: RM_MARIADB_SERVER_ENTITY_TYPE,
        _class: RM_MARIADB_SERVER_DATABASE_RELATIONSHIP_CLASS,
        targetType: RM_MARIADB_DATABASE_ENTITY_TYPE,
      },
      createResourceGroupResourceRelationshipMetadata(
        RM_MARIADB_SERVER_ENTITY_TYPE,
      ),
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchMariaDBDatabases,
  },
  {
    id: STEP_RM_DATABASE_MYSQL_DATABASES,
    name: 'MySQL Databases',
    entities: [
      {
        resourceName: '[RM] MySQL Server',
        _type: RM_MYSQL_SERVER_ENTITY_TYPE,
        _class: RM_DATABASE_SERVER_ENTITY_CLASS,
      },
      {
        resourceName: '[RM] MySQL Database',
        _type: RM_MYSQL_DATABASE_ENTITY_TYPE,
        _class: RM_DATABASE_ENTITY_CLASS,
      },
    ],
    relationships: [
      {
        _type: RM_MYSQL_SERVER_DATABASE_RELATIONSHIP_TYPE,
        sourceType: RM_MYSQL_SERVER_ENTITY_TYPE,
        _class: RM_MYSQL_SERVER_DATABASE_RELATIONSHIP_CLASS,
        targetType: RM_MYSQL_DATABASE_ENTITY_TYPE,
      },
      createResourceGroupResourceRelationshipMetadata(
        RM_MYSQL_SERVER_ENTITY_TYPE,
      ),
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchMySQLDatabases,
  },
  {
    id: STEP_RM_DATABASE_POSTGRESQL_DATABASES,
    name: 'PostgreSQL Databases',
    entities: [PostgreSQLEntities.SERVER, PostgreSQLEntities.DATABASE],
    relationships: [
      PostgreSQLRelationships.RESOURCE_GROUP_HAS_POSTGRESQL_SERVER,
      PostgreSQLRelationships.POSTGRESQL_SERVER_HAS_POSTGRESQL_DATABASE,
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchPostgreSQLDatabases,
  },
  {
    id: STEP_RM_DATABASE_SQL_DATABASES,
    name: 'SQL Databases',
    entities: [
      {
        resourceName: '[RM] SQL Server',
        _type: RM_SQL_SERVER_ENTITY_TYPE,
        _class: RM_DATABASE_SERVER_ENTITY_CLASS,
      },
      {
        resourceName: '[RM] SQL Database',
        _type: RM_SQL_DATABASE_ENTITY_TYPE,
        _class: RM_DATABASE_ENTITY_CLASS,
      },
    ],
    relationships: [
      {
        _type: RM_SQL_SERVER_DATABASE_RELATIONSHIP_TYPE,
        sourceType: RM_SQL_SERVER_ENTITY_TYPE,
        _class: RM_SQL_SERVER_DATABASE_RELATIONSHIP_CLASS,
        targetType: RM_SQL_DATABASE_ENTITY_TYPE,
      },
      createResourceGroupResourceRelationshipMetadata(
        RM_SQL_SERVER_ENTITY_TYPE,
      ),
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchSQLDatabases,
  },
];
