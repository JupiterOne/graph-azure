import fetch from 'cross-fetch';

import {
  IntegrationProviderAPIError,
  IntegrationValidationError,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../../types';
import { isJson } from '../../utils/isJson';

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
      `scope=${encodeURIComponent('https://graph.microsoft.com/.default')}`,
    ].join('&'),
  });

  const responseBody = await response.text();

  if (!isJson(responseBody)) {
    const error = getHTMLErrorFromGraphAuthenticate(responseBody, endpoint);
    throw error;
  }

  const json = JSON.parse(responseBody);

  if (json.error) {
    const error = getJSONErrorFromGraphAuthenticate(
      json as ErrorResponse,
      endpoint,
    );
    throw error;
  } else {
    const tokenResponse = json as TokenResponse;
    return tokenResponse.access_token;
  }
}

function getJSONErrorFromGraphAuthenticate(
  errorResponse: ErrorResponse,
  endpoint: string,
): Error {
  if (
    errorResponse.error === 'invalid_request' ||
    errorResponse.error === 'invalid_client'
  ) {
    throw new IntegrationValidationError(errorResponse.error_description);
  } else {
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
  }
}

function getHTMLErrorFromGraphAuthenticate(
  response: string,
  endpoint: string,
): Error {
  const INVALID_INPUT_ERROR_MSG =
    'AADSTS90013: Invalid input received from the user.';
  if (response.includes(INVALID_INPUT_ERROR_MSG)) {
    throw new IntegrationValidationError(
      INVALID_INPUT_ERROR_MSG + ' The provided directory ID is invalid.',
    );
  } else {
    throw new IntegrationProviderAPIError({
      endpoint,
      status: 'GRAPH_AUTHENTICATION_ERROR',
      statusText:
        'An unknown error occurred while authenticating with the Tenant/Directory ID. Check that the Tenant ID is valid.',
    });
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
