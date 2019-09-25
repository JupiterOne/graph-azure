import {
  GraphClient,
  IntegrationExecutionContext,
  PersisterClient,
} from "@jupiterone/jupiter-managed-integration-sdk";
import { AzureClient, ResourceManagerClient } from "./azure";

/**
 * Properties provided by the `IntegrationInstance.config`. Values identifying
 * the Service Principal are included.
 *
 * The Service Principal is used for both Microsoft Graph API and Azure
 * Resource Manager API invocations. The user must grant the Principal access
 * to necessary Graph and Azure resources.
 */
export interface AzureIntegrationInstanceConfig {
  /**
   * The Service Principal client identifier used to obtain API access tokens.
   */
  clientId: string;

  /**
   * The Service Principal client secret used to obtain API access tokens.
   */
  clientSecret: string;

  /**
   * The domain or tenant ID containing the Service Principal used to obtain API
   * access tokens AND to target for ingesting Microsoft Graph resources.
   *
   * The current expectation is that an App Registration, restricted to the
   * tenant it belongs to, is created in the target tenant, and the target
   * tenant has had an Administrator grant read access to Microsoft Graph
   * resources ingested by the program.
   */
  directoryId: string;

  /**
   * The Azure Subscription from which to fetch Azure resources. Currently not
   * guaranteed to be present in all integration instances.
   *
   * A Subscription Administrator must assign the "Reader" RBAC role (least
   * privilege) to the Service Principal used to obtain API access tokens.
   */
  subscriptionId?: string;
}

export interface AzureExecutionContext extends IntegrationExecutionContext {
  graph: GraphClient;
  persister: PersisterClient;
  azure: AzureClient;
  azrm: ResourceManagerClient;
}

export interface ResourceCacheState {
  resourceFetchCompleted?: boolean;
}

export interface GroupsCacheState extends ResourceCacheState {
  groupMembersFetchCompleted?: boolean;
}

export type UsersCacheState = ResourceCacheState;
