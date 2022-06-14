import { FrontDoorManagementClient } from '@azure/arm-frontdoor';
import {
  FrontDoor,
  FrontendEndpoint,
  ManagedRuleSet,
  PreconfiguredEndpoint,
  Profile,
  RulesEngine,
  WebApplicationFirewallPolicy,
} from '@azure/arm-frontdoor/esm/models';
import {
  Client,
  iterateAllResources,
} from '../../../azure/resource-manager/client';

export class FrontDoorClient extends Client {
  public async iterateFrontDoors(
    callback: (resource: FrontDoor) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      FrontDoorManagementClient,
    );

    await iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.frontDoors,
      resourceDescription: 'frontdoor.frontdoors',
      callback,
    });
  }

  public async iterateFrontendEndpoints(
    params: { resourceGroupName: string; frontDoorName: string },
    callback: (resource: FrontendEndpoint) => void | Promise<void>,
  ): Promise<void> {
    const { resourceGroupName, frontDoorName } = params;
    const serviceClient = await this.getAuthenticatedServiceClient(
      FrontDoorManagementClient,
    );

    await iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: () =>
          serviceClient.frontendEndpoints.listByFrontDoor(
            resourceGroupName,
            frontDoorName,
          ),
        listNext: (nextLink) =>
          serviceClient.frontendEndpoints.listByFrontDoorNext(nextLink),
      },
      resourceDescription: 'frontdoor.frontendEndpoints',
      callback,
    });
  }

  public async iterateExperiments(
    params: { resourceGroupName: string; networkExperimentProfileName: string },
    callback: (resource: FrontDoor) => void | Promise<void>,
  ): Promise<void> {
    const { resourceGroupName, networkExperimentProfileName } = params;
    const serviceClient = await this.getAuthenticatedServiceClient(
      FrontDoorManagementClient,
    );

    await iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: () =>
          serviceClient.experiments.listByProfile(
            resourceGroupName,
            networkExperimentProfileName,
          ),
        listNext: (nextLink) =>
          serviceClient.experiments.listByProfileNext(nextLink),
      },
      resourceDescription: 'frontdoor.experiments',
      callback,
    });
  }

  public async iteratePreconfiguredEndpoints(
    params: { resourceGroupName: string; networkExperimentProfileName: string },
    callback: (resource: PreconfiguredEndpoint) => void | Promise<void>,
  ): Promise<void> {
    const { resourceGroupName, networkExperimentProfileName } = params;
    const serviceClient = await this.getAuthenticatedServiceClient(
      FrontDoorManagementClient,
    );

    await iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: () =>
          serviceClient.preconfiguredEndpoints.list(
            resourceGroupName,
            networkExperimentProfileName,
          ),
        listNext: (nextLink) =>
          serviceClient.preconfiguredEndpoints.listNext(nextLink),
      },
      resourceDescription: 'frontdoor.preconfiguredEndpoints',
      callback,
    });
  }

  public async iterateRulesEngines(
    params: { resourceGroupName: string; frontDoorName: string },
    callback: (resource: RulesEngine) => void | Promise<void>,
  ): Promise<void> {
    const { resourceGroupName, frontDoorName } = params;
    const serviceClient = await this.getAuthenticatedServiceClient(
      FrontDoorManagementClient,
    );

    await iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: () =>
          serviceClient.rulesEngines.listByFrontDoor(
            resourceGroupName,
            frontDoorName,
          ),
        listNext: (nextLink) =>
          serviceClient.rulesEngines.listByFrontDoorNext(nextLink),
      },
      resourceDescription: 'frontdoor.rulesEngines',
      callback,
    });
  }

  public async iterateManagedRuleSets(
    callback: (resource: ManagedRuleSet) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      FrontDoorManagementClient,
    );

    await iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.managedRuleSets,
      resourceDescription: 'frontdoor.managedRuleSets',
      callback,
    });
  }

  public async iterateNetworkExperimentProfiles(
    callback: (resource: Profile) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      FrontDoorManagementClient,
    );

    await iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.networkExperimentProfiles,
      resourceDescription: 'frontdoor.networkExperimentProfiles',
      callback,
    });
  }

  public async iteratePolicies(
    params: { resourceGroupName: string },
    callback: (resource: WebApplicationFirewallPolicy) => void | Promise<void>,
  ): Promise<void> {
    const { resourceGroupName } = params;
    const serviceClient = await this.getAuthenticatedServiceClient(
      FrontDoorManagementClient,
    );

    await iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: () => serviceClient.policies.list(resourceGroupName),
        listNext: (nextLink) => serviceClient.policies.listNext(nextLink),
      },
      resourceDescription: 'frontdoor.policies',
      callback,
    });
  }
}
