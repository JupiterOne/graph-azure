import {
  IntegrationCacheEntry,
  IntegrationError,
  IntegrationExecutionResult,
  IntegrationRelationship,
  PersisterOperationsResult,
  summarizePersisterOperationsResults,
  IntegrationInstanceAuthorizationError,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { Group, GroupMember } from "../azure";
import { createGroupMemberRelationship } from "../converters";
import { GROUP_MEMBER_RELATIONSHIP_TYPE } from "../jupiterone";
import { AzureExecutionContext, GroupsCacheState } from "../types";

export default async function synchronizeGroupMembers(
  executionContext: AzureExecutionContext,
): Promise<IntegrationExecutionResult> {
  const { persister, graph } = executionContext;
  const groupsCache = executionContext.clients
    .getCache()
    .iterableCache<IntegrationCacheEntry, GroupsCacheState>("groups");

  const groupsState = await groupsCache.getState();
  const baseError = new IntegrationError(
    "Group members fetching did not complete, cannot synchronize group members.",
  );

  if (
    groupsState &&
    groupsState.fetchError &&
    groupsState.fetchError.status === 403
  ) {
    throw new IntegrationInstanceAuthorizationError(baseError, "Group Members");
  } else if (!groupsState || !groupsState.groupMembersFetchCompleted) {
    throw baseError;
  }

  const operationResults: PersisterOperationsResult[] = [];

  await groupsCache.forEach(async e => {
    const newGroupRelationships: IntegrationRelationship[] = [];
    const group: Group = e.entry.data;
    if (group.members) {
      for (const member of group.members as GroupMember[]) {
        newGroupRelationships.push(
          createGroupMemberRelationship(group, member),
        );
      }
    }

    const oldGroupRelationships = await graph.findRelationshipsByType(
      GROUP_MEMBER_RELATIONSHIP_TYPE,
      { groupId: group.id },
    );

    operationResults.push(
      await persister.publishRelationshipOperations(
        persister.processRelationships(
          oldGroupRelationships,
          newGroupRelationships,
        ),
      ),
    );
  });

  return {
    operations: summarizePersisterOperationsResults(...operationResults),
  };
}
