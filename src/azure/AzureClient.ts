import querystring from "querystring";

import { IntegrationLogger } from "@jupiterone/jupiter-managed-integration-sdk";

import AzureClientError from "./AzureClientError";
import authenticate from "./graph/authenticate";
import { Group, GroupMember, User } from "./types";

export enum Method {
  GET = "get",
  POST = "post",
}

export interface PaginationOptions {
  limit?: number;
  nextLink?: string;

  /**
   * The property names for `$select` query param.
   */
  select?: string | string[];
}

interface ResourceUrlOptions extends PaginationOptions {
  path: string;
}

interface FetchResourcesInput {
  url: string;
}

export interface FetchResourcesResponse<T extends microsoftgraph.Entity> {
  nextLink: string | undefined;
  resources: T[];
  err?: AzureClientError;
}

export default class AzureClient {
  private clientId: string;
  private clientSecret: string;
  private directoryId: string;
  private accessToken: string;
  private apiHost = "https://graph.microsoft.com";
  private apiVersion = "v1.0";
  private logger: IntegrationLogger;

  constructor(
    clientId: string,
    clientSecret: string,
    directoryId: string,
    logger: IntegrationLogger,
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.directoryId = directoryId;
    this.logger = logger;
  }

  public async authenticate() {
    this.accessToken = await authenticate({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      directoryId: this.directoryId,
    });
  }

  public async fetchUsers(
    options?: PaginationOptions,
  ): Promise<FetchResourcesResponse<User>> {
    return this.fetchResources({
      url: this.resourceUrl({ path: "/users", ...options }),
    });
  }

  public async fetchGroups(
    options?: PaginationOptions,
  ): Promise<FetchResourcesResponse<Group>> {
    return this.fetchResources({
      url: this.resourceUrl({ path: "/groups", ...options }),
    });
  }

  public async fetchGroupMembers(
    groupId: string,
    options?: PaginationOptions,
  ): Promise<FetchResourcesResponse<GroupMember>> {
    return this.fetchResources({
      url: this.resourceUrl({
        path: `/groups/${groupId}/members`,
        ...options,
      }),
    });
  }

  private async fetchResources<T>(
    input: FetchResourcesInput,
  ): Promise<FetchResourcesResponse<T>> {
    try {
      this.logger.trace({ url: input.url }, "Fetching Azure resources");

      const response = await this.makeRequest<any>(input.url, Method.GET);

      return {
        nextLink: response["@odata.nextLink"],
        resources: response.value,
      };
    } catch (err) {
      if (err.status === 404) {
        return { nextLink: undefined, resources: [] };
      } else {
        this.logger.warn(
          { err, url: input.url, method: Method.GET },
          "Azure resource request failed",
        );

        return { nextLink: undefined, resources: [], err };
      }
    }
  }

  /**
   * Pagination: https://docs.microsoft.com/en-us/graph/paging
   * Throttling with retry after: https://docs.microsoft.com/en-us/graph/throttling
   * Batching requests: https://docs.microsoft.com/en-us/graph/json-batching
   */
  private async makeRequest<T>(
    url: string,
    method: Method,
    headers?: {},
  ): Promise<T> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${this.accessToken}`,
        ...headers,
      },
    };

    const response = await fetch(url, options);
    if (response.status >= 300) {
      throw new AzureClientError(response);
    }

    return response.json();
  }

  /**
   * Constructs a resource url to include optional query params.
   *
   * `fetch` will itself perform url escaping, so this function must not do so
   * itself. For example, the `url` library has a nice API for constructing
   * parameters, but the `url.toString()` function answers excaped strings,
   * which `fetch` then attempts to escape, making the params invalid.
   */
  private resourceUrl(options: ResourceUrlOptions): string {
    if (options.nextLink) {
      return options.nextLink;
    } else {
      const queryParams: { [key: string]: any } = {};

      if (options.limit) {
        queryParams.$top = options.limit;
      }

      if (options.select) {
        queryParams.$select = Array.isArray(options.select)
          ? options.select.join(",")
          : options.select;
      }

      let url = `${this.apiHost}/${this.apiVersion}${options.path}`;
      if (Object.keys(queryParams).length > 0) {
        url +=
          "?" +
          querystring.stringify(queryParams, undefined, undefined, {
            encodeURIComponent: (s: string) => s,
          });
      }

      return url;
    }
  }
}
