import {
  Entity,
  createIntegrationEntity,
  convertProperties,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import { PrivateDnsEntities } from './constants';
import { PrivateZone, RecordSet } from '@azure/arm-privatedns/esm/models';

export function createPrivateDnsZoneEntity(
  webLinker: AzureWebLinker,
  data: PrivateZone,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: data.id as string,
        _type: PrivateDnsEntities.ZONE._type,
        _class: PrivateDnsEntities.ZONE._class,
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
  return recordSet.type?.replace('Microsoft.Network/privateDnsZones/', '');
}

export function createPrivateDnsRecordSetEntity(
  webLinker: AzureWebLinker,
  data: RecordSet,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: data.id as string,
        _type: PrivateDnsEntities.RECORD_SET._type,
        _class: PrivateDnsEntities.RECORD_SET._class,
        id: data.id,
        name: data.name,
        TTL: data.ttl,
        type: getDomainRecordTypeFromAzureRecordSet(data),
        azureType: data.type,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}
