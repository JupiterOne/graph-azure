import {
  Entity,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk-core';
import { DdosEntities } from './constant';
import { DdosProtectionPlan } from '@azure/arm-network-latest';

export function getDdosProtectionPlanKey(protectionPlanId) {
  return `${DdosEntities.PROTECTION_PLAN._type}:${protectionPlanId}`;
}

export function createProtectionPlanEntity(data: DdosProtectionPlan): Entity {
  const publicIps: string[] | undefined = data.publicIPAddresses
    ?.filter((ip) => ip?.id !== undefined)
    .map((ip) => ip?.id ?? '');

  const vnets: string[] | undefined = data.virtualNetworks
    ?.filter((vn) => vn?.id !== undefined)
    .map((vn) => vn?.id ?? '');

  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: getDdosProtectionPlanKey(data.id),
        _type: DdosEntities.PROTECTION_PLAN._type,
        _class: DdosEntities.PROTECTION_PLAN._class,
        type: data.type,
        name: data.name,
        location: data.name,
        etag: data.etag,
        provisioningState: data.provisioningState,
        publicIPAddresses: publicIps,
        virtualNetworks: vnets,
      },
    },
  });
}
