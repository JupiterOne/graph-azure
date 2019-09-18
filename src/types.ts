import {
  GraphClient,
  IntegrationExecutionContext,
  PersisterClient,
} from "@jupiterone/jupiter-managed-integration-sdk";
import { AzureClient } from "./azure";

/**
 * Properties provided by the `IntegrationInstance.config`. Values identifying
 * the Service Principal are included.
 */
export interface AzureIntegrationInstanceConfig {
  clientId: string;
  clientSecret: string;
  directoryId: string;
}

export interface AzureExecutionContext extends IntegrationExecutionContext {
  graph: GraphClient;
  persister: PersisterClient;
  azure: AzureClient;
}

export interface ResourceCacheState {
  resourceFetchCompleted?: boolean;
}

export interface GroupsCacheState extends ResourceCacheState {
  groupMembersFetchCompleted?: boolean;
}

export type UsersCacheState = ResourceCacheState;
