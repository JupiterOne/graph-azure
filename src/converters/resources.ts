import { VirtualMachine } from "@azure/arm-compute/esm/models";

import { AzureWebLinker } from "../azure";
import {
  VIRTUAL_MACHINE_ENTITY_CLASS,
  VIRTUAL_MACHINE_ENTITY_TYPE,
  VirtualMachineEntity,
} from "../jupiterone";

export function createVirtualMachineEntity(
  webLinker: AzureWebLinker,
  data: VirtualMachine,
): VirtualMachineEntity {
  return {
    _key: `${VIRTUAL_MACHINE_ENTITY_TYPE}_${data.vmId}`,
    _type: VIRTUAL_MACHINE_ENTITY_TYPE,
    _class: VIRTUAL_MACHINE_ENTITY_CLASS,
    _rawData: [{ name: "default", rawData: data }],
    displayName: data.name,
    vmId: data.vmId,
    type: data.type,
    location: data.location,
    vmSize: data.hardwareProfile && data.hardwareProfile.vmSize,
    webLink: webLinker.portalResourceUrl(data.id),
  };
}
