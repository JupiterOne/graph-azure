import { StorageAccount } from "@azure/arm-storage/esm/models";
import {
  createIntegrationRelationship,
  EntityFromIntegration,
  IntegrationError,
  IntegrationExecutionResult,
  IntegrationRelationship,
  PersisterOperationsResult,
  summarizePersisterOperationsResults,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { AzureWebLinker, createAzureWebLinker } from "../../azure";
import {
  createStorageContainerEntity,
  createStorageServiceEntity,
} from "../../converters/resources/storage";
import { AccountEntity } from "../../jupiterone";
import { AzureExecutionContext } from "../../types";

import {
  OldData,
  fetchOldData,
  entityOrRelationship,
  cloneOldData,
  getOldStorageServiceEntity,
  getOldAccountServiceRelationship,
  getOldContainerEntity,
  getOldServiceContainerRelationship,
} from "./oldData";

interface AzureStorageAccountsContext extends AzureExecutionContext {
  oldData: OldData;
  operationsResults: PersisterOperationsResult[];
}

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

  const [
    newServiceEntity,
    oldServiceEntity,
    serviceOldData,
  ] = entityOrRelationship({
    newEntityConstructor: () => {
      return createStorageServiceEntity(webLinker, storageAccount, "blob");
    },
    oldData,
    oldDataGetter: getOldStorageServiceEntity,
  });
  oldData = serviceOldData;

  logger.info(
    oldData.metadata.lengths,
    "Finished getting old storage service entity and reassigning old data",
  );

  const [
    newAccountServiceRelationship,
    oldAccountServiceRelationship,
    accountServiceOldData,
  ] = entityOrRelationship({
    newEntityConstructor: () => {
      return createIntegrationRelationship({
        _class: "HAS",
        from: accountEntity,
        to: newServiceEntity,
      });
    },
    oldData,
    oldDataGetter: getOldAccountServiceRelationship,
  });
  oldData = accountServiceOldData;

  logger.info(
    oldData.metadata.lengths,
    "Finished getting old account service relationship and reassigning old data",
  );

  const oldContainerEntities: EntityFromIntegration[] = [];
  const newContainerEntities: EntityFromIntegration[] = [];
  const oldServiceContainerRelationships: IntegrationRelationship[] = [];
  const newServiceContainerRelationships: IntegrationRelationship[] = [];

  await azrm.iterateStorageBlobContainers(storageAccount, e => {
    const [
      containerEntity,
      oldContainerEntity,
      containerOldData,
    ] = entityOrRelationship({
      newEntityConstructor: () => {
        return createStorageContainerEntity(webLinker, storageAccount, e);
      },
      oldData,
      oldDataGetter: getOldContainerEntity,
    });
    oldData = containerOldData;

    newContainerEntities.push(containerEntity);
    oldContainerEntity && oldContainerEntities.push(oldContainerEntity);

    logger.info(
      oldData.metadata.lengths,
      "Finished getting old container entity and reassigning old data",
    );

    const [
      serviceContainerRelationship,
      oldServiceContainerRelationship,
      serviceContainerOldData,
    ] = entityOrRelationship({
      newEntityConstructor: () => {
        return createIntegrationRelationship({
          _class: "HAS",
          from: newServiceEntity,
          to: containerEntity,
        });
      },
      oldData,
      oldDataGetter: getOldServiceContainerRelationship,
    });
    oldData = serviceContainerOldData;

    newServiceContainerRelationships.push(serviceContainerRelationship);
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
