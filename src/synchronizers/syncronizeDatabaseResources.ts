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
  createSqlDatabaseEntity,
  createSqlServerEntity,
  createSqlServerDatabaseRelationship,
} from "../converters";
import {
  AccountEntity,
  SQL_DATABASE_ENTITY_TYPE,
  SQL_SERVER_ENTITY_TYPE,
  SQL_SERVER_DATABASE_RELATIONSHIP_TYPE,
} from "../jupiterone";
import { AzureExecutionContext } from "../types";
import { Server } from "@azure/arm-sql/esm/models";

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

  const operationsResultSQL = await synchronizeSQL(executionContext, webLinker);

  return {
    operations: summarizePersisterOperationsResults(operationsResultSQL),
  };
}

async function synchronizeSQL(
  executionContext: AzureExecutionContext,
  webLinker: AzureWebLinker,
): Promise<PersisterOperationsResult> {
  const { azrm, graph, persister } = executionContext;
  const [
    oldDBs,
    oldServers,
    oldServerDbRelationships,
    newServers,
  ] = await Promise.all([
    graph.findEntitiesByType(SQL_DATABASE_ENTITY_TYPE),
    graph.findEntitiesByType(SQL_SERVER_ENTITY_TYPE),
    graph.findRelationshipsByType(SQL_SERVER_DATABASE_RELATIONSHIP_TYPE),
    fetchSqlServers(azrm, webLinker),
  ]);

  const newDBs: EntityFromIntegration[] = [];
  const newSqlServerDbRelationships: IntegrationRelationship[] = [];
  for (const s of newServers) {
    const server = getRawData(s) as Server;
    const databases = await fetchSqlDatabases(azrm, webLinker, server);

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

async function fetchSqlServers(
  client: ResourceManagerClient,
  webLinker: AzureWebLinker,
): Promise<EntityFromIntegration[]> {
  const entities: EntityFromIntegration[] = [];
  await client.iterateSqlServers(e => {
    entities.push(createSqlServerEntity(webLinker, e));
  });
  return entities;
}

async function fetchSqlDatabases(
  client: ResourceManagerClient,
  webLinker: AzureWebLinker,
  server: Server,
): Promise<EntityFromIntegration[]> {
  const entities: EntityFromIntegration[] = [];
  await client.iterateSqlDatabases(server, e => {
    entities.push(createSqlDatabaseEntity(webLinker, e));
  });
  return entities;
}
