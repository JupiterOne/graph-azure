import fetch from 'cross-fetch';

import { IntegrationProviderAPIError } from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../../types';

/**
 * Obtain API credentials for Microsoft Graph API.
 *
 * TODO Can this be replaced by `import { ClientSecretCredential } from
 * "@azure/identity";`? YES! See Microsoft 365 integration.
 */
export default async function authenticate(
  config: IntegrationConfig,
): Promise<string> {
  const endpoint = `https://login.microsoftonline.com/${config.directoryId}/oauth2/v2.0/token`;
  const response = await fetch(endpoint, {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: [
      `client_id=${encodeURIComponent(config.clientId)}`,
      'grant_type=client_credentials',
      `client_secret=${encodeURIComponent(config.clientSecret)}`,
      'scope=https%3A%2F%2Fgraph.microsoft.com%2F.default',
    ].join('&'),
  });

  const json = await response.json();

  if (json.error) {
    const errorResponse = json as ErrorResponse;
    const error = new Error(errorResponse.error_description);
    Object.assign(error, {
      name: errorResponse.error,
      code: JSON.stringify(errorResponse.error_codes, null, 0),
      timestamp: errorResponse.timestamp,
      traceId: errorResponse.trace_id,
      correlationId: errorResponse.correlation_id,
      errorUri: errorResponse.error_uri,
    });

    throw new IntegrationProviderAPIError({
      cause: error,
      endpoint,
      status: errorResponse.error,
      statusText: errorResponse.error_description,
    });
  } else {
    const tokenResponse = json as TokenResponse;
    return tokenResponse.access_token;
  }
}

interface TokenResponse {
  token_type: string;
  expires_in: number;
  ext_expires_in: number;
  access_token: string;
}

interface ErrorResponse {
  error: string;
  error_description: string;
  error_codes: string[];
  timestamp: string;
  trace_id: string;
  correlation_id: string;
  error_uri: string;
}
