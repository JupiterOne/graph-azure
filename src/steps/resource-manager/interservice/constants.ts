import {
  RelationshipClass,
  generateRelationshipType,
} from '@jupiterone/integration-sdk-core';
import { NetworkEntities } from '../network/constants';
import { VIRTUAL_MACHINE_ENTITY_TYPE } from '../compute';

// Step IDs
export const STEP_RM_COMPUTE_NETWORK_RELATIONSHIPS =
  'rm-compute-network-relationships';

// Graph objects

export const VIRTUAL_MACHINE_NIC_RELATIONSHIP_CLASS = RelationshipClass.USES;
export const VIRTUAL_MACHINE_NIC_RELATIONSHIP_TYPE = generateRelationshipType(
  VIRTUAL_MACHINE_NIC_RELATIONSHIP_CLASS,
  VIRTUAL_MACHINE_ENTITY_TYPE,
  NetworkEntities.NETWORK_INTERFACE._type,
);

export const VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_CLASS =
  RelationshipClass.USES;
export const VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_TYPE = generateRelationshipType(
  VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_CLASS,
  VIRTUAL_MACHINE_ENTITY_TYPE,
  NetworkEntities.PUBLIC_IP_ADDRESS._type,
);

export const SUBNET_VIRTUAL_MACHINE_RELATIONSHIP_CLASS = RelationshipClass.HAS;
export const SUBNET_VIRTUAL_MACHINE_RELATIONSHIP_TYPE = generateRelationshipType(
  SUBNET_VIRTUAL_MACHINE_RELATIONSHIP_CLASS,
  NetworkEntities.SUBNET._type,
  VIRTUAL_MACHINE_ENTITY_TYPE,
);
