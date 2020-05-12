/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Server as MySQLServer } from "@azure/arm-mysql/esm/models";
import { Server as SQLServer } from "@azure/arm-sql/esm/models";
import {
  createIntegrationRelationship,
  DataModel,
  EntityFromIntegration,
  getRawData,
  IntegrationError,
  IntegrationExecutionResult,
  IntegrationRelationship,
  PersisterOperationsResult,
  summarizePersisterOperationsResults,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { AzureWebLinker, createAzureWebLinker } from "../azure";
import { resourceGroupName } from "../azure/utils";
import { createDatabaseEntity, createDbServerEntity } from "../converters";
import { AccountEntity } from "../jupiterone";
import { AzureExecutionContext } from "../types";

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
  const databaseEntityType = `azure_${dbType}_database`;
  const serverEntityType = `azure_${dbType}_server`;
  const serverDatabaseRelationshipType = `azure_${dbType}_server_has_database`;

  const { logger, graph, persister } = executionContext;

  logger.info({ dbType }, "Synchronizing databases...");

  const results: PersisterOperationsResult[] = [];

  const newServerEntities = await fetchDbServers(
    executionContext,
    webLinker,
    dbType,
  );

  const oldServerEntities = await graph.findEntitiesByType(serverEntityType);
  results.push(
    await persister.publishEntityOperations(
      persister.processEntities(oldServerEntities, newServerEntities),
    ),
  );

  for (const serverEntity of newServerEntities) {
    const newDatabaseEntities: EntityFromIntegration[] = [];
    const newServerDbRelationships: IntegrationRelationship[] = [];

    logger.info(
      { dbType, server: serverEntity._key },
      "Synchronizing server databases...",
    );

    const serverData = getRawData(serverEntity);
    const databaseEntities = await fetchDatabases(
      executionContext,
      webLinker,
      serverData,
      dbType,
    );

    // No databaseEntities means there was a failure fetching them for this
    // server. Currently, it is assumed that this is a transient failure, so
    // no deletions are performed.
    if (databaseEntities) {
      for (const databaseEntity of databaseEntities) {
        newServerDbRelationships.push(
          createIntegrationRelationship({
            _class: DataModel.RelationshipClass.HAS,
            from: serverEntity,
            to: databaseEntity,
          }),
        );
        newDatabaseEntities.push(databaseEntity);
      }

      const oldDatabaseEntities = await graph.findEntitiesByType(
        databaseEntityType,
        { serverId: serverEntity._key },
      );

      const oldServerDbRelationships = await graph.findRelationshipsByType(
        serverDatabaseRelationshipType,
        { _fromEntityKey: serverEntity._key },
      );

      const result = await persister.publishPersisterOperations([
        persister.processEntities(oldDatabaseEntities, newDatabaseEntities),
        persister.processRelationships(
          oldServerDbRelationships,
          newServerDbRelationships,
        ),
      ]);

      logger.info(
        { dbType, server: serverEntity._key, operations: result },
        "Synchronizing server databases completed.",
      );

      results.push(result);
    }
  }

  // TODO delete databases that don't have a serverId (all of them when the run starts), OR ...
  //  1. add serverId to database entities in one release
  //  2. maintenance job too add serverId to databases that don't have it
  //  3. refactor this code
  // const orphanedDatabaseEntities = await graph.findEntitiesByType(
  //   databaseEntityType,
  //   undefined,
  //   ["serverId"],
  // );

  // results.push(
  //   await persister.publishEntityOperations(
  //     persister.processEntities(orphanedDatabaseEntities, []),
  //   ),
  // );

  const summarizedResults = summarizePersisterOperationsResults(...results);

  logger.info(
    {
      dbType,
      operations: summarizedResults,
    },
    "Synchronizing databases completed.",
  );

  return summarizedResults;
}

async function fetchDbServers(
  executionContext: AzureExecutionContext,
  webLinker: AzureWebLinker,
  dbType: string,
): Promise<EntityFromIntegration[]> {
  const { logger, azrm } = executionContext;
  const serverEntityType = `azure_${dbType}_server`;
  const entities: EntityFromIntegration[] = [];

  logger.info({ dbType }, "Fetching database servers...");

  switch (dbType) {
    case DatabaseType.MySQL:
      await azrm.iterateMySqlServers((e) => {
        entities.push(createDbServerEntity(webLinker, e, serverEntityType));
      });
      break;
    case DatabaseType.SQL:
      await azrm.iterateSqlServers((e) => {
        entities.push(createDbServerEntity(webLinker, e, serverEntityType));
      });
      break;
  }

  logger.info(
    { dbType, count: entities.length },
    "Fetching database servers completed.",
  );

  return entities;
}

const ENCRYPTION_ENABLED_PATTERN = /enabled/i;

async function fetchDatabases(
  executionContext: AzureExecutionContext,
  webLinker: AzureWebLinker,
  server: MySQLServer | SQLServer,
  dbType: string,
): Promise<EntityFromIntegration[] | undefined> {
  const { azrm, logger } = executionContext;

  logger.info({ dbType, server: server.id }, "Fetching databases...");

  const databaseEntityType = `azure_${dbType}_database`;
  const entities: EntityFromIntegration[] = [];

  try {
    switch (dbType) {
      case DatabaseType.MySQL:
        await azrm.iterateMySqlDatabases(server as MySQLServer, (e) => {
          const encrypted = null;
          entities.push(
            createDatabaseEntity({
              webLinker,
              server,
              data: e,
              _type: databaseEntityType,
              encrypted,
            }),
          );
        });
        break;
      case DatabaseType.SQL:
        await azrm.iterateSqlDatabases(
          server as SQLServer,
          async (database, serviceClient) => {
            let encrypted: boolean | null = null;

            try {
              const encryption = await serviceClient.transparentDataEncryptions.get(
                resourceGroupName(server.id, true)!,
                server.name!,
                database.name!,
              );

              // There is something broken with deserializing this response...
              const status =
                encryption.status ||
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (encryption as any).content["m:properties"]["d:properties"][
                  "d:status"
                ];

              if (status) {
                encrypted = ENCRYPTION_ENABLED_PATTERN.test(status);
              }
            } catch (err) {
              logger.warn(
                { err, server: server.id, database: database.id },
                "Failed to obtain transparentDataEncryptions for database",
              );
            }

            entities.push(
              createDatabaseEntity({
                webLinker,
                server,
                data: database,
                _type: databaseEntityType,
                encrypted,
              }),
            );
          },
        );
        break;
    }
  } catch (err) {
    logger.warn(
      { err, server: { id: server.id, type: server.type } },
      "Failure requesting databases for server",
    );
    return undefined;
  }

  logger.info(
    { dbType, server: server.id, count: entities.length },
    "Fetching databases completed.",
  );

  return entities;
}
