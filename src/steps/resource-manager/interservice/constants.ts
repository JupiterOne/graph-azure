import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { NetworkEntities } from '../network/constants';
import { VIRTUAL_MACHINE_ENTITY_TYPE } from '../compute/constants';

// Step IDs
export const STEP_RM_COMPUTE_NETWORK_RELATIONSHIPS =
  'rm-compute-network-relationships';

export const InterserviceRelationships = {
  VM_USES_NIC: {
    _type: 'azure_vm_uses_nic',
    sourceType: VIRTUAL_MACHINE_ENTITY_TYPE,
    _class: RelationshipClass.USES,
    targetType: NetworkEntities.NETWORK_INTERFACE._type,
  },
  VM_USES_PUBLIC_IP: {
    _type: 'azure_vm_uses_public_ip',
    sourceType: VIRTUAL_MACHINE_ENTITY_TYPE,
    _class: RelationshipClass.USES,
    targetType: NetworkEntities.PUBLIC_IP_ADDRESS._type,
  },
  SUBNET_HAS_VM: {
    _type: 'azure_subnet_has_vm',
    sourceType: NetworkEntities.SUBNET._type,
    _class: RelationshipClass.HAS,
    targetType: VIRTUAL_MACHINE_ENTITY_TYPE,
  },
};
