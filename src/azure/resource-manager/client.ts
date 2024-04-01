import { ClientSecretCredential } from '@azure/identity';
import {
  exponentialRetryPolicy,
  HttpResponse,
  RequestPolicyFactory,
  systemErrorRetryPolicy,
  throttlingRetryPolicy,
  RestError as AzureRestError,
} from '@azure/ms-rest-js';
import {
  IntegrationLogger,
  IntegrationProviderAPIError,
  IntegrationWarnEventName,
} from '@jupiterone/integration-sdk-core';
import { retry } from '@lifeomic/attempt';
import { FetchError } from 'node-fetch';

import { IntegrationConfig } from '../../types';
import authenticate from './authenticate';
import { bunyanLogPolicy } from './BunyanLogPolicy';
import { AzureManagementClientCredentials } from './types';
export const FIVE_MINUTES = 5 * 60 * 1000;
export const DEFAULT_MAX_RETRIES = 5;
/**
 * An Azure resource manager endpoint that has `listAll` and `listAllNext` functions.
 */
export interface ListAllResourcesEndpoint {
  listAll: () => Promise<ResourceListResponse<any>>;
  listAllNext: (nextLink: string) => Promise<ResourceListResponse<any>>;
}

/**
 * An Azure resource manager endpoint that has `list` and `listNext` functions.
 */
export interface ListResourcesEndpoint {
  list(...args: any): Promise<ResourceListResponse<any>>;
  listNext?(nextLink: string): Promise<ResourceListResponse<any>>;
}

type ResourceResponse = {
  readonly _response: HttpResponse;
  readonly nextLink?: string;
};

export type ResourceListResponse<T> = Array<T> & ResourceResponse;

export type ResourceGetResponse<T> = T & ResourceResponse;

export abstract class Client {
  private auth: AzureManagementClientCredentials;
  private clientSecretCredentials: ClientSecretCredential;
  constructor(
    private config: IntegrationConfig,
    readonly logger: IntegrationLogger,
    readonly noRetryPolicy = false,
  ) {
    /// This integration only works on single tenant: https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/considerations/identity
    process.env.AZURE_IDENTITY_DISABLE_MULTITENANTAUTH = '1';
    this.clientSecretCredentials = new ClientSecretCredential(
      this.config.directoryId,
      this.config.clientId,
      this.config.clientSecret,
    );
  }

  /**
   * Provides `ClientSecretCredentials` for data access clients. Resource
   * Manager clients are authenticated using `ServiceClientCredentials`.
   *
   * @see authenticate
   */
  getClientSecretCredentials(): ClientSecretCredential {
    return this.clientSecretCredentials;
  }

