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

  const { graph, persister } = executionContext;

  const [oldDatabaseEntities, oldServerEntities] = await Promise.all([
    graph.findEntitiesByType(databaseEntityType),
    graph.findEntitiesByType(serverEntityType),
  ]);

  const oldServerDbRelationships = await graph.findRelationshipsByType(
    serverDatabaseRelationshipType,
  );

  const newServerEntities = await fetchDbServers(
    executionContext,
    webLinker,
    dbType,
  );

  const newDatabaseEntities: EntityFromIntegration[] = [];
  const newServerDbRelationships: IntegrationRelationship[] = [];
  for (const serverEntity of newServerEntities) {
    const serverData = getRawData(serverEntity);
    const databaseEntities = await fetchDatabases(
      executionContext,
      webLinker,
      serverData,
      dbType,
    );

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
  }

  return await persister.publishPersisterOperations([
    [
      ...persister.processEntities(oldServerEntities, newServerEntities),
      ...persister.processEntities(oldDatabaseEntities, newDatabaseEntities),
    ],
    [
      ...persister.processRelationships(
        oldServerDbRelationships,
        newServerDbRelationships,
      ),
    ],
  ]);
}

async function fetchDbServers(
  executionContext: AzureExecutionContext,
  webLinker: AzureWebLinker,
  dbType: string,
): Promise<EntityFromIntegration[]> {
  const { azrm } = executionContext;
  const serverEntityType = `azure_${dbType}_server`;
  const entities: EntityFromIntegration[] = [];
  switch (dbType) {
    case DatabaseType.MySQL:
      await azrm.iterateMySqlServers(e => {
        entities.push(createDbServerEntity(webLinker, e, serverEntityType));
      });
      break;
    case DatabaseType.SQL:
      await azrm.iterateSqlServers(e => {
        entities.push(createDbServerEntity(webLinker, e, serverEntityType));
      });
      break;
  }
  return entities;
}

const ENCRYPTION_ENABLED_PATTERN = /enabled/i;

async function fetchDatabases(
  executionContext: AzureExecutionContext,
  webLinker: AzureWebLinker,
  server: MySQLServer | SQLServer,
  dbType: string,
): Promise<EntityFromIntegration[]> {
  const { azrm, logger } = executionContext;

  const databaseEntityType = `azure_${dbType}_database`;
  const entities: EntityFromIntegration[] = [];
  switch (dbType) {
    case DatabaseType.MySQL:
      await azrm.iterateMySqlDatabases(server as MySQLServer, e => {
        const encrypted = null;
        entities.push(
          createDatabaseEntity(webLinker, e, databaseEntityType, encrypted),
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
            createDatabaseEntity(
              webLinker,
              database,
              databaseEntityType,
              encrypted,
            ),
          );
        },
      );
      break;
  }
  return entities;
}
