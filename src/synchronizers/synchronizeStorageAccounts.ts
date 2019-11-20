import { StorageAccount } from "@azure/arm-storage/esm/models";
import {
  EntityFromIntegration,
  IntegrationError,
  IntegrationExecutionResult,
  PersisterOperationsResult,
  RelationshipFromIntegration,
  summarizePersisterOperationsResults,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { AzureWebLinker, createAzureWebLinker } from "../azure";
import { createStorageContainerEntity } from "../converters/resources/storage";
import {
  AccountEntity,
  STORAGE_CONTAINER_ENTITY_TYPE,
  STORAGE_CONTAINER_RELATIONSHIP_TYPE,
} from "../jupiterone";
import { AzureExecutionContext } from "../types";

export default async function synchronizeStorageAccounts(
  executionContext: AzureExecutionContext,
): Promise<IntegrationExecutionResult> {
  const { azrm } = executionContext;
  const cache = executionContext.clients.getCache();

  const accountEntity = (await cache.getEntry("account")).data as AccountEntity;
  if (!accountEntity) {
    throw new IntegrationError(
      "Account fetch did not complete, cannot synchronize groups",
    );
  }

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain);

  const operationsResults: PersisterOperationsResult[] = [];

  await azrm.iterateStorageAccounts(async e => {
    operationsResults.push(
      await synchronizeStorageAccount(
        executionContext,
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

async function synchronizeBlobStorage(
  executionContext: AzureExecutionContext,
  accountEntity: AccountEntity,
  webLinker: AzureWebLinker,
  storageAccount: StorageAccount,
): Promise<PersisterOperationsResult> {
  const { azrm, graph, persister } = executionContext;

  // const newServiceEntity = createStorageAccountEntity(webLinker, storageAccount, "blob");
  const newContainerEntities: EntityFromIntegration[] = [];
  const newServiceContainerRelationships: RelationshipFromIntegration[] = [];

  await azrm.iterateStorageBlobContainers(storageAccount, e => {
    const containerEntity = createStorageContainerEntity(webLinker, e);
    newContainerEntities.push(containerEntity);
    // newServiceContainerRelationships.push(createStorageContainerRelationship(newServiceEntity, containerEntity))
  });

  const [
    oldContainerEntities,
    oldServiceContainerRelationships,
  ] = await Promise.all([
    graph.findEntitiesByType(STORAGE_CONTAINER_ENTITY_TYPE),
    graph.findRelationshipsByType(STORAGE_CONTAINER_RELATIONSHIP_TYPE),
  ]);

  return persister.publishPersisterOperations([
    persister.processEntities(oldContainerEntities, newContainerEntities),
    persister.processRelationships(
      oldServiceContainerRelationships,
      newServiceContainerRelationships,
    ),
  ]);
}

const storageServiceSynchronizers: { [service: string]: Function } = {
  blob: synchronizeBlobStorage,
};

async function synchronizeStorageAccount(
  executionContext: AzureExecutionContext,
  accountEntity: AccountEntity,
  webLinker: AzureWebLinker,
  storageAccount: StorageAccount,
): Promise<PersisterOperationsResult> {
  const { logger } = executionContext;
  const operationsResults: PersisterOperationsResult[] = [];

  if (storageAccount.primaryEndpoints) {
    for (const s of Object.keys(storageAccount.primaryEndpoints)) {
      const synchronizer = storageServiceSynchronizers[s];
      if (synchronizer) {
        operationsResults.push(
          await synchronizer(
            executionContext,
            accountEntity,
            webLinker,
            storageAccount,
          ),
        );
      } else {
        logger.warn(
          { storageAccount, service: s },
          "Unhandled storage account service!",
        );
      }
    }
  } else {
    logger.info(
      { storageAccount },
      "Storage account has no registered service endpoints, nothing to synchronize",
    );
  }

  return summarizePersisterOperationsResults(...operationsResults);
}
