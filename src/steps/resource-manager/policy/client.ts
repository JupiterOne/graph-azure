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
  ): Promise<PolicySetDefinition> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PolicyClient,
    );

    return serviceClient.policySetDefinitions.get(name);
  }

  public async getBuiltInPolicySetDefinition(
    name: string,
  ): Promise<PolicySetDefinition> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PolicyClient,
    );

    return serviceClient.policySetDefinitions.getBuiltIn(name);
  }

  public async getManagementGroupPolicySetDefinition(
    name: string,
    managementGroupId: string,
  ): Promise<PolicySetDefinition> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PolicyClient,
    );

    return serviceClient.policySetDefinitions.getAtManagementGroup(
      name,
      managementGroupId,
    );
  }

  public async getPolicyDefinition(name: string): Promise<PolicyDefinition> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PolicyClient,
    );

    return serviceClient.policyDefinitions.get(name);
  }

  public async getBuiltInPolicyDefinition(
    name: string,
  ): Promise<PolicyDefinition> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PolicyClient,
    );

    return serviceClient.policyDefinitions.getBuiltIn(name);
  }

  public async getManagementGroupPolicyDefinition(
    name: string,
    managementGroupId: string,
  ): Promise<PolicyDefinition> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PolicyClient,
    );

    return serviceClient.policyDefinitions.getAtManagementGroup(
      name,
      managementGroupId,
    );
  }
}
