import { IntegrationLogger } from "@jupiterone/jupiter-managed-integration-sdk";
import fetch, { RequestInit } from "node-fetch";
import AzureClientError from "./AzureClientError";
import { Group, GroupMember, User } from "./types";

export enum Method {
  GET = "get",
  POST = "post",
}

interface TokenResponse {
  token_type: string;
  expires_in: number;
  ext_expires_in: number;
  access_token: string;
}

export default class AzureClient {
  private clientId: string;
  private clientSecret: string;
  private directoryId: string;
  private accessToken: string;
  private host: string = "https://graph.microsoft.com/v1.0";
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
    const body = [
      `client_id=${encodeURIComponent(this.clientId)}`,
      "grant_type=client_credentials",
      `client_secret=${encodeURIComponent(this.clientSecret)}`,
      "scope=https%3A%2F%2Fgraph.microsoft.com%2F.default",
    ].join("&");

    const options: RequestInit = {
      method: Method.POST,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    };

    const loginUrl = `https://login.microsoftonline.com/${
      this.directoryId
    }/oauth2/v2.0/token`;
    const response = await fetch(loginUrl, options);
    const json = (await response.json()) as TokenResponse;

    if (!json.access_token) {
      throw new Error("Inavalid credentials");
    }

    this.accessToken = json.access_token;
  }

  public async fetchUsers(): Promise<User[] | undefined> {
    try {
      const select = `$select=displayName,givenName,jobTitle,mail,mobilePhone,officeLocation,preferredLanguage,surname,userPrincipalName,id,userPrincipalName,jobTitle,displayName,mailNickname,userType,employeeId`;

      const { value } = await this.makeRequest(
        `${this.host}/users?${select}`,
        Method.GET,
      );

      return value;
    } catch (error) {
      if (error instanceof AzureClientError && error.status === 404) {
        return [];
      }
      this.logger.warn({ err: error }, "azure.fetchUsers failed");
      return undefined;
    }
  }

  public async fetchUserManager(user: User): Promise<User | undefined> {
    try {
      const response = (await this.makeRequest(
        `${this.host}/users/${user.id}/manager`,
        Method.GET,
      )) as User;

      return response;
    } catch (error) {
      this.logger.warn({ err: error }, "azure.fetchUserManager failed");
      return undefined;
    }
  }

  public async fetchGroups(): Promise<Group[] | undefined> {
    try {
      const { value } = await this.makeRequest(
        `${this.host}/groups/`,
        Method.GET,
      );

      return value;
    } catch (error) {
      if (error instanceof AzureClientError && error.status === 404) {
        return [];
      }

      this.logger.warn({ err: error }, "azure.fetchGroups failed");
      return undefined;
    }
  }

  public async fetchMembers(
    groupId: string,
  ): Promise<GroupMember[] | undefined> {
    try {
      const { value } = await this.makeRequest(
        `${this.host}/groups/${groupId}/members`,
        Method.GET,
      );

      return value;
    } catch (error) {
      if (error instanceof AzureClientError && error.status === 404) {
        return [];
      }
      this.logger.warn({ err: error }, "azure.fetchMembers failed");
      return undefined;
    }
  }

  private async makeRequest<T>(
    url: string,
    method: Method,
    headers?: {},
  ): Promise<T> {
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
}
