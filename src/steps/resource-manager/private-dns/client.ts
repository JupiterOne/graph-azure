import { PrivateDnsManagementClient } from '@azure/arm-privatedns';
import { PrivateZone, RecordSet } from '@azure/arm-privatedns/esm/models';
import {
  Client,
  iterateAllResources,
  ListResourcesEndpoint,
} from '../../../azure/resource-manager/client';
import { resourceGroupName } from '../../../azure/utils';

export class J1PrivateDnsManagementClient extends Client {
  public async iteratePrivateDnsZones(
    callback: (s: PrivateZone) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PrivateDnsManagementClient,
    );

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.privateZones,
      resourceDescription: 'privatedns.zone',
      callback,
    });
  }

  public async iteratePrivateDnsRecordSets(
    privateDnsZone: { name: string; id: string },
    callback: (s: RecordSet) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      PrivateDnsManagementClient,
    );
    const resourceGroup = resourceGroupName(privateDnsZone.id, true)!;
    const privateZoneName = privateDnsZone.name;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => {
          return serviceClient.recordSets.list(resourceGroup, privateZoneName);
        },
        listNext: /* istanbul ignore next: testing iteration might be difficult */ async (
          nextLink: string,
        ) => {
          return serviceClient.recordSets.listNext(nextLink);
        },
      } as ListResourcesEndpoint,
      resourceDescription: 'privatedns.recordSet',
      callback,
    });
  }
}
