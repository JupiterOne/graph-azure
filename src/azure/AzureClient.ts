// tslint:disable:no-var-requires
import fetch, { RequestInit } from "node-fetch";
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

  constructor(clientId: string, clientSecret: string, directoryId: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.directoryId = directoryId;
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

  public async fetchUsers(): Promise<User[]> {
    const { value } = await this.makeRequest(`${this.host}/users/`, Method.GET);

    return value;
  }

  public async fetchGroups(): Promise<Group[]> {
    const { value } = await this.makeRequest(
      `${this.host}/groups/`,
      Method.GET,
    );

    return value;
  }

  public async fetchMembers(groupId: string): Promise<GroupMember[]> {
    const { value } = await this.makeRequest(
      `${this.host}/groups/${groupId}/members`,
      Method.GET,
    );

    return value;
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

    return response.json();
  }
}
