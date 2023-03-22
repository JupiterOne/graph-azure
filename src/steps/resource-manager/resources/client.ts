import { ResourceManagementClient } from '@azure/arm-resources';
import { ResourceGroup } from '@azure/arm-resources/esm/models';
import {
  Client,
  iterateAllResources,
  request,
} from '../../../azure/resource-manager/client';
import { IntegrationProviderAPIError } from '@jupiterone/integration-sdk-core';
import { ManagementLockClient, ManagementLockModels } from '@azure/arm-locks';
export class ResourcesClient extends Client {
  public async getResourceProvider(resourceProviderNamespace: string) {
    const serviceClient = await this.getAuthenticatedServiceClient(
      ResourceManagementClient,
    );
    const response = await request(
      async () => await serviceClient.providers.get(resourceProviderNamespace),
      this.logger,
      'policySetDefinition',
      60 * 1000,
    );
    return response?._response?.parsedBody;
  }

  public async iterateResourceGroups(
    callback: (rg: ResourceGroup) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      ResourceManagementClient,
    );
    try {
      const items = await serviceClient.resourceGroups.list();
      for (const item of items) {
        await callback(item);
      }
    } catch (err) {
      /* istanbul ignore else */
      if (err.statusCode === 404) {
        this.logger.warn({ err }, 'Resources not found');
      } else {
        throw new IntegrationProviderAPIError({
          cause: err,
          endpoint: 'resources.resourceGroups',
          status: err.statusCode,
          statusText: err.statusText,
        });
      }
    }
  }

  public async iterateLocks(
    resourceGroupName: string,
    callback: (
      lock: ManagementLockModels.ManagementLockObject,
    ) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      ManagementLockClient,
    );

    await iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: () =>
          serviceClient.managementLocks.listAtResourceGroupLevel(
            resourceGroupName,
          ),
        listNext: serviceClient.managementLocks.listAtResourceGroupLevelNext,
      },
      resourceDescription: 'resources.resourceLocks',
      callback,
    });
  }
}
