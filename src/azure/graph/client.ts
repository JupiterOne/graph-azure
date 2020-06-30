import { IntegrationLogger } from '@jupiterone/integration-sdk-core';
import {
  AuthenticationProvider,
  Client,
} from '@microsoft/microsoft-graph-client';
import { Organization } from '@microsoft/microsoft-graph-types';

import { IntegrationConfig } from '../../types';
import authenticate from './authenticate';

export type QueryParams = string | { [key: string]: string | number };

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

  public async fetchMetadata(): Promise<object> {
    return this.client.api('/').get();
  }

  public async fetchOrganization(): Promise<Organization> {
    const response = await this.client.api('/organization').get();
    return response.value[0];
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
