import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createResourceGroupResourceRelationshipMetadata } from '../utils/createResourceGroupResourceRelationship';

export const STEP_RM_DNS_ZONES = 'rm-dns-zones';
export const STEP_RM_DNS_RECORD_SETS = 'rm-dns-record-sets';

export const DnsEntities = {
  ZONE: {
    _type: 'azure_dns_zone',
    _class: ['DomainZone'],
    resourceName: '[RM] DNS Zone',
  },
  RECORD_SET: {
    _type: 'azure_dns_record_set',
    _class: ['DomainRecord'],
    resourceName: '[RM] DNS Record Set',
  },
};

export const DnsRelationships = {
  RESOURCE_GROUP_HAS_ZONE: createResourceGroupResourceRelationshipMetadata(
    DnsEntities.ZONE._type,
  ),
  ZONE_HAS_RECORD_SET: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      DnsEntities.ZONE,
      DnsEntities.RECORD_SET,
    ),
    sourceType: DnsEntities.ZONE._type,
    _class: RelationshipClass.HAS,
    targetType: DnsEntities.RECORD_SET._type,
  },
};
