import {
  Client,
  iterateAllResources,
  request,
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
    const response = await request(
      async () => await serviceClient.policySetDefinitions.get(name),
      this.logger,
      'policySetDefinition',
      60 * 1000,
    );
    return response?._response?.parsedBody;
  }

  public async getBuiltInPolicySetDefinition(
    name: string,
  ): Promise<PolicySetDefinition | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PolicyClient,
    );

    const response = await request(
      async () => await serviceClient.policySetDefinitions.getBuiltIn(name),
      this.logger,
      'policySetDefinition.getBuiltIn',
      60 * 1000,
    );
    return response?._response?.parsedBody;
  }

  public async getManagementGroupPolicySetDefinition(
    name: string,
    managementGroupId: string,
  ): Promise<PolicySetDefinition | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PolicyClient,
    );
    const response = await request(
      async () =>
        await serviceClient.policySetDefinitions.getAtManagementGroup(
          name,
          managementGroupId,
        ),
      this.logger,
      'policySetDefinition.getAtManagementGroup',
      60 * 1000,
    );
    return response?._response?.parsedBody;
  }

  public async getPolicyDefinition(
    name: string,
  ): Promise<PolicyDefinition | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PolicyClient,
    );
    const response = await request(
      async () => await serviceClient.policyDefinitions.get(name),
      this.logger,
      'policyDefinition',
      60 * 1000,
    );
    return response?._response?.parsedBody;
  }

  public async getBuiltInPolicyDefinition(
    name: string,
  ): Promise<PolicyDefinition | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PolicyClient,
    );
    const response = await request(
      async () => await serviceClient.policyDefinitions.getBuiltIn(name),
      this.logger,
      'policyDefinition.getBuiltIn',
      60 * 1000,
    );
    return response?._response?.parsedBody;
  }

  public async getManagementGroupPolicyDefinition(
    name: string,
    managementGroupId: string,
  ): Promise<PolicyDefinition | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PolicyClient,
    );
    const response = await request(
      async () =>
        await serviceClient.policyDefinitions.getAtManagementGroup(
          name,
          managementGroupId,
        ),
      this.logger,
      'policyDefinition.getAtManagementGroup',
      60 * 1000,
    );
    return response?._response?.parsedBody;
  }
}
