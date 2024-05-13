import { DnsManagementClient } from '@azure/arm-dns';
import { Zone, RecordSet } from '@azure/arm-dns/esm/models';
import {
  Client,
  iterateAllResources,
} from '../../../azure/resource-manager/client';
import { resourceGroupName } from '../../../azure/utils';

export class J1DnsManagementClient extends Client {
  public async iterateDnsZones(
    callback: (s: Zone) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      DnsManagementClient,
    );

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.zones,
      resourceDescription: 'dns.zone',
      callback,
    });
  }

  public async iterateDnsRecordSets(
    dnsZone: { name: string; id: string },
    callback: (s: RecordSet) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      DnsManagementClient,
    );
    const resourceGroup = resourceGroupName(dnsZone.id, true)!;
    const zoneName = dnsZone.name;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => {
          return serviceClient.recordSets.listByDnsZone(
            resourceGroup,
            zoneName,
          );
        },
        listNext:
          /* istanbul ignore next: testing iteration might be difficult */ async (
            nextLink: string,
          ) => {
            return serviceClient.recordSets.listByDnsZoneNext(nextLink);
          },
      },
      resourceDescription: 'dns.recordSet',
      callback,
    });
  }
}
