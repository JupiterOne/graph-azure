import { IntegrationWarnEventName } from '@jupiterone/integration-sdk-core';
import { Client } from '../../../azure/resource-manager/client';
import { SynapseManagementClient, Workspace } from '@azure/arm-synapse';

export class SynapseClient extends Client {
  /**
   * Retrieves all Synapse Workspaces from an Azure Subscription
   * @param callback A callback function to be called after retrieving a Synapse Workspace
   */
  public async iterateDomains(
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
}
