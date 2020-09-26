import { BatchManagementClient } from '@azure/arm-batch';
import {
  BatchAccount,
  Pool,
  Application,
  Certificate,
} from '@azure/arm-batch/esm/models';
import {
  Client,
  iterateAllResources,
  ListResourcesEndpoint,
} from '../../../azure/resource-manager/client';

export class BatchClient extends Client {
  /**
   * Retrieves all Batch Accounts for a Resource Group from an Azure Subscription
   * @param resourceGroup A Resource Group belonging to an Azure Subscription
   * @param callback A callback function to be called after retrieving a Batch Account
   */
  public async iterateBatchAccounts(
    resourceGroup: { name: string },
    callback: (s: BatchAccount) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      BatchManagementClient,
    );
    const { name } = resourceGroup;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => serviceClient.batchAccount.listByResourceGroup(name),
        listNext: serviceClient.batchAccount.listByResourceGroupNext,
      } as ListResourcesEndpoint,
      resourceDescription: 'batch.account',
      callback,
    });
  }

  /**
   * Retrieves all Batch Account Pools for a Batch Account in a Resource Group from an Azure Subscription
   * @param batchAccountInfo Information for the Batch Account, including the resourceGroupName and batchAccountName
   * @param callback A callback function to be called after retrieving a Batch Account Pool
   */
  public async iterateBatchPools(
    batchAccountInfo: { resourceGroupName: string; batchAccountName: string },
    callback: (s: Pool) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      BatchManagementClient,
    );

    const { resourceGroupName, batchAccountName } = batchAccountInfo;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () =>
          serviceClient.pool.listByBatchAccount(
            resourceGroupName,
            batchAccountName,
          ),
        linkNext: serviceClient.pool.listByBatchAccountNext,
      } as ListResourcesEndpoint,
      resourceDescription: 'batch.pool',
      callback,
    });
  }

  /**
   * Retrieves all Batch Account Applications for a Batch Account in a Resource Group from an Azure Subscription
   * @param batchAccountInfo Information for the Batch Account, including the resourceGroupName and batchAccountName
   * @param callback A callback function to be called after retrieving a Batch Account Application
   */
  public async iterateBatchApplications(
    batchAccountInfo: { resourceGroupName: string; batchAccountName: string },
    callback: (s: Application) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      BatchManagementClient,
    );

    const { resourceGroupName, batchAccountName } = batchAccountInfo;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () =>
          serviceClient.application.list(resourceGroupName, batchAccountName),
        linkNext: serviceClient.application.listNext,
      } as ListResourcesEndpoint,
      resourceDescription: 'batch.application',
      callback,
    });
  }

  /**
   * Retrieves all Batch Account Certificates for a Batch Account in a Resource Group from an Azure Subscription
   * @param batchAccountInfo Information for the Batch Account, including the resourceGroupName and batchAccountName
   * @param callback A callback function to be called after retrieving a Batch Account Certificate
   */
  public async iterateBatchCertificates(
    batchAccountInfo: { resourceGroupName: string; batchAccountName: string },
    callback: (s: Certificate) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      BatchManagementClient,
    );

    const { resourceGroupName, batchAccountName } = batchAccountInfo;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () =>
          serviceClient.certificate.listByBatchAccount(
            resourceGroupName,
            batchAccountName,
          ),
        linkNext: serviceClient.certificate.listByBatchAccountNext,
      } as ListResourcesEndpoint,
      resourceDescription: 'batch.certificate',
      callback,
    });
  }
}
