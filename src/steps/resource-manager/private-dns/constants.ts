import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createResourceGroupResourceRelationshipMetadata } from '../utils/createResourceGroupResourceRelationship';

// Fetch Resource Groups
export const STEP_RM_PRIVATE_DNS_ZONES = 'rm-private-dns-zones';
export const STEP_RM_PRIVATE_DNS_RECORD_SETS = 'rm-private-dns-record-sets';

export const PrivateDnsEntities = {
  ZONE: {
    _type: 'azure_private_dns_zone',
    _class: ['DomainZone'],
    resourceName: '[RM] Private DNS Zone',
  },
  RECORD_SET: {
    _type: 'azure_private_dns_record_set',
    _class: ['DomainRecord'],
    resourceName: '[RM] Private DNS Record Set',
  },
};

export const PrivateDnsRelationships = {
  RESOURCE_GROUP_HAS_ZONE: createResourceGroupResourceRelationshipMetadata(
    PrivateDnsEntities.ZONE._type,
  ),
  ZONE_HAS_RECORD_SET: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      PrivateDnsEntities.ZONE,
      PrivateDnsEntities.RECORD_SET,
    ),
    sourceType: PrivateDnsEntities.ZONE._type,
    _class: RelationshipClass.HAS,
    targetType: PrivateDnsEntities.RECORD_SET._type,
  },
};
