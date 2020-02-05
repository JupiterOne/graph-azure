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
  cloneOldData,
  popOldStorageServiceEntity,
  popOldAccountServiceRelationship,
  popOldContainerEntity,
  popOldServiceContainerRelationship,
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

  const newServiceEntity = createStorageServiceEntity(
    webLinker,
    storageAccount,
    "blob",
  );
  let oldServiceEntity;
  [oldServiceEntity, oldData] = popOldStorageServiceEntity(
    oldData,
    newServiceEntity,
  );

  const newAccountServiceRelationship = createIntegrationRelationship({
    _class: "HAS",
    from: accountEntity,
    to: newServiceEntity,
  });
  let oldAccountServiceRelationship;
  [oldAccountServiceRelationship, oldData] = popOldAccountServiceRelationship(
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
    let oldContainerEntity;
    [oldContainerEntity, oldData] = popOldContainerEntity(
      oldData,
      containerEntity,
    );

    newContainerEntities.push(containerEntity);
    oldContainerEntity && oldContainerEntities.push(oldContainerEntity);

    const serviceContainerRelationship = createIntegrationRelationship({
      _class: "HAS",
      from: newServiceEntity,
      to: containerEntity,
    });
    let oldServiceContainerRelationship;
    [
      oldServiceContainerRelationship,
      oldData,
    ] = popOldServiceContainerRelationship(
      oldData,
      serviceContainerRelationship,
    );

    newServiceContainerRelationships.push(serviceContainerRelationship);
    oldServiceContainerRelationship &&
      oldServiceContainerRelationships.push(oldServiceContainerRelationship);
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
      oldDataLengths: oldData.metadata.lengths,
    },
    "Finished iterating containers for storage account",
  );

  return {
    ...context,
    operationsResults: [...context.operationsResults, operationsSummary],
    oldData,
  };
}
