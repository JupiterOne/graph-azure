import {
  Client,
  iterateAllResources,
} from '../../../azure/resource-manager/client';
import { PolicyClient } from '@azure/arm-policy';
import {
  PolicyAssignment,
  PolicyDefinition,
  PolicySetDefinition,
} from '@azure/arm-policy/esm/models';

export class AzurePolicyClient extends Client {
  /**
   * This operation retrieves the list of all policy assignments associated with the given subscription.
   * The list includes all policy assignments associated with the subscription,
   * including those that apply directly or from management groups that contain the given subscription,
   * as well as any applied to objects contained within the subscription.
   * @param callback A callback function to be called after retrieving a Policy Assignment
   */
  public async iteratePolicyAssignments(
    callback: (s: PolicyAssignment) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PolicyClient,
    );
    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.policyAssignments,
      resourceDescription: 'policy.assignment',
      callback,
    });
  }

  public async getPolicySetDefinition(
    name: string,
  ): Promise<PolicySetDefinition | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PolicyClient,
    );

    try {
      return await serviceClient.policySetDefinitions.get(name);
    } catch (err) {
      this.logger.warn(
        {
          name,
          err,
        },
        'Error getting policy set definition by name.',
      );
    }
  }

  public async getBuiltInPolicySetDefinition(
    name: string,
  ): Promise<PolicySetDefinition | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PolicyClient,
    );

    try {
      return await serviceClient.policySetDefinitions.getBuiltIn(name);
    } catch (err) {
      this.logger.warn(
        {
          name,
          err,
        },
        'Error getting built-in policy set definition by name.',
      );
    }
  }

  public async getPolicyDefinition(
    name: string,
  ): Promise<PolicyDefinition | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PolicyClient,
    );

    try {
      return await serviceClient.policyDefinitions.get(name);
    } catch (err) {
      this.logger.warn(
        {
          name,
          err,
        },
        'Error getting policy definition by name.',
      );
    }
  }

  public async getBuiltInPolicyDefinition(
    name: string,
  ): Promise<PolicyDefinition | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PolicyClient,
    );

    try {
      return await serviceClient.policyDefinitions.getBuiltIn(name);
    } catch (err) {
      this.logger.warn(
        {
          name,
          err,
        },
        'Error getting built-in policy definition by name.',
      );
    }
  }
}
