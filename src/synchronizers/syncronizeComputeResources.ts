import forEach from "lodash.foreach";

import { VirtualMachine } from "@azure/arm-compute/esm/models";
import { NetworkInterface } from "@azure/arm-network/esm/models";
import {
  getRawData,
  IntegrationError,
  IntegrationExecutionResult,
} from "@jupiterone/jupiter-managed-integration-sdk";

import {
  AzureWebLinker,
  createAzureWebLinker,
  ResourceManagerClient,
} from "../azure";
import {
  createNetworkInterfaceEntity,
  createPublicIPAddressEntity,
  createVirtualMachineEntity,
  createVirtualMachineNetworkInterfaceRelationship,
  createVirtualMachinePublicIPAddressRelationship,
} from "../converters";
import {
  AccountEntity,
  NETWORK_INTERFACE_ENTITY_TYPE,
  NetworkInterfaceEntity,
  PUBLIC_IP_ADDRESS_ENTITY_TYPE,
  PublicIPAddressEntity,
  VIRTUAL_MACHINE_ENTITY_TYPE,
  VIRTUAL_MACHINE_NETWORK_INTERFACE_RELATIONSHIP_TYPE,
  VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_TYPE,
  VirtualMachineEntity,
  VirtualMachineNetworkInterfaceRelationship,
  VirtualMachinePublicIPAddressRelationship,
} from "../jupiterone";
import { AzureExecutionContext } from "../types";

import map = require("lodash.map");
export default async function synchronizeComputeResources(
  executionContext: AzureExecutionContext,
): Promise<IntegrationExecutionResult> {
  const { graph, persister, azrm } = executionContext;
  const cache = executionContext.clients.getCache();

  const accountEntity = (await cache.getEntry("account")).data as AccountEntity;
  if (!accountEntity) {
    throw new IntegrationError(
      "Account fetch did not complete, cannot synchronize groups",
    );
  }

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain);

  const [oldAddresses, newAddresses] = await Promise.all([
    graph.findEntitiesByType(PUBLIC_IP_ADDRESS_ENTITY_TYPE),
    fetchPublicIPAddresses(azrm, webLinker),
  ]);

  const [oldNics, newNics] = await Promise.all([
    graph.findEntitiesByType(NETWORK_INTERFACE_ENTITY_TYPE),
    fetchNetworkInterfaces(azrm, webLinker),
  ]);

  const [oldVms, newVms] = await Promise.all([
    graph.findEntitiesByType(VIRTUAL_MACHINE_ENTITY_TYPE),
    fetchVirtualMachines(azrm, webLinker),
  ]);

  const newVMNicRelationships: VirtualMachineNetworkInterfaceRelationship[] = [];
  const newVMAddressRelationships: VirtualMachinePublicIPAddressRelationship[] = [];

  forEach(newVms, vm => {
    const vmData = getRawData(vm) as VirtualMachine;
    const nicData = findNetworkInterfacesForVM(
      vmData,
      newNics.map(e => getRawData(e)),
    );
    forEach(nicData, nic => {
      newVMNicRelationships.push(
        createVirtualMachineNetworkInterfaceRelationship(vmData, nic),
      );
      forEach(nic.ipConfigurations, c => {
        if (c.publicIPAddress) {
          newVMAddressRelationships.push(
            createVirtualMachinePublicIPAddressRelationship(
              vmData,
              c.publicIPAddress,
            ),
          );
        }
      });
    });
  });

  const [oldVMNicRelationships, oldVMAddressRelationships] = await Promise.all([
    graph.findRelationshipsByType(
      VIRTUAL_MACHINE_NETWORK_INTERFACE_RELATIONSHIP_TYPE,
    ),
    graph.findRelationshipsByType(
      VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_TYPE,
    ),
  ]);

  const operationResults = await persister.publishPersisterOperations([
    [
      ...persister.processEntities(oldAddresses, newAddresses),
      ...persister.processEntities(oldNics, newNics),
      ...persister.processEntities(oldVms, newVms),
    ],
    [
      ...persister.processRelationships(
        oldVMNicRelationships,
        newVMNicRelationships,
      ),
      ...persister.processRelationships(
        oldVMAddressRelationships,
        newVMAddressRelationships,
      ),
    ],
  ]);

  return {
    operations: operationResults,
  };
}

async function fetchVirtualMachines(
  client: ResourceManagerClient,
  webLinker: AzureWebLinker,
): Promise<VirtualMachineEntity[]> {
  const entities: VirtualMachineEntity[] = [];
  await client.iterateVirtualMachines(e => {
    entities.push(createVirtualMachineEntity(webLinker, e));
  });
  return entities;
}

async function fetchNetworkInterfaces(
  client: ResourceManagerClient,
  webLinker: AzureWebLinker,
): Promise<NetworkInterfaceEntity[]> {
  const entities: NetworkInterfaceEntity[] = [];
  await client.iterateNetworkInterfaces(e => {
    entities.push(createNetworkInterfaceEntity(webLinker, e));
  });
  return entities;
}

async function fetchPublicIPAddresses(
  client: ResourceManagerClient,
  webLinker: AzureWebLinker,
): Promise<PublicIPAddressEntity[]> {
  const entities: PublicIPAddressEntity[] = [];
  await client.iteratePublicIPAddresses(e => {
    entities.push(createPublicIPAddressEntity(webLinker, e));
  });
  return entities;
}

function findNetworkInterfacesForVM(
  vm: VirtualMachine,
  nics: NetworkInterface[],
): NetworkInterface[] {
  const vmNics: NetworkInterface[] = [];
  if (vm.networkProfile) {
    map(vm.networkProfile.networkInterfaces, n =>
      nics.find(e => e.id === n.id),
    );
  }
  return vmNics;
}
