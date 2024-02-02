import { CdnManagementClient } from '@azure/arm-cdn';
import { Profile, Endpoint } from '@azure/arm-cdn/esm/models';
import {
  Client,
  iterateAllResources,
} from '../../../azure/resource-manager/client';
import { resourceGroupName } from '../../../azure/utils';

export class CdnClient extends Client {
  public async iterateProfiles(
    callback: (p: Profile) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      CdnManagementClient,
    );

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.profiles,
      resourceDescription: 'cdn.profile',
      callback,
    });
  }

  public async iterateEndpoints(
    profile: { name: string; id: string },
    callback: (e: Endpoint) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      CdnManagementClient,
    );
    const resourceGroup = resourceGroupName(profile.id, true)!;
    const profileName = profile.name;
    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => {
          return serviceClient.endpoints.listByProfile(
            resourceGroup,
            profileName,
          );
        },
        listNext:
          /* istanbul ignore next: testing iteration might be difficult */ async (
            nextLink: string,
          ) => {
            return serviceClient.endpoints.listByProfileNext(nextLink);
          },
      },
      resourceDescription: 'cdn.endpoint',
      callback,
    });
  }
}
