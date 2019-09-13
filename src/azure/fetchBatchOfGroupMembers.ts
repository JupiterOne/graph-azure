import {
  IntegrationCacheEntry,
  IntegrationStepExecutionResult,
  IntegrationStepIterationState,
} from "@jupiterone/jupiter-managed-integration-sdk";
import { Group } from "@microsoft/microsoft-graph-types";

import { AzureExecutionContext, GroupsCacheState } from "../types";
import { getBatchPages, getPageLimit } from "./batch";
import { GroupMember } from "./types";

export default async function fetchBatchOfGroupMembers(
  executionContext: AzureExecutionContext,
  iterationState: IntegrationStepIterationState,
): Promise<IntegrationStepExecutionResult> {
  const { azure } = executionContext;
  const cache = executionContext.clients.getCache();
  const groupsCache = cache.iterableCache<
    IntegrationCacheEntry,
    GroupsCacheState
  >("groups");

  const batchPages = getBatchPages("group_members", 10);
  const limit = getPageLimit("group_members", 200);

  let membersCount: number = iterationState.state.count || 0;
  let nextLink: string | undefined = iterationState.state.nextLink;
  let groupIndex: number = iterationState.state.groupIndex || 0;

  let pagesProcessed = 0;
  let totalGroups = 0;

  await groupsCache.forEach(
    async (
      groupEntry: IntegrationCacheEntry,
      groupEntryIndex: number,
      groupEntryCount: number,
    ) => {
      totalGroups = groupEntryCount;

      const group = groupEntry.data as Group;

      // load up accumulated list of members
      const groupMembers: GroupMember[] =
        (group.members as GroupMember[]) || [];

      // fetch members for group
      do {
        const response = await azure.fetchGroupMembers(group.id!, {
          nextLink,
          limit,
          // Changes here should be reflected in `GroupMember`
          select: ["id", "displayName", "jobTitle", "mail"],
        });

        if (response) {
          groupMembers.push(...response.resources);
          membersCount += response.resources.length;
          nextLink = response.nextLink;
        }

        pagesProcessed++;
      } while (pagesProcessed < batchPages && nextLink);

      // update the cached group to include members loaded during this invocation
      await cache.putEntry({
        key: groupEntry.key,
        data: { ...groupEntry.data, members: groupMembers },
      });

      // move to the next group if there are no more members in this group
      if (!nextLink) {
        groupIndex = groupEntryIndex + 1;
      }

      // stop iteration when pagesProcessed reaches invocation limit
      return pagesProcessed === batchPages;
    },
    groupIndex,
  );

  const groupMembersFetchCompleted =
    typeof nextLink !== "string" && groupIndex === totalGroups;

  await groupsCache.putState({ groupMembersFetchCompleted });

  return {
    iterationState: {
      ...iterationState,
      finished: groupMembersFetchCompleted,
      state: {
        nextLink,
        limit,
        pages: pagesProcessed,
        count: membersCount,
        groupIndex,
      },
    },
  };
}
