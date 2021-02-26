import { ServiceClientCredentials } from '@azure/ms-rest-js';
import * as msRestNodeAuth from '@azure/ms-rest-nodeauth';

import { IntegrationConfig } from '../../types';
import { AzureManagementClientCredentials } from './types';
import { IntegrationValidationError } from '@jupiterone/integration-sdk-core';

/**
 * Validates the resource manager client, including that the subscription ID passed to the client
 */
export async function validateResourceManagerInvocation(
  config: IntegrationConfig,
): Promise<void> {
  const response = await loginWithServicePrincipalSecretWithAuthResponse(
    config,
  );

  if (
    !response.subscriptions ||
    !response.subscriptions.find((s) => s.id === config.subscriptionId)
  ) {
    throw new IntegrationValidationError(
      'subscriptionId not found in tenant specified by directoryId',
    );
  }
}

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
    credentials: (response.credentials as unknown) as ServiceClientCredentials,
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
  if (!config.subscriptionId) {
    throw new Error(
      'Cannot use Azure Resource Manager APIs without subscriptionId',
    );
  }

  const response = await msRestNodeAuth.loginWithServicePrincipalSecretWithAuthResponse(
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
