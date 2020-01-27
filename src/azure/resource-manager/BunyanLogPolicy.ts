import { IntegrationLogger } from "@jupiterone/jupiter-managed-integration-sdk";

import {
  BaseRequestPolicy,
  WebResource,
  HttpOperationResponse,
  RequestPolicy,
  RequestPolicyOptions,
  RequestPolicyFactory,
} from "@azure/ms-rest-js";

export function bunyanLogPolicy(
  logger: IntegrationLogger,
): RequestPolicyFactory {
  return {
    create: (
      nextPolicy: RequestPolicy,
      options: RequestPolicyOptions,
    ): BunyanLogPolicy => {
      return new BunyanLogPolicy(nextPolicy, options, logger);
    },
  };
}

/**
 * A Microsoft ServiceClient policy that logs all requests through bunyan.
 */
export class BunyanLogPolicy extends BaseRequestPolicy {
  constructor(
    nextPolicy: RequestPolicy,
    options: RequestPolicyOptions,
    readonly logger: IntegrationLogger,
  ) {
    super(nextPolicy, options);
  }

  /* eslint-disable-next-line @typescript-eslint/require-await */
  public async sendRequest(
    httpRequest: WebResource,
  ): Promise<HttpOperationResponse> {
    return this._nextPolicy.sendRequest(httpRequest.clone()).then(response => {
      const logData = {
        url: httpRequest.url,
        status: response.status,
        responseHeaders: response.headers.rawHeaders(),
      };

      this.logger.info(logData, "Received response from Azure API");

      if (response.status === 429) {
        this.logger.info(logData, "Request throttled");
      }

      return response;
    });
  }
}
