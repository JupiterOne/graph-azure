import { Entity } from "@jupiterone/integration-sdk";

import { createAzureWebLinker } from "../../../azure";
import { ACCOUNT_ENTITY_TYPE } from "../../../jupiterone";
import { IntegrationStepContext } from "../../../types";
import { ComputeClient } from "./client";
import {
  createDiskEntity,
  createImageEntity,
  createVirtualMachineDiskRelationships,
  createVirtualMachineEntity,
} from "./converters";

export async function fetchVirtualMachines(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ComputeClient(instance.config, logger);

  await client.iterateVirtualMachines(async (vm) => {
    await jobState.addEntity(createVirtualMachineEntity(webLinker, vm));
    if (vm.storageProfile) {
      await jobState.addRelationships(
        createVirtualMachineDiskRelationships(vm),
      );
    }
  });
}

export async function fetchVirtualMachineImages(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ComputeClient(instance.config, logger);

  await client.iterateVirtualMachineImages(async (vm) =>
    jobState.addEntity(createImageEntity(webLinker, vm)),
  );
}

export async function fetchVirtualMachineDisks(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new ComputeClient(instance.config, logger);

  await client.iterateVirtualMachineDisks(async (data) =>
    jobState.addEntity(createDiskEntity(webLinker, data)),
  );
}
