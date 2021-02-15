import {
  IntegrationInstanceConfig,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

export type IntegrationStepContext = IntegrationStepExecutionContext<
  IntegrationConfig
>;

/**
 * Properties provided by the `IntegrationInstance.config`. Values identifying
 * the Service Principal are included.
 *
 * The Service Principal is used for both Microsoft Graph API and Azure
 * Resource Manager API invocations. The user must grant the Principal access
 * to necessary Graph and Azure resources.
 */
export interface IntegrationConfig extends IntegrationInstanceConfig {
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
  subscriptionId?: string | null;

  /**
   * A directive indicating whether or not to ingest Active Directory resources.
   * A value of `undefined` will be interpreted as `false`.
   *
   * The integration may be configured to enable or disable the ingestion of
   * Active Directory resources. This is necessary to prevent a graph from
   * ending up with duplicate AD resources when more than one integration is
   * configured for an AD domain, a scenario that exists when more than one
   * subscription from the AD domain is ingested through different integration
   * instances.
   */
  ingestActiveDirectory?: boolean;
}
