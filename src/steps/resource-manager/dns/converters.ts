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
        azureType: data.type,
        webLink: webLinker.portalResourceUrl(data.id),
        // CNAME type
        cnameRecord: data.cnameRecord?.cname,
        // SOA type
        soaRecordHost: data.soaRecord?.host,
        soaRecordEmail: data.soaRecord?.email,
        soaRecordserialNumber: data.soaRecord?.serialNumber,
        // A type
        aRecords: data.aRecords,
        // AAAA type
        aaaaRecords: data.aaaaRecords,
        // NS type
        nsRecords: data.nsRecords,
        // MX type
        mxRecords: data.mxRecords,
        // TXT type
        txtRecords: data.txtRecords,
        // PTR type
        ptrRecords: data.ptrRecords,
        // SRV type
        srvRecords: data.srvRecords,
      },
    },
  });
}
