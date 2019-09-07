import {
  IntegrationCacheEntry,
  IntegrationStepExecutionResult,
  IntegrationStepIterationState,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { AzureExecutionContext, ResourceCacheState } from "../types";
import AzureClient, {
  FetchResourcesResponse,
  PaginationOptions,
} from "./AzureClient";
import { getBatchPages, getPageLimit } from "./batch";

/**
 * An iterating execution handler that loads resources and associated data in
 * batches of pages of resources, storing the raw response data in the
 * `IntegrationCache` for later processing in another step.
 */
export default async function fetchBatchOfResources<
  T extends microsoftgraph.Entity
>(
  executionContext: AzureExecutionContext,
  iterationState: IntegrationStepIterationState,
  resourceName: string,
  fetch: (
    azure: AzureClient,
    paginationOptions: PaginationOptions,
  ) => Promise<FetchResourcesResponse<T> | undefined>,
): Promise<IntegrationStepExecutionResult> {
  const { azure } = executionContext;
  const cache = executionContext.clients.getCache();
  const resourceCache = cache.iterableCache<
    IntegrationCacheEntry,
    ResourceCacheState
  >(resourceName);

  const batchPages = getBatchPages(resourceName, 2);
  const limit = getPageLimit(resourceName, 200);

  let pagesProcessed = 0;
  let entryCount: number = iterationState.state.count || 0;
  let nextLink: string | undefined = iterationState.state.nextLink;

  do {
    const response = await fetch(azure, {
      nextLink,
      limit,
    });

    if (response) {
      entryCount = await resourceCache.putEntries(
        response.resources.map(e => ({
          key: e.id!,
          data: e,
        })),
      );
      nextLink = response.nextLink;
    }

    pagesProcessed++;
  } while (pagesProcessed < batchPages && nextLink);

  const finished = typeof nextLink !== "string";
  await resourceCache.putState({ resourceFetchCompleted: finished });

  return {
    iterationState: {
      ...iterationState,
      finished,
      state: {
        nextLink,
        limit,
        pages: pagesProcessed,
        count: entryCount,
      },
    },
  };
}
