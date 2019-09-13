import {
  GraphClient,
  IntegrationExecutionContext,
  PersisterClient,
} from "@jupiterone/jupiter-managed-integration-sdk";
import AzureClient from "./azure/AzureClient";

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
