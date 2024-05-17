import { IntegrationWarnEventName } from '@jupiterone/integration-sdk-core';
import {
  GraphClient,
  IterableGraphResponse,
} from '../../../azure/graph/client';
import { ApplicationPackage } from '@azure/arm-batch/esm/models';
import { PolicyAssignment } from '@azure/arm-policy/esm/models';

export class AccessPackageClient extends GraphClient {
  public async iterateAccessPackage(
    callback: (packages: ApplicationPackage) => void | Promise<void>,
  ): Promise<void> {
    const resourceUrl = `/identityGovernance/entitlementManagement/accessPackages`;
    this.logger.debug('Iterating Access Packages');
    return this.iterateResources({
      resourceUrl,
      callback,
    });
  }

  public async iterateAccessPackageAssignment(
    callback: (assignment: any) => void | Promise<void>,
  ): Promise<void> {
    const resourceUrl = `/identityGovernance/entitlementManagement/assignments?$expand=accessPackage,assignmentPolicy`;
    this.logger.debug('Iterating Access Packages Assignment');
    return this.iterateResources({
      resourceUrl,
      callback,
    });
  }

  public async iterateAccessPackageAssignmentPolicy(
    callback: (policy: PolicyAssignment) => void | Promise<void>,
  ): Promise<void> {
    const resourceUrl = `/identityGovernance/entitlementManagement/assignmentPolicies`;
    this.logger.debug('Iterating Access Packages Assignment Policy');
    return this.iterateResources({
      resourceUrl,
      callback,
    });
  }

  public async iterateAccessPackageAssignmentRequest(
    callback: (request: any) => void | Promise<void>,
  ): Promise<void> {
    const resourceUrl = `/identityGovernance/entitlementManagement/assignmentRequests?$expand=requestor`;
    this.logger.debug('Iterating Access Packages Assignment Request');
    return this.iterateResources({
      resourceUrl,
      callback,
    });
  }

  public async iterateAccessPackageAssignmentApprover(
    input: {
      requestId: string;
    },
    callback: (approver: any) => void | Promise<void>,
  ): Promise<void> {
    const resourceUrl = `/identityGovernance/entitlementManagement/accessPackageAssignmentApprovals/${input.requestId}`;
    this.logger.debug('Iterating Access Packages Assignment Approver');
    return this.iterateResourcesforApprover({
      resourceUrl,
      callback,
    });
  }

  public async iterateAccessPackagecatalog(
    callback: (catalog: any) => void | Promise<void>,
  ): Promise<void> {
    const resourceUrl = `/identityGovernance/entitlementManagement/catalogs`;
    this.logger.debug('Iterating Access Packages Catalog');
    return this.iterateResources({
      resourceUrl,
      callback,
    });
  }

  public async iterateAccessPackageResource(
    input: {
      catalogId: string;
    },
    callback: (catealog: any) => void | Promise<void>,
  ): Promise<void> {
    const resourceUrl = `/identityGovernance/entitlementManagement/catalogs/${input.catalogId}/resources?$expand=scopes,roles`;
    this.logger.debug('Iterating Access Packages Resource');
    return this.iterateResources({
      resourceUrl,
      callback,
    });
  }

  public async iterateAzureApplications(
    callback: (application: any) => void | Promise<void>,
  ): Promise<void> {
    const resourceUrl = `/applications`;
    this.logger.debug('Iterating Azure Applications');
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

  private async iterateResourcesforApprover<T>({
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
          for (const value of response.stages) {
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
