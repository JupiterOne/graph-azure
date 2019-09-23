import fetch from "cross-fetch";

import { IntegrationError } from "@jupiterone/jupiter-managed-integration-sdk";

import { AzureIntegrationInstanceConfig } from "../../types";

/**
 * Obtain API credentials for Microsoft Graph API.
 */
export default async function authenticate(
  config: AzureIntegrationInstanceConfig,
): Promise<string> {
  const response = await fetch(
    `https://login.microsoftonline.com/${config.directoryId}/oauth2/v2.0/token`,
    {
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: [
        `client_id=${encodeURIComponent(config.clientId)}`,
        "grant_type=client_credentials",
        `client_secret=${encodeURIComponent(config.clientSecret)}`,
        "scope=https%3A%2F%2Fgraph.microsoft.com%2F.default",
      ].join("&"),
    },
  );

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

    throw new IntegrationError("Graph API authentication failed", error);
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
