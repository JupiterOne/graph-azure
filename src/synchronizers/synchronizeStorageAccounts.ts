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
  GraphClient,
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

interface OldDataMeta {
  metadata: {
    lengths: Record<keyof OldDataMaps, number>;
  };
}

interface OldDataMaps {
  serviceEntityMap: Record<string, EntityFromIntegration>;
  accountServiceRelationshipMap: Record<string, IntegrationRelationship>;
  containerEntityMap: Record<string, EntityFromIntegration>;
  serviceContainerRelationshipMap: Record<string, IntegrationRelationship>;
}

type OldData = OldDataMaps & OldDataMeta;

interface AzureStorageAccountsContext extends AzureExecutionContext {
  oldData: OldData;
  operationsResults: PersisterOperationsResult[];
}

function createMap<T extends PersistedObjectAssignable>(
  objects: T[],
): Record<string, T> {
  const map: Record<string, T> = {};
  objects.forEach(obj => {
    map[obj._key] = obj;
  });
  return map;
}

async function fetchOldData(
  graph: GraphClient,
  account: AccountEntity,
): Promise<OldData> {
  const [
    storageServiceEntities,
    accountServiceRelationships,
    storageContainerEntities,
    serviceContainerRelationships,
  ] = await Promise.all([
    graph.findEntitiesByType(STORAGE_BLOB_SERVICE_ENTITY_TYPE),
    graph.findRelationshipsByType(
      generateRelationshipType(
        "HAS",
        account,
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
  ]);

  return {
    metadata: {
      lengths: {
        serviceEntityMap: storageServiceEntities.length,
        accountServiceRelationshipMap: accountServiceRelationships.length,
        containerEntityMap: storageContainerEntities.length,
        serviceContainerRelationshipMap: serviceContainerRelationships.length,
      },
    },
    serviceEntityMap: createMap(storageServiceEntities),
    accountServiceRelationshipMap: createMap(accountServiceRelationships),
    containerEntityMap: createMap(storageContainerEntities),
    serviceContainerRelationshipMap: createMap(serviceContainerRelationships),
  };
}

function cloneOldData({
  oldData,
  mapToUpdate,
  updatedMap,
}: {
  oldData: OldData;
  mapToUpdate?: keyof OldDataMaps;
  updatedMap?: Record<string, EntityFromIntegration | IntegrationRelationship>;
}): OldData {
  const oldDataClone = {
    ...oldData,
    metadata: {
      ...oldData.metadata,
      lengths: {
        ...oldData.metadata.lengths,
      },
    },
  };

  if (mapToUpdate && updatedMap) {
    oldDataClone[mapToUpdate] = updatedMap;
    oldDataClone.metadata.lengths[mapToUpdate] =
      oldData.metadata.lengths[mapToUpdate] - 1;
  }

  return oldDataClone;
}

function oldDataGetter(mapKey: keyof OldDataMaps) {
  return (
    oldData: OldData,
    newData: PersistedObjectAssignable,
  ): [EntityFromIntegration | IntegrationRelationship | undefined, OldData] => {
    const map = oldData[mapKey];
    const obj = map[newData._key];

    const { [newData._key]: _, ...updatedMap } = map;
    const updatedOldData = cloneOldData({
      oldData,
      mapToUpdate: mapKey,
      updatedMap,
    });

    return [obj, updatedOldData];
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
  const { azrm, graph, persister, logger } = executionContext;
  const cache = executionContext.clients.getCache();

  const accountEntity = (await cache.getEntry("account")).data as AccountEntity;
  if (!accountEntity) {
    throw new IntegrationError(
      "Account fetch did not complete, cannot synchronize groups",
    );
  }

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain);
  const operationsResults: PersisterOperationsResult[] = [];
  let oldData = await fetchOldData(graph, accountEntity);

  logger.info(
    oldData.metadata.lengths,
    "Finished fetching old entities and relationships for synchronizing storage blob containers",
  );

  await azrm.iterateStorageAccounts(async e => {
    logger.info({ storageAccount: e }, "Processing storage account...");

    const storageAccountContext = await synchronizeStorageAccount(
      { ...executionContext, oldData, operationsResults: [] },
      accountEntity,
      webLinker,
      e,
    );

    operationsResults.push(
      summarizePersisterOperationsResults(
        ...storageAccountContext.operationsResults,
      ),
    );

    oldData = storageAccountContext.oldData;
  });

  const deleteOperationsResult = await persister.publishPersisterOperations([
    [
      ...persister.processEntities(Object.values(oldData.serviceEntityMap), []),
      ...persister.processEntities(
        Object.values(oldData.containerEntityMap),
        [],
      ),
    ],
    [
      ...persister.processRelationships(
        Object.values(oldData.accountServiceRelationshipMap),
        [],
      ),
      ...persister.processRelationships(
        Object.values(oldData.serviceContainerRelationshipMap),
        [],
      ),
    ],
  ]);

  return {
    operations: summarizePersisterOperationsResults(
      ...operationsResults,
      deleteOperationsResult,
    ),
  };
}

async function synchronizeStorageAccount(
  context: AzureStorageAccountsContext,
  accountEntity: AccountEntity,
  webLinker: AzureWebLinker,
  storageAccount: StorageAccount,
): Promise<AzureStorageAccountsContext> {
  const { logger } = context;

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
        context = await synchronizer(
          context,
          accountEntity,
          webLinker,
          storageAccount,
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

  return context;
}

const storageServiceSynchronizers: {
  [service: string]: (
    context: AzureStorageAccountsContext,
    accountEntity: AccountEntity,
    webLinker: AzureWebLinker,
    storageAccount: StorageAccount,
  ) => Promise<AzureStorageAccountsContext>;
} = {
  blob: synchronizeBlobStorage,
};

/**
 * Synchronize containers in the Blob storage service. The service entity is
 * created whether or not there are any blobs.
 */
async function synchronizeBlobStorage(
  context: AzureStorageAccountsContext,
  accountEntity: AccountEntity,
  webLinker: AzureWebLinker,
  storageAccount: StorageAccount,
): Promise<AzureStorageAccountsContext> {
  const { azrm, persister, logger } = context;

  let oldData = cloneOldData({ oldData: context.oldData });

  const newServiceEntity = createStorageServiceEntity(
    webLinker,
    storageAccount,
    "blob",
  );
  let oldServiceEntity;
  [oldServiceEntity, oldData] = getOldStorageServiceEntity(
    oldData,
    newServiceEntity,
  );

  logger.info(
    oldData.metadata.lengths,
    "Finished getting old storage service entity and reassigning old data",
  );

  const newAccountServiceRelationship = createIntegrationRelationship({
    _class: "HAS",
    from: accountEntity,
    to: newServiceEntity,
  });
  let oldAccountServiceRelationship;
  [oldAccountServiceRelationship, oldData] = getOldAccountServiceRelationship(
    oldData,
    newAccountServiceRelationship,
  );

  logger.info(
    oldData.metadata.lengths,
    "Finished getting old account service relationship and reassigning old data",
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

    let oldContainerEntity;
    [oldContainerEntity, oldData] = getOldContainerEntity(
      oldData,
      containerEntity,
    );
    oldContainerEntity && oldContainerEntities.push(oldContainerEntity);

    logger.info(
      oldData.metadata.lengths,
      "Finished getting old container entity and reassigning old data",
    );

    const serviceContainerRelationship = createIntegrationRelationship({
      _class: "HAS",
      from: newServiceEntity,
      to: containerEntity,
    });
    newServiceContainerRelationships.push(serviceContainerRelationship);

    let oldServiceContainerRelationship;
    [
      oldServiceContainerRelationship,
      oldData,
    ] = getOldServiceContainerRelationship(
      oldData,
      serviceContainerRelationship,
    );
    oldServiceContainerRelationship &&
      oldServiceContainerRelationships.push(oldServiceContainerRelationship);

    logger.info(
      oldData.metadata.lengths,
      "Finished getting old service container relationship and reassigning old data",
    );
  });

  const operationsSummary = await persister.publishPersisterOperations([
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

  logger.info(
    {
      storageAccount,
      operationsSummary,
    },
    "Finished iterating containers for storage account",
  );

  return {
    ...context,
    operationsResults: [...context.operationsResults, operationsSummary],
    oldData,
  };
}
