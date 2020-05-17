/* eslint-disable @typescript-eslint/no-explicit-any */
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
  setRawData,
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

    // No databaseEntities means there was a failure fetching them for this
    // server. In the case this is a transient failure, ideally we would avoid
    // deleting previously ingested databases for this server. That would
    // require that we process each server independently, fetching the databases
    // and relationships that are scoped to this one server.
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
    }
  }

  const [oldDatabaseEntities, oldServerEntities] = await Promise.all([
    graph.findEntitiesByType(databaseEntityType),
    graph.findEntitiesByType(serverEntityType),
  ]);

  const oldServerDbRelationships = await graph.findRelationshipsByType(
    serverDatabaseRelationshipType,
  );

  const result = await persister.publishPersisterOperations([
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

  logger.info(
    { dbType, operations: result },
    "Synchronizing databases completed.",
  );

  return result;
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
      await azrm.iterateSqlServers(async (server, serviceClient) => {
        const entity = createDbServerEntity(
          webLinker,
          server,
          serverEntityType,
        );

        try {
          const auditing = await serviceClient.serverBlobAuditingPolicies.get(
            resourceGroupName(server.id, true)!,
            server.name!,
          );

          setRawData(entity, { name: "auditing", rawData: auditing });

          const auditStatus =
            auditing.state ||
            (auditing as any).content["m:properties"]["d:properties"][
              "d:state"
            ];

          if (auditStatus) {
            Object.assign(entity, {
              auditingEnabled: ENCRYPTION_ENABLED_PATTERN.test(status),
              auditLogDestination: auditing.storageEndpoint,
              auditLogAccessKey: auditing.storageAccountAccessKey,
              auditLogRetentionDays: auditing.retentionDays,
              auditLogMonitorEnabled: auditing.isAzureMonitorTargetEnabled,
            });
          }
        } catch (err) {
          logger.warn(
            { err, server: server.id },
            "Failed to obtain databaseBlobAuditingPolicies for server",
          );
        }

        entities.push(entity);
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
  switch (dbType) {
    case DatabaseType.MySQL:
      try {
        await azrm.iterateMySqlDatabases(server as MySQLServer, (e) => {
          const encrypted = null;
          entities.push(
            createDatabaseEntity(webLinker, e, databaseEntityType, encrypted),
          );
        });
      } catch (err) {
        logger.warn(
          { err, server: { id: server.id, type: server.type } },
          "Failure requesting databases for server",
        );
        return undefined;
      }
      break;
    case DatabaseType.SQL:
      await azrm.iterateSqlDatabases(
        server as SQLServer,
        async (database, serviceClient) => {
          let encrypted: boolean | null = null;

          const entity = createDatabaseEntity(
            webLinker,
            database,
            databaseEntityType,
            encrypted,
          );

          try {
            const encryption = await serviceClient.transparentDataEncryptions.get(
              resourceGroupName(server.id, true)!,
              server.name!,
              database.name!,
            );

            // There is something broken with deserializing this response...
            const encryptionStatus =
              encryption.status ||
              (encryption as any).content["m:properties"]["d:properties"][
                "d:status"
              ];

            if (encryptionStatus) {
              encrypted = ENCRYPTION_ENABLED_PATTERN.test(status);
              (entity as any).encrypted = encrypted;
            }
          } catch (err) {
            logger.warn(
              { err, server: server.id, database: database.id },
              "Failed to obtain transparentDataEncryptions for database",
            );
          }

          try {
            const auditing = await serviceClient.databaseBlobAuditingPolicies.get(
              resourceGroupName(server.id, true)!,
              server.name!,
              database.name!,
            );

            setRawData(entity, { name: "auditing", rawData: auditing });

            const auditStatus =
              auditing.state ||
              (auditing as any).content["m:properties"]["d:properties"][
                "d:state"
              ];

            if (auditStatus) {
              Object.assign(entity, {
                auditingEnabled: ENCRYPTION_ENABLED_PATTERN.test(status),
                auditLogDestination: auditing.storageEndpoint,
                auditLogAccessKey: auditing.storageAccountAccessKey,
                auditLogRetentionDays: auditing.retentionDays,
                auditLogMonitorEnabled: auditing.isAzureMonitorTargetEnabled,
              });
            }
          } catch (err) {
            logger.warn(
              { err, server: server.id, database: database.id },
              "Failed to obtain databaseBlobAuditingPolicies for database",
            );
          }

          entities.push(entity);
        },
      );
      break;
  }

  logger.info(
    { dbType, server: server.id, count: entities.length },
    "Fetching databases completed.",
  );

  return entities;
}
