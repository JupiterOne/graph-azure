import {
  Entity,
  createIntegrationEntity,
  convertProperties,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import { DnsEntities } from './constants';
import { Zone, RecordSet } from '@azure/arm-dns/esm/models';

export function createDnsZoneEntity(
  webLinker: AzureWebLinker,
  data: Zone,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: data.id as string,
        _type: DnsEntities.ZONE._type,
        _class: DnsEntities.ZONE._class,
        id: data.id,
        name: data.name,
        domainName: data.name,
        recordsCount: data.numberOfRecordSets,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}

function getDomainRecordTypeFromAzureRecordSet(recordSet: RecordSet) {
  return recordSet.type?.replace('Microsoft.Network/dnszones/', '');
}

export function createDnsRecordSetEntity(
  webLinker: AzureWebLinker,
  data: RecordSet,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: data.id as string,
        _type: DnsEntities.RECORD_SET._type,
        _class: DnsEntities.RECORD_SET._class,
        id: data.id,
        name: data.name,
        TTL: data.tTL,
        type: getDomainRecordTypeFromAzureRecordSet(data),
        fqdn: data.fqdn,
        provisioningState: data.provisioningState,
        cnameRecord: data.cnameRecord?.cname,
        azureType: data.type,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}
