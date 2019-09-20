import {
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
  createVirtualMachineEntity,
} from "../converters";
import {
  AccountEntity,
  NETWORK_INTERFACE_ENTITY_TYPE,
  NetworkInterfaceEntity,
  VIRTUAL_MACHINE_ENTITY_TYPE,
  VirtualMachineEntity,
} from "../jupiterone";
import { AzureExecutionContext } from "../types";

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

  const [oldVms, newVms] = await Promise.all([
    graph.findEntitiesByType(VIRTUAL_MACHINE_ENTITY_TYPE),
    fetchVirtualMachines(azrm, webLinker),
  ]);

  const [oldNics, newNics] = await Promise.all([
    graph.findEntitiesByType(NETWORK_INTERFACE_ENTITY_TYPE),
    fetchNetworkInterfaces(azrm, webLinker),
  ]);

  const operationResults = await persister.publishEntityOperations([
    ...persister.processEntities(oldVms, newVms),
    ...persister.processEntities(oldNics, newNics),
  ]);

  return {
    operations: operationResults,
  };
}

async function fetchVirtualMachines(
  client: ResourceManagerClient,
  webLinker: AzureWebLinker,
): Promise<VirtualMachineEntity[]> {
  const vms: VirtualMachineEntity[] = [];
  await client.iterateVirtualMachines(e => {
    vms.push(createVirtualMachineEntity(webLinker, e));
  });
  return vms;
}

async function fetchNetworkInterfaces(
  client: ResourceManagerClient,
  webLinker: AzureWebLinker,
): Promise<NetworkInterfaceEntity[]> {
  const vms: NetworkInterfaceEntity[] = [];
  await client.iterateNetworkInterfaces(e => {
    vms.push(createNetworkInterfaceEntity(webLinker, e));
  });
  return vms;
}
