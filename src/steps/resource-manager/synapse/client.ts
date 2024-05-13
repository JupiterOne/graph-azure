import { IntegrationWarnEventName } from '@jupiterone/integration-sdk-core';
import { Client } from '../../../azure/resource-manager/client';
import {
  SynapseManagementClient,
  Workspace,
  SqlPool,
  DataMaskingPolicy,
  DataMaskingRule,
  Key,
} from '@azure/arm-synapse';

export class SynapseClient extends Client {
  /**
   * Retrieves all Synapse Workspaces from an Azure Subscription.
   * @param subscriptionId The ID of the Azure Subscription containing the Synapse Workspaces.
   * @param callback A callback function to be called with each retrieved Synapse Workspace.
   * @returns A promise that resolves once all Synapse Workspaces have been iterated through.
   * @throws {Error} If an error occurs during the retrieval process.
   */
  public async iterateWorkspaces(
    subscriptionId: string,
    callback: (s: Workspace) => void | Promise<void>,
  ): Promise<void> {
    const credential = this.getClientSecretCredentials();
    const client = new SynapseManagementClient(credential, subscriptionId);
    try {
      for await (const workspace of client.workspaces.list()) {
        await callback(workspace);
      }
    } catch (err) {
      if (err.statusCode === 403) {
        this.logger.warn({ err }, err.message);
        this.logger.publishWarnEvent({
          name: IntegrationWarnEventName.MissingPermission,
          description: err.message,
        });
      } else if (
        err.statusCode === 401 &&
        err.message.toString().includes('AKV10032')
      ) {
        this.logger.warn(
          { err: err },
          'Failed to retrieve a Synapse Workspace data',
        );
        this.logger.publishWarnEvent({
          name: IntegrationWarnEventName.MissingEntity,
          description: `This tenant/application is not allowed to access workspaces`,
        });
      } else {
        throw err;
      }
    }
  }

  /**
   * Retrieves all SQL Pools from a Synapse Workspace in an Azure Subscription.
   * @param subscriptionId The ID of the Azure Subscription containing the Synapse Workspace.
   * @param resourceGroupName The name of the Resource Group containing the Synapse Workspace.
   * @param workspaceName The name of the Synapse Workspace.
   * @param callback A callback function to be called with each retrieved SQL Pool.
   * @returns A promise that resolves once all SQL Pools have been iterated through.
   * @throws {Error} If an error occurs during the retrieval process.
   */
  public async iterateSqlPools(
    subscriptionId: string,
    resourceGroupName: string,
    workspaceName: string,
    callback: (s: SqlPool) => void | Promise<void>,
  ): Promise<void> {
    const credential = this.getClientSecretCredentials();
    const client = new SynapseManagementClient(credential, subscriptionId);
    try {
      for await (const sqlPool of client.sqlPools.listByWorkspace(
        resourceGroupName,
        workspaceName,
      )) {
        await callback(sqlPool);
      }
    } catch (err) {
      if (err.statusCode === 403) {
        this.logger.warn({ err }, err.message);
        this.logger.publishWarnEvent({
          name: IntegrationWarnEventName.MissingPermission,
          description: err.message,
        });
      } else if (
        err.statusCode === 401 &&
        err.message.toString().includes('AKV10032')
      ) {
        this.logger.warn(
          { err: err },
          'Failed to retrieve a Synapse SQL Pool data',
        );
        this.logger.publishWarnEvent({
          name: IntegrationWarnEventName.MissingEntity,
          description: `This tenant/application is not allowed to access SQL Pool`,
        });
      } else {
        throw err;
      }
    }
  }

  /**
   * Retrieves all keys associated with a Synapse Workspace in an Azure Subscription.
   * @param subscriptionId The ID of the Azure Subscription containing the Synapse Workspace.
   * @param resourceGroupName The name of the Resource Group containing the Synapse Workspace.
   * @param workspaceName The name of the Synapse Workspace.
   * @param callback A callback function to be called with each retrieved key.
   * @returns A promise that resolves once all keys have been iterated through.
   * @throws {Error} If an error occurs during the retrieval process.
   */
  public async iterateSynapseKeys(
    subscriptionId: string,
    resourceGroupName: string,
    workspaceName: string,
    callback: (s: Key) => void | Promise<void>,
  ): Promise<void> {
    const credential = this.getClientSecretCredentials();
    const client = new SynapseManagementClient(credential, subscriptionId);
    try {
      for await (const synapseKey of client.keys.listByWorkspace(
        resourceGroupName,
        workspaceName,
      )) {
        await callback(synapseKey);
      }
    } catch (err) {
      if (err.statusCode === 403) {
        this.logger.warn({ err }, err.message);
        this.logger.publishWarnEvent({
          name: IntegrationWarnEventName.MissingPermission,
          description: err.message,
        });
      } else if (
        err.statusCode === 401 &&
        err.message.toString().includes('AKV10032')
      ) {
        this.logger.warn({ err: err }, 'Failed to retrieve a Synapse Key data');
        this.logger.publishWarnEvent({
          name: IntegrationWarnEventName.MissingEntity,
          description: `This tenant/application is not allowed to access Key`,
        });
      } else {
        throw err;
      }
    }
  }

