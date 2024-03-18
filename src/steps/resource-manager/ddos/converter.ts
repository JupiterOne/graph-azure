import {
  Entity,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk-core';
import { Ddos_Entities } from './constant';
import { DdosProtectionPlan } from '@azure/arm-network-latest';

function getDdosProtectionPlanKey(protectionPlanId) {
  return `${Ddos_Entities.protection_plan._type}:${protectionPlanId}`;
}

export function createProtectionPlanEntity(data: DdosProtectionPlan): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: getDdosProtectionPlanKey(data.id),
        _type: Ddos_Entities.protection_plan._type,
        _class: Ddos_Entities.protection_plan._class,
        type: data.type,
        name: data.name,
        location: data.name,
        etag: data.etag,
        provisioningState: data.provisioningState,
      },
    },
  });
}
