import { BatchManagementClient } from '@azure/arm-batch';
import {
  BatchAccount,
  Pool,
  Application,
  Certificate,
} from '@azure/arm-batch/esm/models';
import {
  Client,
} from '../../../azure/resource-manager/client';

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
    const serviceClient = await this.getAuthenticatedServiceClient(
      BatchManagementClient,
    );
    const { resourceGroupName } = resourceGroupInfo;

    this.logger.debug('Iterating Batch Accounts');
    let nextLink: string | undefined;
    try {
      do {
        const response = await (nextLink
          ? serviceClient.batchAccount.listByResourceGroupNext(nextLink)
          : serviceClient.batchAccount.listByResourceGroup(resourceGroupName));
        if (response) {
          for (const batchAccount of response) {
            await callback(batchAccount);
          }
          nextLink = response.nextLink;
        }
      } while (nextLink);
    } catch (error) {
      this.logger.error(
        { error: error.message },
        'Failed to iterate batch accounts'
      );
      throw error;
    }
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

    this.logger.debug('Iterating Batch Pools');

    let nextLink: string | undefined;

    try {
      do {
        const response = await (nextLink
          ? serviceClient.pool.listByBatchAccountNext(nextLink)
          : serviceClient.pool.listByBatchAccount(resourceGroupName, batchAccountName));

        if (response) {
          for (const pool of response) {
            await callback(pool);
          }
          nextLink = response.nextLink;
        }
      } while (nextLink);
    } catch (error) {
      this.logger.error(
        { error: error.message, resourceGroupName, batchAccountName },
        'Failed to iterate batch pools'
      );
      throw error;
    }
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

    this.logger.debug('Iterating Batch Account Applications');

    let nextLink: string | undefined;

    try {
      do {
        const response = await (nextLink
          ? serviceClient.application.listNext(nextLink)
          : serviceClient.application.list(resourceGroupName, batchAccountName));
        if (response) {
          for (const application of response) {
            await callback(application);
          }
          nextLink = response.nextLink;
        }
      } while (nextLink);
    } catch (error) {
      this.logger.error(
        { error: error.message, resourceGroupName, batchAccountName },
        'Failed to iterate batch applications'
      );
      throw error;
    }
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

    this.logger.debug('Iterating Batch Account Certificates');
    let nextLink: string | undefined;
    try {
      do {
        const response = await (nextLink
          ? serviceClient.certificate.listByBatchAccountNext(nextLink)
          : serviceClient.certificate.listByBatchAccount(resourceGroupName, batchAccountName));

        if (response) {
          for (const certificate of response) {
            await callback(certificate);
          }
          nextLink = response.nextLink;
        }
      } while (nextLink);
    } catch (error) {
      this.logger.error(
        { error: error.message, resourceGroupName, batchAccountName },
        'Failed to iterate batch certificates'
      );
      throw error;
    }
  }
}
