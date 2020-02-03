import { StorageAccount } from "@azure/arm-storage/esm/models";
import { PersistedObjectAssignable } from "@jupiterone/jupiter-managed-integration-sdk/jupiter-types";
import {
  createIntegrationRelationship,
  EntityFromIntegration,
  generateRelationshipType,
  IntegrationError,
  IntegrationExecutionResult,
  IntegrationRelationship,
  PersisterOperationsResult,
  summarizePersisterOperationsResults,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { AzureWebLinker, createAzureWebLinker } from "../azure";
import {
  createStorageContainerEntity,
  createStorageServiceEntity,
} from "../converters/resources/storage";
import {
  AccountEntity,
  STORAGE_BLOB_SERVICE_ENTITY_TYPE,
  STORAGE_CONTAINER_ENTITY_TYPE,
} from "../jupiterone";
import { AzureExecutionContext } from "../types";

interface OldDataMaps {
  serviceEntityMap: Map<EntityFromIntegration>;
  accountServiceRelationshipMap: Map<IntegrationRelationship>;
  containerEntityMap: Map<EntityFromIntegration>;
  serviceContainerRelationshipMap: Map<IntegrationRelationship>;
}

type Map<T> = Record<string, T>;

interface AzureStorageAccountsContext extends AzureExecutionContext {
  oldData: OldDataMaps;
}

function createOldDataMap([
  storageServiceEntities,
  accountServiceRelationships,
  storageContainerEntities,
  serviceContainerRelationships,
]: [
  EntityFromIntegration[],
  IntegrationRelationship[],
  EntityFromIntegration[],
  IntegrationRelationship[]
]): OldDataMaps {
  return {
    serviceEntityMap: createMap(storageServiceEntities),
    accountServiceRelationshipMap: createMap(accountServiceRelationships),
    containerEntityMap: createMap(storageContainerEntities),
    serviceContainerRelationshipMap: createMap(serviceContainerRelationships),
  };
}

function createMap<T extends PersistedObjectAssignable>(objects: T[]): Map<T> {
  const map: Map<T> = {};
  objects.forEach(obj => {
    map[obj._key] = obj;
  });
  return map;
}

function oldDataGetter(map: keyof OldDataMaps) {
  return (
    oldData: OldDataMaps,
    newData: PersistedObjectAssignable,
  ): EntityFromIntegration | IntegrationRelationship | undefined => {
    return oldData[map][newData._key];
  };
}

const getOldStorageServiceEntity = oldDataGetter("serviceEntityMap");
const getOldAccountServiceRelationship = oldDataGetter(
  "accountServiceRelationshipMap",
);
const getOldContainerEntity = oldDataGetter("containerEntityMap");
const getOldServiceContainerRelationship = oldDataGetter(
  "serviceContainerRelationshipMap",
);

export default async function synchronizeStorageAccounts(
  executionContext: AzureExecutionContext,
): Promise<IntegrationExecutionResult> {
  const { azrm, graph, logger } = executionContext;
  const cache = executionContext.clients.getCache();

  const accountEntity = (await cache.getEntry("account")).data as AccountEntity;
  if (!accountEntity) {
    throw new IntegrationError(
      "Account fetch did not complete, cannot synchronize groups",
    );
  }

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain);

  const operationsResults: PersisterOperationsResult[] = [];

  const oldData = createOldDataMap(
    await Promise.all([
      graph.findEntitiesByType(STORAGE_BLOB_SERVICE_ENTITY_TYPE),
      graph.findRelationshipsByType(
        generateRelationshipType(
          "HAS",
          accountEntity,
          STORAGE_BLOB_SERVICE_ENTITY_TYPE,
        ),
      ),
      graph.findEntitiesByType(STORAGE_CONTAINER_ENTITY_TYPE),
      graph.findRelationshipsByType(
        generateRelationshipType(
          "HAS",
          STORAGE_BLOB_SERVICE_ENTITY_TYPE,
          STORAGE_CONTAINER_ENTITY_TYPE,
        ),
      ),
    ]),
  );

  executionContext.logger.info(
    {},
    "Finished fetching old entities and relationships for synchronizing storage blob containers",
  );

  await azrm.iterateStorageAccounts(async e => {
    logger.info({ storageAccount: e }, "Processing storage account...");

    operationsResults.push(
      await synchronizeStorageAccount(
        { ...executionContext, oldData },
        accountEntity,
        webLinker,
        e,
      ),
    );
  });

  return {
    operations: summarizePersisterOperationsResults(...operationsResults),
  };
}

