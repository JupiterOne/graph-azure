import {
  IntegrationCacheEntry,
  IntegrationStepIterationState,
} from "@jupiterone/jupiter-managed-integration-sdk";
import { Group } from "@microsoft/microsoft-graph-types";

import { AzureExecutionContext, GroupsCacheState } from "../types";
import { getBatchPages, getPageLimit } from "./batch";
import { GroupMember } from "./types";
import AzureClientError from "./AzureClientError";

export default async function fetchBatchOfGroupMembers(
  executionContext: AzureExecutionContext,
  iterationState: IntegrationStepIterationState,
): Promise<IntegrationStepIterationState> {
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
  let fetchError: AzureClientError | undefined;

  await groupsCache.forEach(
    async (e) => {
      const groupEntry = e.entry;
      const groupEntryIndex = e.entryIndex;
      const group = groupEntry.data as Group;

      totalGroups = e.totalEntries;

      // load up accumulated list of members
      const groupMembers: GroupMember[] =
        (group.members as GroupMember[]) || [];

      // fetch members for group
      do {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const response = await azure.fetchGroupMembers(group.id!, {
          nextLink,
          limit,
          // Changes here should be reflected in `GroupMember`
          select: ["id", "displayName", "jobTitle", "mail"],
        });

        if (!response.err) {
          groupMembers.push(...response.resources);
          membersCount += response.resources.length;
          nextLink = response.nextLink;
        } else {
          fetchError = response.err;
        }

        pagesProcessed++;
      } while (!fetchError && pagesProcessed < batchPages && nextLink);

      if (fetchError) {
        // Stop iterating groups altogether until we learn more about the errors.
        // Are there some groups we don't have access to, so that we should skip
        // them, or is this a temporary problem that should be ignored (do not
        // produce any operations to avoid unintended data deletion)?
        return true;
      } else {
        // update the cached group to include members loaded during this invocation
        await groupsCache.putEntries([
          {
            key: groupEntry.key,
            data: { ...groupEntry.data, members: groupMembers },
          },
        ]);

        // move to the next group if there are no more members in this group
        if (!nextLink) {
          groupIndex = groupEntryIndex + 1;
        }

        // stop iteration when pagesProcessed reaches invocation limit
        return pagesProcessed === batchPages;
      }
    },
    { skip: groupIndex },
  );

  const groupMembersFetchCompleted =
    typeof nextLink !== "string" && groupIndex === totalGroups;

  await groupsCache.putState({
    groupMembersFetchCompleted: !fetchError && groupMembersFetchCompleted,
    fetchError: fetchError,
  });

  return {
    ...iterationState,
    finished: !!fetchError || groupMembersFetchCompleted,
    state: {
      nextLink,
      limit,
      pages: pagesProcessed,
      count: membersCount,
      groupIndex,
    },
  };
}
