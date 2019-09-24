import { VirtualMachine } from "@azure/arm-compute/esm/models";
import {
  IPConfiguration,
  NetworkInterface,
} from "@azure/arm-network/esm/models";

import { AzureWebLinker } from "../azure";
import {
  NETWORK_INTERFACE_ENTITY_CLASS,
  NETWORK_INTERFACE_ENTITY_TYPE,
  NetworkInterfaceEntity,
  VIRTUAL_MACHINE_ENTITY_CLASS,
  VIRTUAL_MACHINE_ENTITY_TYPE,
  VirtualMachineEntity,
} from "../jupiterone";

import map from "lodash.map";

export function createNetworkInterfaceEntity(
  webLinker: AzureWebLinker,
  data: NetworkInterface,
): NetworkInterfaceEntity {
  const privateIps = privateIpAddresses(data.ipConfigurations);

  return {
    _key: `${NETWORK_INTERFACE_ENTITY_TYPE}_${data.resourceGuid}`,
    _type: NETWORK_INTERFACE_ENTITY_TYPE,
    _class: NETWORK_INTERFACE_ENTITY_CLASS,
    _rawData: [{ name: "default", rawData: data }],
    displayName: data.name,
    vmId: data.virtualMachine && data.virtualMachine.id,
    type: data.type,
    location: data.location,
    publicIp: undefined,
    publicIpAddress: undefined,
    privateIp: privateIps,
    privateIpAddress: privateIps,
    macAddress: data.macAddress,
    securityGroupId: data.networkSecurityGroup && data.networkSecurityGroup.id,
    ipForwarding: data.enableIPForwarding,
    webLink: webLinker.portalResourceUrl(data.id),
  };
}

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

function privateIpAddresses(
  ipConfigurations: IPConfiguration[] | undefined,
): string[] {
  const configs =
    ipConfigurations && ipConfigurations.filter(c => c.privateIPAddress);
  return map(configs, a => a.privateIPAddress) as string[];
}
