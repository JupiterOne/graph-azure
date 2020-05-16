import { IntegrationLogger } from "@jupiterone/jupiter-managed-integration-sdk";
import {
  AuthenticationProvider,
  Client,
} from "@microsoft/microsoft-graph-client";
import {
  DirectoryObject,
  DirectoryRole,
  Group,
  Organization,
  User,
} from "@microsoft/microsoft-graph-types";

import { IntegrationConfig } from "../../types";
import { GroupMember } from "../types";
import authenticate from "./authenticate";

export function createGraphClient(
  logger: IntegrationLogger,
  config: IntegrationConfig,
): GraphClient {
  return new GraphClient(
    logger,
    Client.initWithMiddleware({
      authProvider: new GraphAuthenticationProvider(config),
    }),
  );
}

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
export class GraphClient {
  constructor(readonly logger: IntegrationLogger, readonly client: Client) {}

  public async fetchMetadata(): Promise<object> {
    return this.client.api("/").get();
  }

  public async fetchOrganization(): Promise<Organization> {
    const response = await this.client.api("/organization").get();
    return response.value[0];
  }

  // https://docs.microsoft.com/en-us/graph/api/directoryrole-list?view=graph-rest-1.0&tabs=http
  public async iterateDirectoryRoles(
    callback: (role: DirectoryRole) => void | Promise<void>,
  ): Promise<void> {
    return this.iterateResources({ resourceUrl: "/directoryRoles", callback });
  }

  // https://docs.microsoft.com/en-us/graph/api/directoryrole-list-members?view=graph-rest-1.0&tabs=http
  public async iterateDirectoryRoleMembers(
    roleId: string,
    callback: (member: DirectoryObject) => void | Promise<void>,
  ): Promise<void> {
    return this.iterateResources({
      resourceUrl: `/directoryRoles/${roleId}/members`,
      callback,
    });
  }

  // https://docs.microsoft.com/en-us/graph/api/group-list?view=graph-rest-1.0&tabs=http
  public async iterateGroups(
    callback: (user: Group) => void | Promise<void>,
  ): Promise<void> {
    return this.iterateResources({ resourceUrl: "/groups", callback });
  }

  // https://docs.microsoft.com/en-us/graph/api/group-list-members?view=graph-rest-1.0&tabs=http
  public async iterateGroupMembers(
    input: {
      groupId: string;
      /**
       * The property names for `$select` query param.
       */
      select?: string | string[];
    },
    callback: (user: GroupMember) => void | Promise<void>,
  ): Promise<void> {
    const $select = input.select
      ? Array.isArray(input.select)
        ? input.select.join(",")
        : input.select
      : undefined;

    return this.iterateResources({
      resourceUrl: `/groups/${input.groupId}/members`,
      query: $select ? { $select } : undefined,
      callback,
    });
  }

  // https://docs.microsoft.com/en-us/graph/api/user-list?view=graph-rest-1.0&tabs=http
  public async iterateUsers(
    callback: (user: User) => void | Promise<void>,
  ): Promise<void> {
    return this.iterateResources({ resourceUrl: "/users", callback });
  }

  // Not using PageIterator because it doesn't allow async callback
  private async iterateResources<T>({
    resourceUrl,
    query,
    callback,
  }: {
    resourceUrl: string;
    query?: QueryParams;
    callback: (item: T) => void | Promise<void>;
  }): Promise<void> {
    try {
      let nextLink: string | undefined;
      do {
        let api = this.client.api(nextLink || resourceUrl);
        if (query) {
          api = api.query(query);
        }

        const response = await api.get();
        if (response) {
          nextLink = response["@odata.nextLink"];
          for (const value of response.value) {
            await callback(value);
          }
        } else {
          nextLink = undefined;
        }
      } while (nextLink);
    } catch (err) {
      if (err.statusCode === 403) {
        this.logger.warn({ err, resourceUrl }, "Forbidden");
      } else if (err.statusCode !== 404) {
        throw err;
      }
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
