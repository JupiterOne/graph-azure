import {
  IntegrationCacheEntry,
  IntegrationError,
  IntegrationExecutionResult,
  PersisterOperationsResult,
  summarizePersisterOperationsResults,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { Group, GroupMember } from "../azure";
import { createGroupMemberRelationship } from "../converters";
import {
  GROUP_MEMBER_RELATIONSHIP_TYPE,
  GroupMemberRelationship,
} from "../jupiterone";
import { AzureExecutionContext, GroupsCacheState } from "../types";

export default async function synchronizeGroupMembers(
  executionContext: AzureExecutionContext,
): Promise<IntegrationExecutionResult> {
  const { persister, graph } = executionContext;
  const groupsCache = executionContext.clients
    .getCache()
    .iterableCache<IntegrationCacheEntry, GroupsCacheState>("groups");

  const groupsState = await groupsCache.getState();
  if (!groupsState || !groupsState.groupMembersFetchCompleted) {
    throw new IntegrationError(
      "Group members fetching did not complete, cannot synchronize group members",
    );
  }

  const operationResults: PersisterOperationsResult[] = [];

  await groupsCache.forEach(async (e, i, t) => {
    const newGroupRelationships: GroupMemberRelationship[] = [];
    const group: Group = e.data;
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
