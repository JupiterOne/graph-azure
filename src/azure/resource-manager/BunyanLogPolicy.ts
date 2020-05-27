import {
  BaseRequestPolicy,
  HttpOperationResponse,
  RequestPolicy,
  RequestPolicyFactory,
  RequestPolicyOptions,
  WebResource,
} from "@azure/ms-rest-js";
import { IntegrationLogger } from "@jupiterone/integration-sdk";

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

  public sendRequest(request: WebResource): Promise<HttpOperationResponse> {
    return this._nextPolicy.sendRequest(request.clone()).then((response) => {
      const logData = {
        url: request.url,
        status: response.status,
        responseHeaders: response.headers.rawHeaders(),
        requestHeaders: Object.keys(response.request.headers.rawHeaders()),
      };

      this.logger.info(logData, "Received response from Azure API");

      return response;
    });
  }
}
