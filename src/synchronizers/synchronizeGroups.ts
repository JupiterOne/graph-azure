import {
  IntegrationCacheEntry,
  IntegrationError,
  IntegrationExecutionResult,
  PersisterOperationsResult,
  summarizePersisterOperationsResults,
} from "@jupiterone/jupiter-managed-integration-sdk";

import {
  createAccountEntity,
  createAccountGroupRelationship,
  createGroupEntity,
} from "../converters";
import {
  ACCOUNT_GROUP_RELATIONSHIP_TYPE,
  AccountGroupRelationship,
  GROUP_ENTITY_TYPE,
  GroupEntity,
} from "../jupiterone";
import { AzureExecutionContext, GroupsCacheState } from "../types";

export default async function synchronizeGroups(
  executionContext: AzureExecutionContext,
): Promise<IntegrationExecutionResult> {
  const { instance } = executionContext;
  const groupsCache = executionContext.clients
    .getCache()
    .iterableCache<IntegrationCacheEntry, GroupsCacheState>("groups");

  const groupsState = await groupsCache.getState();
  if (!groupsState || !groupsState.resourceFetchCompleted) {
    throw new IntegrationError(
      "Groups fetching did not complete, cannot synchronize groups",
    );
  }

  const accountEntity = createAccountEntity(instance);
  const newGroupEntities: GroupEntity[] = [];
  const newGroupRelationships: AccountGroupRelationship[] = [];

  await groupsCache.forEach((e, i, t) => {
    newGroupEntities.push(createGroupEntity(e.data));
    newGroupRelationships.push(
      createAccountGroupRelationship(accountEntity, e.data),
    );
  });

  const groupOperationResults = await processGroups(
    executionContext,
    newGroupEntities,
  );
  const accountGroupOperationResults = await processAccountGroups(
    executionContext,
    newGroupRelationships,
  );

  return {
    operations: summarizePersisterOperationsResults(
      groupOperationResults,
      accountGroupOperationResults,
    ),
  };
}

async function processGroups(
  executionContext: AzureExecutionContext,
  newGroups: GroupEntity[],
): Promise<PersisterOperationsResult> {
  const { graph, persister } = executionContext;
  const oldGroups = await graph.findEntitiesByType(GROUP_ENTITY_TYPE);
  return persister.publishEntityOperations(
    persister.processEntities(oldGroups, newGroups),
  );
}

async function processAccountGroups(
  executionContext: AzureExecutionContext,
  newAccountGroupRelationships: AccountGroupRelationship[],
): Promise<PersisterOperationsResult> {
  const { graph, persister } = executionContext;
  const oldRelationships = await graph.findRelationshipsByType(
    ACCOUNT_GROUP_RELATIONSHIP_TYPE,
  );
  return persister.publishRelationshipOperations(
    persister.processRelationships(
      oldRelationships,
      newAccountGroupRelationships,
    ),
  );
}
