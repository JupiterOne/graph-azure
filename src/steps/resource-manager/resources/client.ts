import { ResourceManagementClient } from '@azure/arm-resources';
import { ResourceGroup } from '@azure/arm-resources/esm/models';
import { Client } from '../../../azure/resource-manager/client';
import { IntegrationProviderAPIError } from '@jupiterone/integration-sdk-core';
import {
  ManagementLockClientContext,
  ManagementLocks,
  ManagementLockModels,
} from '@azure/arm-locks';
export class ResourcesClient extends Client {
  public async getResourceProvider(resourceProviderNamespace: string) {
    const serviceClient = await this.getAuthenticatedServiceClient(
      ResourceManagementClient,
    );

    return serviceClient.providers.get(resourceProviderNamespace);
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
      ManagementLockClientContext,
    );
    const client = new ManagementLocks(serviceClient);
    try {
      const items = await client.listAtResourceGroupLevel(resourceGroupName);
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
          endpoint: 'resources.locks',
          status: err.statusCode,
          statusText: err.statusText,
        });
      }
    }
  }
}
