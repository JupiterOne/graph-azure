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
    policySetDefinitionId: string,
  ): Promise<PolicySetDefinition | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PolicyClient,
    );

    const name = getNameFromPolicyDefinitionId(policySetDefinitionId);
    try {
      const response = await serviceClient.policySetDefinitions.get(name);
      return response;
    } catch (err) {
      this.logger.warn(
        {
          err,
          policyDefinitionId: policySetDefinitionId,
          policyDefinitionName: name,
        },
        'Error calling policySetDefintitions.get',
      );
    }
  }

  public async getBuiltInPolicySetDefinition(
    policySetDefinitionId: string,
  ): Promise<PolicySetDefinition | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PolicyClient,
    );

    const name = getNameFromPolicyDefinitionId(policySetDefinitionId);
    try {
      const response = await serviceClient.policySetDefinitions.getBuiltIn(
        name,
      );
      return response;
    } catch (err) {
      this.logger.warn(
        {
          err,
          policyDefinitionId: policySetDefinitionId,
          policyDefinitionName: name,
        },
        'Error calling policySetDefintitions.getBuiltIn',
      );
    }
  }

  public async getPolicyDefinition(
    policyDefinitionId: string,
  ): Promise<PolicyDefinition | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PolicyClient,
    );

    const name = getNameFromPolicyDefinitionId(policyDefinitionId);
    try {
      const response = await serviceClient.policyDefinitions.get(name);
      return response;
    } catch (err) {
      this.logger.warn(
        {
          err,
          policyDefinitionId,
          name,
        },
        'Error calling policyDefinitions.get',
      );
    }
  }

  public async getBuiltInPolicyDefinition(
    policyDefinitionId: string,
  ): Promise<PolicyDefinition | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PolicyClient,
    );

    const name = getNameFromPolicyDefinitionId(policyDefinitionId);
    try {
      const response = await serviceClient.policyDefinitions.getBuiltIn(name);
      return response;
    } catch (err) {
      this.logger.warn(
        {
          err,
          policyDefinitionId,
          name,
        },
        'Error calling policyDefinitions.getBuiltIn',
      );
    }
  }
}

function getNameFromPolicyDefinitionId(policyDefinitionId: string) {
  const slashDelimetedSegements = policyDefinitionId.split('/');
  return slashDelimetedSegements[slashDelimetedSegements.length - 1];
}
