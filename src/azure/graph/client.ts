import {
  IntegrationLogger,
  IntegrationProviderAPIError,
} from '@jupiterone/integration-sdk-core';
import { FetchError } from 'node-fetch';
import {
  AuthenticationProvider,
  Client,
  GraphRequest,
} from '@microsoft/microsoft-graph-client';
import { Organization } from '@microsoft/microsoft-graph-types';

import { IntegrationConfig } from '../../types';
import authenticate from './authenticate';
import { retry } from '@lifeomic/attempt';

interface AzureGraphResponse<TResponseType = any> {
  value: TResponseType[];
  ['@odata.nextLink']?: string;
}

/**
 * Pagination: https://docs.microsoft.com/en-us/graph/paging
 * Throttling with retry after: https://docs.microsoft.com/en-us/graph/throttling
 * Batching requests: https://docs.microsoft.com/en-us/graph/json-batching
 */
export abstract class GraphClient {
  protected client: Client;

  constructor(
    readonly logger: IntegrationLogger,
    readonly config: IntegrationConfig,
  ) {
    this.client = Client.initWithMiddleware({
      authProvider: new GraphAuthenticationProvider(config),
    });
  }

  public async fetchMetadata(): Promise<AzureGraphResponse | undefined> {
    return this.request(this.client.api('/'));
  }

  public async fetchOrganization(): Promise<Organization> {
    const response = await this.request<Organization>(
      this.client.api('/organization'),
    );
    return response!.value[0];
  }

  async retryRequest<TResponseType = any>(
    graphRequest: GraphRequest,
  ): Promise<AzureGraphResponse<TResponseType>> {
    return retry(
      async () => {
        return graphRequest.get();
      },
      {
        maxAttempts: 3,
        delay: 200,
        handleError: (err, context, options) => {
          const endpoint = (graphRequest as any).buildFullUrl?.();
          this.logger.info(
            {
              err,
              endpoint,
              attemptsRemaining: context.attemptsRemaining,
            },
            'Encountered retryable error in Azure Graph API.',
          );
        },
      },
    );
  }

  public async request<TResponseType = any>(
    graphRequest: GraphRequest,
  ): Promise<AzureGraphResponse<TResponseType> | undefined> {
    try {
      const response = await this.retryRequest(graphRequest);
      return response;
    } catch (err) {
      const endpoint = (graphRequest as any).buildFullUrl?.();

      // Fetch errors include the properties code, errno, message, name, stack, type.
      if (err instanceof FetchError) {
        this.logger.error(
          { err, resourceUrl: endpoint },
          'Encountered fetch error in Azure Graph client.',
        );
        throw new IntegrationProviderAPIError({
          cause: err,
          endpoint,
          status: err.code!,
          statusText: err.message,
        });
      }

      if (err.statusCode !== 404) {
        this.logger.error(
          { err, resourceUrl: endpoint },
          'Encountered error in Azure Graph client.',
        );
        throw new IntegrationProviderAPIError({
          cause: err,
          endpoint,
          status: err.statusCode,
          statusText: err.statusText,
        });
      }

      this.logger.warn(
        { err, resourceUrl: endpoint },
        'Encountered non-fatal error in Azure Graph client.',
      );
    }
  }
}

class GraphAuthenticationProvider implements AuthenticationProvider {
  private accessToken: string | undefined;

  constructor(readonly config: IntegrationConfig) {}

  /**
   * Obtains an accessToken (in case of success) or rejects with error (in case
   * of failure). Currently does not track token expiration/support token
   * refresh.
   */
  public async getAccessToken(): Promise<string> {
    if (!this.accessToken) {
      this.accessToken = await authenticate(this.config);
    }
    return this.accessToken;
  }
}
