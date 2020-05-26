import { AD_ACCOUNT } from "../../active-directory";
import {
  RM_DATABASE_MARIADB_DATABASES,
  RM_DATABASE_MYSQL_DATABASES,
  RM_DATABASE_POSTGRESQL_DATABASES,
  RM_DATABASE_SQL_DATABASES,
} from "./constants";
import {
  fetchMariaDBDatabases,
  RM_MARIADB_DATABASE_ENTITY_TYPE,
  RM_MARIADB_SERVER_DATABASE_RELATIONSHIP_TYPE,
  RM_MARIADB_SERVER_ENTITY_TYPE,
} from "./mariadb";
import {
  fetchMySQLDatabases,
  RM_MYSQL_DATABASE_ENTITY_TYPE,
  RM_MYSQL_SERVER_DATABASE_RELATIONSHIP_TYPE,
  RM_MYSQL_SERVER_ENTITY_TYPE,
} from "./mysql";
import {
  fetchPostgreSQLDatabases,
  RM_POSTGRESQL_DATABASE_ENTITY_TYPE,
  RM_POSTGRESQL_SERVER_DATABASE_RELATIONSHIP_TYPE,
  RM_POSTGRESQL_SERVER_ENTITY_TYPE,
} from "./postgresql";
import {
  fetchSQLDatabases,
  RM_SQL_DATABASE_ENTITY_TYPE,
  RM_SQL_SERVER_DATABASE_RELATIONSHIP_TYPE,
  RM_SQL_SERVER_ENTITY_TYPE,
} from "./sql";

export const databaseSteps = [
  {
    id: RM_DATABASE_MARIADB_DATABASES,
    name: "MariaDB Databases",
    types: [
      RM_MARIADB_SERVER_ENTITY_TYPE,
      RM_MARIADB_DATABASE_ENTITY_TYPE,
      RM_MARIADB_SERVER_DATABASE_RELATIONSHIP_TYPE,
    ],
    dependsOn: [AD_ACCOUNT],
    executionHandler: fetchMariaDBDatabases,
  },
  {
    id: RM_DATABASE_MYSQL_DATABASES,
    name: "MySQL Databases",
    types: [
      RM_MYSQL_SERVER_ENTITY_TYPE,
      RM_MYSQL_DATABASE_ENTITY_TYPE,
      RM_MYSQL_SERVER_DATABASE_RELATIONSHIP_TYPE,
    ],
    dependsOn: [AD_ACCOUNT],
    executionHandler: fetchMySQLDatabases,
  },
  {
    id: RM_DATABASE_POSTGRESQL_DATABASES,
    name: "PostgreSQL Databases",
    types: [
      RM_POSTGRESQL_SERVER_ENTITY_TYPE,
      RM_POSTGRESQL_DATABASE_ENTITY_TYPE,
      RM_POSTGRESQL_SERVER_DATABASE_RELATIONSHIP_TYPE,
    ],
    dependsOn: [AD_ACCOUNT],
    executionHandler: fetchPostgreSQLDatabases,
  },
  {
    id: RM_DATABASE_SQL_DATABASES,
    name: "SQL Databases",
    types: [
      RM_SQL_SERVER_ENTITY_TYPE,
      RM_SQL_DATABASE_ENTITY_TYPE,
      RM_SQL_SERVER_DATABASE_RELATIONSHIP_TYPE,
    ],
    dependsOn: [AD_ACCOUNT],
    executionHandler: fetchSQLDatabases,
  },
];
