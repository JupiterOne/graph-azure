import { ComputeManagementClient } from '@azure/arm-compute';
import {
  Disk,
  VirtualMachine,
  VirtualMachineExtension,
  VirtualMachineImage,
} from '@azure/arm-compute/esm/models';
import { IntegrationProviderAPIError } from '@jupiterone/integration-sdk-core';

import {
  Client,
  iterateAllResources,
} from '../../../azure/resource-manager/client';
import { resourceGroupName } from '../../../azure/utils';

export class ComputeClient extends Client {
  public async iterateVirtualMachines(
    callback: (vm: VirtualMachine) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      ComputeManagementClient,
    );
    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.virtualMachines,
      resourceDescription: 'compute.virtualMachines',
      callback,
    });
  }

  public async iterateVirtualMachineExtensions(
    virtualMachine: {
      name: string;
      id: string;
    },
    callback: (e: VirtualMachineExtension) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      ComputeManagementClient,
    );

    const resourceGroup = resourceGroupName(virtualMachine.id);
    const vmName = virtualMachine.name;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => {
          const response = await serviceClient.virtualMachineExtensions.list(
            resourceGroup!,
            vmName,
          );
          const virtualMachineExtensions = response.value!;
          return Object.assign(virtualMachineExtensions, {
            _response: response._response,
          });
        },
      },
      resourceDescription: 'compute.virtualMachine.extensions',
      callback,
    });
  }

  public async iterateVirtualMachineDisks(
    callback: (d: Disk) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      ComputeManagementClient,
    );
    try {
      const items = await serviceClient.disks.list();
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
          endpoint: 'compute.disks',
          status: err.statusCode,
          statusText: err.statusText,
        });
      }
    }
  }

  /* istanbul ignore next: core functionality covered by other tests */
  public async iterateVirtualMachineImages(
    callback: (i: VirtualMachineImage) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      ComputeManagementClient,
    );
    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.images,
      resourceDescription: 'compute.images',
      callback,
    });
  }
}