  /**
   * Authenticates with Azure identity service to obtain an API token and caches
   * it, then instantiate the specific service client with the credentials. This
   * allows for re-using the credentials no many how many instances/types of
   * service clients are created.
   *
   * @param ctor an AzureServiceClient constructor function
   */
  async getAuthenticatedServiceClient<T>(
    ctor: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new (...args: any[]): T;
    },
    options?: {
      passSubscriptionId?: boolean;
    },
  ): Promise<T> {
    if (!this.auth) {
      this.auth = await retryResourceRequest(
        async () => await authenticate(this.config),
        FIVE_MINUTES,
        this.logger,
      );
    }
    const client = createClient(ctor, {
      auth: this.auth,
      logger: this.logger,
      noRetryPolicy: this.noRetryPolicy,
      passSubscriptionId:
        options?.passSubscriptionId === undefined
          ? true
          : options.passSubscriptionId,
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
  logger: IntegrationLogger,
  maxRetryAttempts: number = DEFAULT_MAX_RETRIES,
  timeout?: number,
): Promise<ResponseType> {
  return retry(
    async (_context) => {
      return requestFunc();
    },
    {
      // Some scopes have really low throttle caps. Specially the Authorization scope.
      // More retries == more possibilities of ingesting the 429s.
      maxAttempts: maxRetryAttempts,

      // No delay on the first attempt, wait for next period on subsequent
      // attempts. Assumes non-429 responses will not lead to subsequent
      // attempts (`handleError` will abort for other error responses).
      // calculateDelay: (context, _options) => {
      //   return context.attemptNum === 0 ? 0 : endpointRatePeriod;
      // },
      delay: endpointRatePeriod,
      factor: 1.1,
      timeout: timeout,
      // Most errors will be handled by the request policies. They will raise
      // a `RestError.statusCode: 429` when they see two 429 responses in a row,
      // which is the scenario we're aiming to address with our retry.
      //
      // Non Azure `RestError`s, such as ECONNRESET, should be retried.
      handleError: async (err, context, _options) => {
        if (
          err?.message &&
          typeof err?.message == 'string' &&
          err.message.includes('Get Token request returned http error: 4')
        ) {
          logger.info(
            {
              error: err.message,
            },
            'Encountered non-retryable error in Get Token request client.',
          );
          context.abort();
        } else if (err instanceof AzureRestError && err.statusCode !== 429) {
          logger.info(
            {
              error: err.message,
            },
            'Encountered non-retryable error in Resource Manager client.',
          );
          context.abort();
        } else {
          if (err.statusCode === 429) {
            const retry_after =
              (err.response.headers.get('retry-after') ?? 0) * 1000;
            logger.info(
              {
                err,
                retry_after_seconds: retry_after,
                attemptsRemaining: context.attemptsRemaining,
              },
              'Encountered retryable error in Resource Manager client. Will wait for retry.',
            );
            await sleep(retry_after);
          } else {
            logger.info(
              {
                error: err.message,
                attemptsRemaining: context.attemptsRemaining,
              },
              'Encountered retryable error in Resource Manager client.',
            );
            context.aborted = false; //Sometimes ECONNRESET errors are not being retried, this could help
          }
        }
      },
    },
  );
  async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export function createClient<T>(
  ctor: { new (...args: unknown[]): T },
  options: {
    auth: AzureManagementClientCredentials;
    logger: IntegrationLogger;
    noRetryPolicy?: boolean;
    passSubscriptionId: boolean;
  },
): T {
  // Builds a custom policy chain to address
  // https://github.com/Azure/azure-sdk-for-js/issues/7989
  // See also: https://docs.microsoft.com/en-us/azure/virtual-machines/troubleshooting/troubleshooting-throttling-errors
  const constructorOptions = {
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
  };

  let args: any[];
  if (options.passSubscriptionId) {
    args = [
      options.auth.credentials,
      options.auth.subscriptionId,
      constructorOptions,
    ];
  } else {
    args = [options.auth.credentials, constructorOptions];
  }
  return new ctor(...args);
}

export interface IterateAllResourcesOptions<ServiceClientType, ResourceType> {
  serviceClient: ServiceClientType;
  resourceEndpoint: ListAllResourcesEndpoint | ListResourcesEndpoint;
  resourceDescription: string;
  callback: (
    resource: ResourceType,
    serviceClient: ServiceClientType,
  ) => void | Promise<void>;
  logger: IntegrationLogger;
  endpointRatePeriod?: number;
  maxRetryAttempts?: number;
}

export async function requestWithAuthErrorhandling<T extends ResourceResponse>(
  resourceListCallback: () => Promise<T>,
  logger: IntegrationLogger,
  resourceDescription: string,
  endpointRatePeriod: number,
  timeout?: number,
): Promise<T | undefined> {
  try {
    return await request(
      resourceListCallback,
      logger,
      resourceDescription,
      endpointRatePeriod,
      timeout,
    );
  } catch (error) {
    if (error.status === 403) {
      logger.warn(
        { error, resourceUrl: resourceDescription },
        'Encountered auth error in Azure Graph client.',
      );
      logger.publishWarnEvent({
        name: IntegrationWarnEventName.MissingPermission,
        description: `Received authorization error when attempting to call ${resourceDescription}. Please update credentials to grant access.`,
      });
      return;
    } else {
      throw error;
    }
  }
}

/**
 * Call an azure endpoint that returns a ResourceListResponse. Explicitly handle
 * known API errors that we may encounter, including retries.
 */
export async function request<T extends ResourceResponse>(
  resourceListCallback: () => Promise<T>,
  logger: IntegrationLogger,
  resourceDescription: string,
  endpointRatePeriod: number,
  maxRetryAttempts: number = DEFAULT_MAX_RETRIES,
  timeout?: number,
): Promise<T | undefined> {
  try {
    const response = await retryResourceRequest<T>(
      resourceListCallback,
      endpointRatePeriod,
      logger,
      maxRetryAttempts,
      timeout,
    );
    return response;
  } catch (err) {
    /* istanbul ignore else */
    if (err.statusCode === 404 && resourceDescription != 'subscriptions') {
      logger.warn({ err }, 'Resources not found');
    } else {
      let status = '';
      let statusText = '';
      if (err instanceof AzureRestError) {
        status = err.body?.code ?? err.response?.status;
        statusText = err.body?.message ?? err.body?.error?.message;
        if (!statusText) {
          try {
            statusText = JSON.parse(JSON.parse(err.message)).error.message;
          } catch (error) {
            statusText = err.message;
          }
        }
      } else if (err instanceof FetchError) {
        status = err.code!;
        statusText = err.message;
      } else {
        status = err.statusCode;
        statusText = err.statusText;
      }
      if (
        statusText ===
          'The current subscription type is not permitted to perform operations on any provider namespace. Please use a different subscription.' ||
        status === 'Subscription Not Registered' ||
        status === 'SubscriptionNotRegistered'
      ) {
        // TODO handle this before hitting errors at this endpoint.
        return;
      }

      if (status === 'The specified account is disabled.') {
        // TODO handle this in storage blob, table, file, queue steps before hitting errors at this endpoint.
        return;
      }

      throw new IntegrationProviderAPIError({
        message: statusText,
        endpoint: resourceDescription,
        status,
        statusText,
      });
    }
  }
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
  maxRetryAttempts = DEFAULT_MAX_RETRIES,
}: IterateAllResourcesOptions<ServiceClientType, ResourceType>): Promise<void> {
  try {
    let nextLink: string | undefined;
    do {
      const response = await request(
        async () => {
          if ('listAllNext' in resourceEndpoint) {
            return nextLink
              ? /* istanbul ignore next: testing iteration might be difficult */
                await resourceEndpoint.listAllNext(nextLink)
              : await resourceEndpoint.listAll();
          } else {
            return resourceEndpoint.listNext && nextLink
              ? /* istanbul ignore next: testing iteration might be difficult */
                await resourceEndpoint.listNext(nextLink)
              : await resourceEndpoint.list();
          }
        },
        logger,
        resourceDescription,
        endpointRatePeriod,
        maxRetryAttempts,
      );
      if (response) {
        logger.debug(
          {
            resourceCount: response.length,
            resource: response._response.request.url,
            nextLink: response.nextLink,
          },
          'Received resources for endpoint',
        );
        for (const e of response) {
          await callback(e, serviceClient);
        }
        // On some cases the event grid would return
        // an invalid next link, it would follow the shape of
        // skiptoken=[{"token":null,"range":{"min":"05C1DF6B5557E0","max":"FF"}}] inside the uri
        // when we call that next link, it hangs. I believe this also might be happening on other steps.
        // Check the recording for 'rm-event-grid-domain-topic-subscriptions'
        if (
          response.nextLink &&
          decodeURIComponent(response.nextLink)?.includes('"token":null')
        ) {
          logger.info(
            { nextLink },
            'Iteration stopped because of invalid skiptoken',
          );
          return;
        }
        nextLink = response.nextLink;
      }
    } while (nextLink);
  } catch (error) {
    if (error.status === 403) {
      logger.warn(
        { error: error.message, resourceUrl: resourceEndpoint },
        'Encountered auth error in Azure Graph client.',
      );
      logger.publishWarnEvent({
        name: IntegrationWarnEventName.MissingPermission,
        description: `Received authorization error when attempting to call ${resourceEndpoint}. Please update credentials to grant access.`,
      });
      return;
    } else {
      throw error;
    }
  }
}
