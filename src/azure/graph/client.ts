import { IntegrationLogger } from "@jupiterone/integration-sdk";
import {
  AuthenticationProvider,
  Client,
} from "@microsoft/microsoft-graph-client";
import { Organization } from "@microsoft/microsoft-graph-types";

import { IntegrationConfig } from "../../types";
import authenticate from "./authenticate";

export interface FetchResourcesResponse<T extends microsoftgraph.Entity> {
  nextLink: string | undefined;
  resources: T[];
  err?: ClientError;
}

export interface PaginationOptions {
  limit?: number;
  nextLink?: string;

  /**
   * The property names for `$select` query param.
   */
  select?: string | string[];
}

export type QueryParams = string | { [key: string]: string | number };

export class ClientError extends Error {
  private static generateMessage(response: Response): string {
    const intro = "Unexpected response from Azure API:";
    const errorText = `'${response.status} - ${response.statusText}`;

    return [intro, errorText].join(" ");
  }

  public status: number;
  public statusText: string;

  constructor(response: Response) {
    super(ClientError.generateMessage(response));
    this.status = response.status;
    this.statusText = response.statusText;
  }
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

  public async fetchMetadata(): Promise<object> {
    return this.client.api("/").get();
  }

  public async fetchOrganization(): Promise<Organization> {
    const response = await this.client.api("/organization").get();
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