/**
 * Synchronize containers in the Blob storage service. The service entity is
 * created whether or not there are any blobs.
 */
async function synchronizeBlobStorage(
  context: AzureStorageAccountsContext,
  accountEntity: AccountEntity,
  webLinker: AzureWebLinker,
  storageAccount: StorageAccount,
): Promise<PersisterOperationsResult> {
  const { azrm, persister, oldData } = context;

  const newServiceEntity = createStorageServiceEntity(
    webLinker,
    storageAccount,
    "blob",
  );
  const oldServiceEntity = getOldStorageServiceEntity(
    oldData,
    newServiceEntity,
  );

  const newAccountServiceRelationship = createIntegrationRelationship({
    _class: "HAS",
    from: accountEntity,
    to: newServiceEntity,
  });
  const oldAccountServiceRelationship = getOldAccountServiceRelationship(
    oldData,
    newAccountServiceRelationship,
  );

  const oldContainerEntities: EntityFromIntegration[] = [];
  const newContainerEntities: EntityFromIntegration[] = [];

  const oldServiceContainerRelationships: IntegrationRelationship[] = [];
  const newServiceContainerRelationships: IntegrationRelationship[] = [];

  await azrm.iterateStorageBlobContainers(storageAccount, e => {
    const containerEntity = createStorageContainerEntity(
      webLinker,
      storageAccount,
      e,
    );
    newContainerEntities.push(containerEntity);

    const oldContainerEntity = getOldContainerEntity(oldData, containerEntity);
    oldContainerEntity && oldContainerEntities.push(oldContainerEntity);

    const serviceContainerRelationship = createIntegrationRelationship({
      _class: "HAS",
      from: newServiceEntity,
      to: containerEntity,
    });
    newServiceContainerRelationships.push(serviceContainerRelationship);

    const oldServiceContainerRelationship = getOldServiceContainerRelationship(
      oldData,
      serviceContainerRelationship,
    );
    oldServiceContainerRelationship &&
      oldServiceContainerRelationships.push(oldServiceContainerRelationship);
  });

  return persister.publishPersisterOperations([
    [
      ...persister.processEntities(oldServiceEntity ? [oldServiceEntity] : [], [
        newServiceEntity,
      ]),
      ...persister.processEntities(oldContainerEntities, newContainerEntities),
    ],
    [
      ...persister.processRelationships(
        oldAccountServiceRelationship ? [oldAccountServiceRelationship] : [],
        [newAccountServiceRelationship],
      ),
      ...persister.processRelationships(
        oldServiceContainerRelationships,
        newServiceContainerRelationships,
      ),
    ],
  ]);
}

const storageServiceSynchronizers: {
  [service: string]: (
    context: AzureStorageAccountsContext,
    accountEntity: AccountEntity,
    webLinker: AzureWebLinker,
    storageAccount: StorageAccount,
  ) => Promise<PersisterOperationsResult>;
} = {
  blob: synchronizeBlobStorage,
};

async function synchronizeStorageAccount(
  context: AzureStorageAccountsContext,
  accountEntity: AccountEntity,
  webLinker: AzureWebLinker,
  storageAccount: StorageAccount,
): Promise<PersisterOperationsResult> {
  const { logger } = context;
  const operationsResults: PersisterOperationsResult[] = [];

  const storageAccountLogInfo = {
    storageAccount: {
      id: storageAccount.id,
      kind: storageAccount.kind,
    },
  };

  if (storageAccount.primaryEndpoints) {
    for (const s of Object.keys(storageAccount.primaryEndpoints)) {
      const logInfo = { ...storageAccountLogInfo, service: s };

      const synchronizer = storageServiceSynchronizers[s];
      if (synchronizer) {
        logger.info(logInfo, "Processing storage account service...");
        const operationsSummary = await synchronizer(
          context,
          accountEntity,
          webLinker,
          storageAccount,
        );
        operationsResults.push(operationsSummary);

        logger.info(
          {
            storageAccount,
            operationsSummary,
          },
          "Finished iterating containers for storage account",
        );
      } else {
        logger.warn(logInfo, "Unhandled storage account service!");
      }
    }
  } else {
    logger.info(
      storageAccountLogInfo,
      "Storage account has no registered service endpoints, nothing to synchronize",
    );
  }

  return summarizePersisterOperationsResults(...operationsResults);
}