  /**
   * Retrieves the data masking policy associated with a specific SQL pool in a Synapse workspace.
   * @param subscriptionId The ID of the Azure Subscription containing the Synapse workspace.
   * @param resourceGroupName The name of the Resource Group containing the Synapse workspace.
   * @param workspaceName The name of the Synapse workspace.
   * @param sqlPoolName The name of the SQL pool.
   * @param callback A callback function to be called with the retrieved data masking policy.
   * @returns {Promise<void>} A promise that resolves once the data masking policy has been retrieved and the callback function has been executed.
   * @throws {Error} If an error occurs during the retrieval process.
   */
  public async iterateDataMaskingPolicies(
    subscriptionId: string,
    resourceGroupName: string,
    workspaceName: string,
    sqlPoolName: string,
    callback: (s: DataMaskingPolicy) => void | Promise<void>,
  ) {
    const credential = this.getClientSecretCredentials();
    const client = new SynapseManagementClient(credential, subscriptionId);
    try {
      const result = await client.dataMaskingPolicies.get(
        resourceGroupName,
        workspaceName,
        sqlPoolName,
      );
      await callback(result);
    } catch (err) {
      if (err.statusCode === 403) {
        this.logger.warn({ err }, err.message);
        this.logger.publishWarnEvent({
          name: IntegrationWarnEventName.MissingPermission,
          description: err.message,
        });
      } else if (
        err.statusCode === 401 &&
        err.message.toString().includes('AKV10032')
      ) {
        this.logger.warn(
          { err: err },
          'Failed to retrieve a Synapse Data Masking Policy',
        );
        this.logger.publishWarnEvent({
          name: IntegrationWarnEventName.MissingEntity,
          description: `This tenant/application is not allowed to access Data Masking Policy`,
        });
      } else {
        throw err;
      }
    }
  }

  /**
   * Retrieves all data masking rules associated with a specific SQL pool in a Synapse workspace.
   * @param subscriptionId The ID of the Azure Subscription containing the Synapse workspace.
   * @param resourceGroupName The name of the Resource Group containing the Synapse workspace.
   * @param workspaceName The name of the Synapse workspace.
   * @param sqlPoolName The name of the SQL pool.
   * @param callback A callback function to be called with each retrieved data masking rule.
   * @returns {Promise<void>} A promise that resolves once all data masking rules have been iterated through.
   * @throws {Error} If an error occurs during the retrieval process.
   */
  public async iterateDataMaskingRules(
    subscriptionId: string,
    resourceGroupName: string,
    workspaceName: string,
    sqlPoolName: string,
    callback: (s: DataMaskingRule) => void | Promise<void>,
  ) {
    const credential = this.getClientSecretCredentials();
    const client = new SynapseManagementClient(credential, subscriptionId);
    try {
      for await (const dataMaskingrule of client.dataMaskingRules.listBySqlPool(
        resourceGroupName,
        workspaceName,
        sqlPoolName,
      )) {
        await callback(dataMaskingrule);
      }
    } catch (err) {
      if (err.statusCode === 403) {
        this.logger.warn({ err }, err.message);
        this.logger.publishWarnEvent({
          name: IntegrationWarnEventName.MissingPermission,
          description: err.message,
        });
      } else if (
        err.statusCode === 401 &&
        err.message.toString().includes('AKV10032')
      ) {
        this.logger.warn(
          { err: err },
          'Failed to retrieve a Synapse Data Masking Rule',
        );
        this.logger.publishWarnEvent({
          name: IntegrationWarnEventName.MissingEntity,
          description: `This tenant/application is not allowed to access Data Masking Rule`,
        });
      } else {
        throw err;
      }
    }
  }
}
