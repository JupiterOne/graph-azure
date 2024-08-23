import { BatchManagementClient } from '@azure/arm-batch';
import { BatchAccount, Pool, Application, Certificate } from '@azure/arm-batch';
import { Client, iterateAll } from '../../../azure/resource-manager/client';

export class BatchClient extends Client {
  /**
   * Retrieves all Batch Accounts for a Resource Group from an Azure Subscription
   * @param resourceGroup A Resource Group belonging to an Azure Subscription
   * @param callback A callback function to be called after retrieving a Batch Account
   */
  public async iterateBatchAccounts(
    resourceGroupInfo: { resourceGroupName: string },
    callback: (s: BatchAccount) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = this.getServiceClient(BatchManagementClient, {
      passSubscriptionId: true,
    });

    const { resourceGroupName } = resourceGroupInfo;

    return iterateAll({
      resourceEndpoint:
        serviceClient.batchAccountOperations.listByResourceGroup(
          resourceGroupName,
        ),
      logger: this.logger,
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
    const serviceClient = this.getServiceClient(BatchManagementClient, {
      passSubscriptionId: true,
    });

    const { resourceGroupName, batchAccountName } = batchAccountInfo;

    return iterateAll({
      resourceEndpoint: serviceClient.poolOperations.listByBatchAccount(
        resourceGroupName,
        batchAccountName,
      ),
      logger: this.logger,
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
    const serviceClient = this.getServiceClient(BatchManagementClient, {
      passSubscriptionId: true,
    });

    const { resourceGroupName, batchAccountName } = batchAccountInfo;

    return iterateAll({
      resourceEndpoint: serviceClient.applicationOperations.list(
        resourceGroupName,
        batchAccountName,
      ),
      logger: this.logger,
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
    const serviceClient = this.getServiceClient(BatchManagementClient, {
      passSubscriptionId: true,
    });

    const { resourceGroupName, batchAccountName } = batchAccountInfo;

    return iterateAll({
      resourceEndpoint: serviceClient.certificateOperations.listByBatchAccount(
        resourceGroupName,
        batchAccountName,
      ),
      logger: this.logger,
      resourceDescription: 'batch.certificate',
      callback,
    });
  }
}
