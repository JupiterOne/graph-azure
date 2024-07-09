import { IntegrationWarnEventName } from '@jupiterone/integration-sdk-core';
import {
  GraphClient,
  IterableGraphResponse,
} from '../../../azure/graph/client';

export class ConditionalAccessPolicy extends GraphClient {
  public async iterateConditionalAccess(
    callback: (conditionalAccessPolicy) => void | Promise<void>,
  ): Promise<void> {
    const resourceUrl = `/identity/conditionalAccess/policies`;
    this.logger.debug('Iterating Conditional Access Policies');
    return this.iterateResources({
      resourceUrl,
      callback,
    });
  }

  public async iterateConditionalAccessNamedLocation(
    callback: (conditionalAccessNamedLocation) => void | Promise<void>,
  ): Promise<void> {
    const resourceUrl = `/identity/conditionalAccess/namedLocations`;
    this.logger.debug('Iterating Conditional Access Named Locations');
    return this.iterateResources({
      resourceUrl,
      callback,
    });
  }

  public async iterateConditionalAccessAuthorizationContext(
    callback: (conditionalAccessAuthContext) => void | Promise<void>,
  ): Promise<void> {
    const resourceUrl = `/identity/conditionalAccess/authenticationContextClassReferences`;
    this.logger.debug('Iterating Conditional Access Authentication Context');
    return this.iterateResources({
      resourceUrl,
      callback,
    });
  }

  public async iterateConditionalAccessTemplate(
    callback: (conditionalAccessTemplate) => void | Promise<void>,
  ): Promise<void> {
    const resourceUrl = `/identity/conditionalAccess/templates`;
    this.logger.debug('Iterating Conditional Access Templates');
    return this.iterateResources({
      resourceUrl,
      callback,
    });
  }

  // Not using PageIterator because it doesn't allow async callback
  private async iterateResources<T>({
    resourceUrl,
    options,
    callback,
  }: {
    resourceUrl: string;
    options?: { select?: string[]; useBeta?: boolean; expand?: string };
    callback: (item: T) => void | Promise<void>;
  }): Promise<void> {
    try {
      let nextLink: string | undefined;
      do {
        let api = this.client.api(nextLink || resourceUrl);
        //nextlink: The URL also contains all the other query parameters present in the original request.
        if (!nextLink) {
          if (options?.useBeta) {
            api = api.version('v1.0');
          }
          if (options?.select) {
            api = api.select(options.select);
          }
          if (options?.expand) {
            api = api.expand(options.expand);
          }
        }

        const response = await this.request<IterableGraphResponse<T>>(api);
        if (response) {
          nextLink = response['@odata.nextLink'];
          for (const value of response.value) {
            try {
              await callback(value);
            } catch (err) {
              this.logger.warn(
                {
                  resourceUrl,
                  error: err.message,
                },
                'Callback error while iterating an API response in AccessPackageClient',
              );
            }
          }
        } else {
          nextLink = undefined;
        }
      } while (nextLink);
    } catch (error) {
      if (error.status === 403) {
        this.logger.warn(
          { error: error.message, resourceUrl: resourceUrl },
          'Encountered auth error in Azure Graph client.',
        );
        this.logger.publishWarnEvent({
          name: IntegrationWarnEventName.MissingPermission,
          description: `Received authorization error when attempting to call ${resourceUrl}. Please update credentials to grant access.`,
        });
        return;
      } else {
        throw error;
      }
    }
  }
}
