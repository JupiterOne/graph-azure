import { ServiceClientCredentials } from '@azure/ms-rest-js';
import * as msRestNodeAuth from '@azure/ms-rest-nodeauth';

import { IntegrationConfig } from '../../types';
import { AzureManagementClientCredentials } from './types';

/**
 * Obtains API credentials for Azure Resource Manager API. This depends on the
 * Service Principal being granted membership in a AD Role that allows for
 * reading Azure Resources within a Subscription.
 */
export async function authenticate(
  config: IntegrationConfig,
): Promise<AzureManagementClientCredentials> {
  const response = await loginWithServicePrincipalSecretWithAuthResponse(
    config,
  );

  return {
    credentials: response.credentials as unknown as ServiceClientCredentials,
    subscriptionId: config.subscriptionId!,
  };
}

/**
 * Obtains API credentials for Azure Resource Manager API. This depends on the
 * Service Principal being granted membership in a AD Role that allows for
 * reading Azure Resources within a Subscription.
 */
export async function loginWithServicePrincipalSecretWithAuthResponse(
  config: IntegrationConfig,
): Promise<msRestNodeAuth.AuthResponse> {
  const response =
    await msRestNodeAuth.loginWithServicePrincipalSecretWithAuthResponse(
      config.clientId,
      config.clientSecret,
      config.directoryId,
      {
        tokenAudience: 'https://management.azure.com/',
      },
    );

  return response;
}

export default authenticate;
