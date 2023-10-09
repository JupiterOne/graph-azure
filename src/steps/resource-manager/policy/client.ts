import {
  Client,
  FIVE_MINUTES,
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
      endpointRatePeriod: FIVE_MINUTES,
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
      FIVE_MINUTES,
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
      FIVE_MINUTES,
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
      FIVE_MINUTES,
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
      FIVE_MINUTES,
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
      FIVE_MINUTES,
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
      FIVE_MINUTES,
    );
    return response?._response?.parsedBody;
  }
}
