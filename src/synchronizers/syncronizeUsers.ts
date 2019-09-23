import {
  IntegrationCacheEntry,
  IntegrationError,
  IntegrationExecutionResult,
  PersisterOperationsResult,
  summarizePersisterOperationsResults,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { createAccountUserRelationship, createUserEntity } from "../converters";
import {
  ACCOUNT_USER_RELATIONSHIP_TYPE,
  AccountEntity,
  AccountUserRelationship,
  USER_ENTITY_TYPE,
  UserEntity,
} from "../jupiterone";
import { AzureExecutionContext, UsersCacheState } from "../types";

export default async function synchronizeUsers(
  executionContext: AzureExecutionContext,
): Promise<IntegrationExecutionResult> {
  const cache = executionContext.clients.getCache();
  const usersCache = cache.iterableCache<
    IntegrationCacheEntry,
    UsersCacheState
  >("users");

  const usersState = await usersCache.getState();
  if (!usersState || !usersState.resourceFetchCompleted) {
    throw new IntegrationError(
      "Users fetching did not complete, cannot synchronize users",
    );
  }

  const accountEntity = (await cache.getEntry("account")).data as AccountEntity;
  if (!accountEntity) {
    throw new IntegrationError(
      "Account fetch did not complete, cannot synchronize users",
    );
  }

  const newUserEntities: UserEntity[] = [];
  const newUserRelationships: AccountUserRelationship[] = [];

  await usersCache.forEach((e, i, t) => {
    newUserEntities.push(createUserEntity(e.data));
    newUserRelationships.push(
      createAccountUserRelationship(accountEntity, e.data),
    );
  });

  const userOperationResults = await processUsers(
    executionContext,
    newUserEntities,
  );
  const accountUserOperationResults = await processAccountUsers(
    executionContext,
    newUserRelationships,
  );

  return {
    operations: summarizePersisterOperationsResults(
      userOperationResults,
      accountUserOperationResults,
    ),
  };
}

async function processUsers(
  executionContext: AzureExecutionContext,
  newUsers: UserEntity[],
): Promise<PersisterOperationsResult> {
  const { graph, persister } = executionContext;
  const oldUsers = await graph.findEntitiesByType(USER_ENTITY_TYPE);
  return persister.publishEntityOperations(
    persister.processEntities(oldUsers, newUsers),
  );
}

async function processAccountUsers(
  executionContext: AzureExecutionContext,
  newAccountUserRelationships: AccountUserRelationship[],
): Promise<PersisterOperationsResult> {
  const { graph, persister } = executionContext;
  const oldRelationships = await graph.findRelationshipsByType(
    ACCOUNT_USER_RELATIONSHIP_TYPE,
  );
  return persister.publishRelationshipOperations(
    persister.processRelationships(
      oldRelationships,
      newAccountUserRelationships,
    ),
  );
}
