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
   * Retrieves all Synapse Workspaces from an Azure Subscription
   * @param callback A callback function to be called after retrieving a Synapse Workspace
   */
  public async iterateWorkspaces(
    subscriptionId: string,
    callback: (s: Workspace) => void | Promise<void>,
  ): Promise<void> {
    const credential = this.getClientSecretCredentials();
    const client = new SynapseManagementClient(credential, subscriptionId);
    try {
      for await (let workspace of client.workspaces.list()) {
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

  public async iterateSqlPools(
    subscriptionId: string,
    resourceGroupName: string,
    workspaceName: string,
    callback: (s: SqlPool) => void | Promise<void>,
  ): Promise<void> {
    const credential = this.getClientSecretCredentials();
    const client = new SynapseManagementClient(credential, subscriptionId);
    try {
      for await (let sqlPool of client.sqlPools.listByWorkspace(
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

  public async iterateSynapseKeys(
    subscriptionId: string,
    resourceGroupName: string,
    workspaceName: string,
    callback: (s: Key) => void | Promise<void>,
  ): Promise<void> {
    const credential = this.getClientSecretCredentials();
    const client = new SynapseManagementClient(credential, subscriptionId);
    try {
      for await (let synapseKey of client.keys.listByWorkspace(
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
      for await (let dataMaskingrule of client.dataMaskingRules.listBySqlPool(
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
