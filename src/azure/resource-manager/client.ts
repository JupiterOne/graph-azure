import { ClientSecretCredential } from "@azure/identity";
import {
  exponentialRetryPolicy,
  HttpResponse,
  RequestPolicyFactory,
  systemErrorRetryPolicy,
  throttlingRetryPolicy,
} from "@azure/ms-rest-js";
import { retry } from "@lifeomic/attempt";

import { IntegrationConfig } from "../../types";
import authenticate from "./authenticate";
import { bunyanLogPolicy } from "./BunyanLogPolicy";
import { AzureManagementClientCredentials } from "./types";
import {
  IntegrationLogger,
  IntegrationProviderAPIError,
} from "@jupiterone/integration-sdk";

/**
 * An Azure resource manager endpoint that has `listAll` and `listAllNext` functions.
 */
export interface ListAllResourcesEndpoint {
  listAll: <ListResponseType>() => Promise<ListResponseType>;
  listAllNext: <ListResponseType>(
    nextLink: string,
  ) => Promise<ListResponseType>;
}

/**
 * An Azure resource manager endpoint that has `list` and `listNext` functions.
 */
export interface ListResourcesEndpoint {
  list<ListResponseType>(): Promise<ListResponseType>;
  listNext?<ListResponseType>(nextLink: string): Promise<ListResponseType>;
}

export interface ResourceListResponse<T> extends Array<T> {
  readonly _response: HttpResponse;
  readonly nextLink?: string;
}

export abstract class Client {
  private auth: AzureManagementClientCredentials;

  constructor(
    private config: IntegrationConfig,
    readonly logger: IntegrationLogger,
    readonly noRetryPolicy = false,
  ) {}

  /**
   * Provides `ClientSecretCredentials` for data access clients. Resource
   * Manager clients are authenticated using `ServiceClientCredentials`.
   *
   * @see authenticate
   */
  getClientSecretCredentials(): ClientSecretCredential {
    // TODO cache this?
    return new ClientSecretCredential(
      this.config.directoryId,
      this.config.clientId,
      this.config.clientSecret,
    );
  }

  /**
   * Authenticates with Azure identity service to obtain an API token and caches
   * it, then instantiate the specific service client with the credentials. This
   * allows for re-using the credentials no many how many instances/types of
   * service clients are created.
   *
   * @param ctor an AzureServiceClient constructor function
   */
  async getAuthenticatedServiceClient<T>(ctor: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (...args: any[]): T;
  }): Promise<T> {
    if (!this.auth) {
      this.auth = await authenticate(this.config);
    }
    const client = createClient(ctor, {
      auth: this.auth,
      logger: this.logger,
      noRetryPolicy: this.noRetryPolicy,
    });
    return client;
  }
}

/**
 * Retries a resource request that throws an error on a 429 response.
 *
 * Note that the documentation at
 * https://docs.microsoft.com/en-us/azure/virtual-machines/troubleshooting/troubleshooting-throttling-errors
 * states plainly:
 *
 * > In high-volume API automation cases, consider implementing proactive
 * > client-side self-throttling when the available call count for a target
 * > operation group drops below some low threshold.
 *
 * That would be nice for them to handle in the client, and it would be great to
 * see the endpoints always return the resource provider counts remaining, and
 * they'd get bonus points for having useful `retry-after` header values.
 *
 * Some resource provider endpoints have returned a 429 response with a
 * `retry-after` that is useless, and another try gets another 429, which the
 * `ThrottlingRetryPolicy` will not handle. That is, given 100 req/5 minutes, a
 * burst of 100 requests will burn the allowed requests, a 429 is returned with
 * `retry-after: 17`, but in fact the API will not answer again until up to 5
 * minutes has passed!
 *
 * The approach here is designed to:
 *
 * 1. Allow a burst of requests up to the maximum per period supported by the
 *    resource provider vs. always spreading out requests, which makes scenarios
 *    where the endpoint is only called 10 times really slow.
 * 2. Wait the period out after two subsequent 429 responses, because once we've
 *    seen a 429, it means we've burned up our limit for the period.
 * 3. Allow resource providers that return a useful `retry-after` to continue to
 *    work, because the `ThrottlingRetryPolicy` is still in place.
 * 4. Allow specific resource provider endpoint period wait times.
 * 5. Allow other error responses to continue to throw an error (this will not
 *    attempt to retry those).
 *
 * @param requestFunc code making a request to Azure RM
 * @param endpointRatePeriod the resource provider's rate limiting period; the
 * time in a reqs/time ratio
 */
