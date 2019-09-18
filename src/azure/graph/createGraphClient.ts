import {
  AuthenticationProvider,
  Client,
} from "@microsoft/microsoft-graph-client";

import { AzureIntegrationInstanceConfig } from "../../types";
import authenticate from "./authenticate";

export default async function createGraphClient(
  config: AzureIntegrationInstanceConfig,
): Promise<Client> {
  return Client.initWithMiddleware({
    authProvider: new GraphAuthenticationProvider(config),
  });
}

class GraphAuthenticationProvider implements AuthenticationProvider {
  private accessToken: string | undefined;

  constructor(readonly config: AzureIntegrationInstanceConfig) {}

  /**
   * Obtains an accessToken (in case of success) or rejects with error (in case
   * of failure). Currently does not track token expiration/support token
   * refresh.
   */
  public async getAccessToken(): Promise<any> {
    if (!this.accessToken) {
      this.accessToken = await authenticate(this.config);
    }
    return this.accessToken;
  }
}
