import {
  getRawData,
  summarizePersisterOperationsResults,
  EntityFromIntegration,
  IntegrationError,
  IntegrationExecutionResult,
  IntegrationRelationship,
  PersisterOperationsResult,
} from "@jupiterone/jupiter-managed-integration-sdk";

import {
  AzureWebLinker,
  createAzureWebLinker,
  ResourceManagerClient,
} from "../azure";
import {
  createDatabaseEntity,
  createDbServerEntity,
  createSqlServerDatabaseRelationship,
} from "../converters";
import { AccountEntity } from "../jupiterone";
import { AzureExecutionContext } from "../types";
import { Server as SQLServer } from "@azure/arm-sql/esm/models";
import { Server as MySQLServer } from "@azure/arm-mysql/esm/models";

enum DatabaseType {
  MariaDB = "mariadb",
  MySQL = "mysql",
  PostgreSQL = "postgresql",
  SQL = "sql",
}

export default async function synchronizeDatabaseResources(
  executionContext: AzureExecutionContext,
): Promise<IntegrationExecutionResult> {
  const cache = executionContext.clients.getCache();

  const accountEntity = (await cache.getEntry("account")).data as AccountEntity;
  if (!accountEntity) {
    throw new IntegrationError(
      "Account fetch did not complete, cannot synchronize database resources",
    );
  }

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain);

  return {
    operations: summarizePersisterOperationsResults(
      await synchronize(executionContext, webLinker, DatabaseType.MariaDB),
      await synchronize(executionContext, webLinker, DatabaseType.MySQL),
      await synchronize(executionContext, webLinker, DatabaseType.PostgreSQL),
      await synchronize(executionContext, webLinker, DatabaseType.SQL),
    ),
  };
}

async function synchronize(
  executionContext: AzureExecutionContext,
  webLinker: AzureWebLinker,
  dbType: string,
): Promise<PersisterOperationsResult> {
  const DATABASE_ENTITY_TYPE = `azure_${dbType}_database`;
  const DB_SERVER_ENTITY_TYPE = `azure_${dbType}_server`;
  const SERVER_DATABASE_RELATIONSHIP_TYPE = `azure_${dbType}_server_has_database`;

  const { azrm, graph, persister } = executionContext;
  const [
    oldDBs,
    oldServers,
    oldServerDbRelationships,
    newServers,
  ] = (await Promise.all([
    graph.findEntitiesByType(DATABASE_ENTITY_TYPE),
    graph.findEntitiesByType(DB_SERVER_ENTITY_TYPE),
    graph.findRelationshipsByType(SERVER_DATABASE_RELATIONSHIP_TYPE),
    fetchDbServers(azrm, webLinker, dbType),
  ])) as [
    EntityFromIntegration[],
    EntityFromIntegration[],
    IntegrationRelationship[],
    EntityFromIntegration[]
  ];

  const newDBs: EntityFromIntegration[] = [];
  const newSqlServerDbRelationships: IntegrationRelationship[] = [];
  for (const s of newServers) {
    const server = getRawData(s);
    const databases = await fetchDatabases(azrm, webLinker, server, dbType);

    for (const db of databases) {
      newSqlServerDbRelationships.push(
        createSqlServerDatabaseRelationship(s, db),
      );
      newDBs.push(db);
    }
  }

  return await persister.publishPersisterOperations([
    [
      ...persister.processEntities(oldServers, newServers),
      ...persister.processEntities(oldDBs, newDBs),
    ],
    [
      ...persister.processRelationships(
        oldServerDbRelationships,
        newSqlServerDbRelationships,
      ),
    ],
  ]);
}

async function fetchDbServers(
  client: ResourceManagerClient,
  webLinker: AzureWebLinker,
  dbType: string,
): Promise<EntityFromIntegration[]> {
  const DB_SERVER_ENTITY_TYPE = `azure_${dbType}_server`;
  const entities: EntityFromIntegration[] = [];
  switch (dbType) {
    case DatabaseType.MySQL:
      await client.iterateMySqlServers(e => {
        entities.push(
          createDbServerEntity(webLinker, e, DB_SERVER_ENTITY_TYPE),
        );
      });
      break;
    case DatabaseType.SQL:
      await client.iterateSqlServers(e => {
        entities.push(
          createDbServerEntity(webLinker, e, DB_SERVER_ENTITY_TYPE),
        );
      });
      break;
  }
  return entities;
}

async function fetchDatabases(
  client: ResourceManagerClient,
  webLinker: AzureWebLinker,
  server: MySQLServer | SQLServer,
  dbType: string,
): Promise<EntityFromIntegration[]> {
  const DATABASE_ENTITY_TYPE = `azure_${dbType}_database`;
  const entities: EntityFromIntegration[] = [];
  switch (dbType) {
    case DatabaseType.MySQL:
      await client.iterateMySqlDatabases(server as MySQLServer, e => {
        entities.push(createDatabaseEntity(webLinker, e, DATABASE_ENTITY_TYPE));
      });
      break;
    case DatabaseType.SQL:
      await client.iterateSqlDatabases(server as SQLServer, e => {
        entities.push(createDatabaseEntity(webLinker, e, DATABASE_ENTITY_TYPE));
      });
      break;
  }
  return entities;
}