/* istanbul ignore next: testing iteration might be difficult */
function retryResourceRequest<ResponseType>(
  requestFunc: () => Promise<ResponseType>,
  endpointRatePeriod: number,
): Promise<ResponseType> {
  return retry(
    async (_context) => {
      return requestFunc();
    },
    {
      // Things aren't working as expected if we're asked to retry more than
      // once. The request policy of the `ServiceClient` will handle all other
      // retry scenarios.
      maxAttempts: 2,

      // No delay on the first attempt, wait for next period on subsequent
      // attempts. Assumes non-429 responses will not lead to subsequent
      // attempts (`handleError` will abort for other error responses).
      calculateDelay: (context, _options) => {
        return context.attemptNum === 0 ? 0 : endpointRatePeriod;
      },

      // Most errors will be handled by the request policies. They will raise
      // a `RestError.statusCode: 429` when they see two 429 responses in a row,
      // which is the scenario we're aiming to address with our retry.
      handleError: (err, context, _options) => {
        if (err.statusCode !== 429) {
          context.abort();
        }
      },
    },
  );
}

export function createClient<T>(
  ctor: { new (...args: unknown[]): T },
  options: {
    auth: AzureManagementClientCredentials;
    logger: IntegrationLogger;
    noRetryPolicy?: boolean;
  },
): T {
  // Builds a custom policy chain to address
  // https://github.com/Azure/azure-sdk-for-js/issues/7989
  // See also: https://docs.microsoft.com/en-us/azure/virtual-machines/troubleshooting/troubleshooting-throttling-errors
  return new ctor(options.auth.credentials, options.auth.subscriptionId, {
    noRetryPolicy: true, // < -- This removes retry policies so they can be added after the Deserialization
    requestPolicyFactories: (
      defaultRequestPolicyFactories: RequestPolicyFactory[],
    ): RequestPolicyFactory[] => {
      const policyChain = defaultRequestPolicyFactories;

      // Tests may turn off retry altogether
      if (!options.noRetryPolicy) {
        policyChain.push(
          ...[
            exponentialRetryPolicy(), // < -- This will not retry a 429 response
            systemErrorRetryPolicy(),
            throttlingRetryPolicy(), // < -- This thing will only retry once
          ],
        );
      }

      policyChain.push(bunyanLogPolicy(options.logger));

      return policyChain;
    },
  });
}

/**
 * Iterate all resources of the provided `resourceEndpoint`.
 *
 * Sometimes listing fails with a `404` response. In this case, the `callback`
 * will not be invoked, as if there are no contained resources.
 *
 * @param resourceEndpoint a module that supports list()/listNext() or
 * listAll()/listAllNext()
 * @param callback a function to receive each resource throughout pagination
 * @param endpointRatePeriod number of milliseconds over which rate limit
 * applies
 */
export async function iterateAllResources<ServiceClientType, ResourceType>({
  serviceClient,
  resourceEndpoint,
  resourceDescription,
  callback,
  logger,
  endpointRatePeriod = 5 * 60 * 1000,
}: {
  serviceClient: ServiceClientType;
  resourceEndpoint: ListAllResourcesEndpoint | ListResourcesEndpoint;
  resourceDescription: string;
  callback: (
    resource: ResourceType,
    serviceClient: ServiceClientType,
  ) => void | Promise<void>;
  logger: IntegrationLogger;
  endpointRatePeriod?: number;
}): Promise<void> {
  let nextLink: string | undefined;
  try {
    do {
      const response = await retryResourceRequest(async () => {
        if ("listAllNext" in resourceEndpoint) {
          return nextLink
            ? /* istanbul ignore next: testing iteration might be difficult */
              await resourceEndpoint.listAllNext<
                ResourceListResponse<ResourceType>
              >(nextLink)
            : await resourceEndpoint.listAll<
                ResourceListResponse<ResourceType>
              >();
        } else {
          return resourceEndpoint.listNext && nextLink
            ? /* istanbul ignore next: testing iteration might be difficult */
              await resourceEndpoint.listNext<
                ResourceListResponse<ResourceType>
              >(nextLink)
            : await resourceEndpoint.list<ResourceListResponse<ResourceType>>();
        }
      }, endpointRatePeriod);

      logger.info(
        {
          resourceCount: response.length,
          resource: response._response.request.url,
        },
        "Received resources for endpoint",
      );

      for (const e of response) {
        await callback(e, serviceClient);
      }

      nextLink = response.nextLink;
    } while (nextLink);
  } catch (err) {
    /* istanbul ignore else */
    if (err.statusCode === 404) {
      logger.warn({ err }, "Resources not found");
    } else {
      throw new IntegrationProviderAPIError({
        cause: err,
        endpoint: resourceDescription,
        status: err.statusCode,
        statusText: err.statusText,
      });
    }
  }
}
