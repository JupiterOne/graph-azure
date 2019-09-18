import { ComputeManagementClient } from "@azure/arm-compute";
import {
  IntegrationError,
  IntegrationExecutionResult,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { AzureWebLinker, createAzureWebLinker } from "../azure";
import createComputeClient from "../azure/resource-manager/createComputeClient";
import iterateVirtualMachines from "../azure/resource-manager/iterateVirtualMachines";
import { createVirtualMachineEntity } from "../converters";
import {
  AccountEntity,
  VIRTUAL_MACHINE_ENTITY_TYPE,
  VirtualMachineEntity,
} from "../jupiterone";
import { AzureExecutionContext } from "../types";

export default async function synchronizeComputeResources(
  executionContext: AzureExecutionContext,
): Promise<IntegrationExecutionResult> {
  const {
    graph,
    persister,
    instance: { config },
  } = executionContext;
  const cache = executionContext.clients.getCache();

  const accountEntity = (await cache.getEntry("account")).data as AccountEntity;
  if (!accountEntity) {
    throw new IntegrationError(
      "Account fetch did not complete, cannot synchronize groups",
    );
  }

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain);

  const computeClient = await createComputeClient(config);

  const [oldVms, newVms] = await Promise.all([
    graph.findEntitiesByType(VIRTUAL_MACHINE_ENTITY_TYPE),
    fetchVirtualMachines(computeClient, webLinker),
  ]);

  const operationResults = await persister.publishEntityOperations(
    persister.processEntities(oldVms, newVms),
  );

  return {
    operations: operationResults,
  };
}

async function fetchVirtualMachines(
  client: ComputeManagementClient,
  webLinker: AzureWebLinker,
): Promise<VirtualMachineEntity[]> {
  const vms: VirtualMachineEntity[] = [];
  await iterateVirtualMachines(client, e => {
    vms.push(createVirtualMachineEntity(webLinker, e));
  });
  return vms;
}
