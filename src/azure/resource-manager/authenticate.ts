import { ServiceClientCredentials } from "@azure/ms-rest-js";
import * as msRestNodeAuth from "@azure/ms-rest-nodeauth";

import { AzureIntegrationInstanceConfig } from "../../types";
import { AzureManagementClientCredentials } from "./types";

/**
 * Obtains API credentials for Azure Resource Manager API. This depends on the
 * Service Principal being granted membership in a AD Role that allows for
 * reading Azure Resources within a Subscription.
 *
 * TODO Handle no assigned subscription and/or require subscription in instance
 * config
 */
export default async function authenticate(
  config: AzureIntegrationInstanceConfig,
): Promise<AzureManagementClientCredentials> {
  const response = await msRestNodeAuth.loginWithServicePrincipalSecretWithAuthResponse(
    config.clientId,
    config.clientSecret,
    config.directoryId,
    {
      tokenAudience: "https://management.azure.com/",
    },
  );

  return {
    credentials: (response.credentials as unknown) as ServiceClientCredentials,
    subscriptionId: response.subscriptions![0].id,
  };
}
