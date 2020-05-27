import { Entity } from "@jupiterone/integration-sdk";

import { createAzureWebLinker } from "../../../azure";
import { IntegrationStepContext } from "../../../types";
import { ACCOUNT_ENTITY_TYPE, STEP_AD_ACCOUNT } from "../../active-directory";
import { ComputeClient } from "./client";
import {
  DISK_ENTITY_TYPE,
  STEP_RM_COMPUTE_VIRTUAL_MACHINE_DISKS,
  STEP_RM_COMPUTE_VIRTUAL_MACHINE_IMAGES,
  STEP_RM_COMPUTE_VIRTUAL_MACHINES,
  VIRTUAL_MACHINE_DISK_RELATIONSHIP_TYPE,
  VIRTUAL_MACHINE_ENTITY_TYPE,
  VIRTUAL_MACHINE_IMAGE_ENTITY_TYPE,
} from "./constants";
import {
  createDiskEntity,
  createImageEntity,
  createVirtualMachineDiskRelationships,
  createVirtualMachineEntity,
} from "./converters";

export * from "./constants";

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

export const computeSteps = [
  {
    id: STEP_RM_COMPUTE_VIRTUAL_MACHINE_IMAGES,
    name: "Virtual Machine Disk Images",
    types: [VIRTUAL_MACHINE_IMAGE_ENTITY_TYPE],
    dependsOn: [STEP_AD_ACCOUNT],
    executionHandler: fetchVirtualMachineImages,
  },
  {
    id: STEP_RM_COMPUTE_VIRTUAL_MACHINE_DISKS,
    name: "Virtual Machine Disks",
    types: [DISK_ENTITY_TYPE],
    dependsOn: [STEP_AD_ACCOUNT],
    executionHandler: fetchVirtualMachineDisks,
  },
  {
    id: STEP_RM_COMPUTE_VIRTUAL_MACHINES,
    name: "Virtual Machines",
    types: [
      VIRTUAL_MACHINE_ENTITY_TYPE,
      VIRTUAL_MACHINE_DISK_RELATIONSHIP_TYPE,
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_COMPUTE_VIRTUAL_MACHINE_DISKS],
    executionHandler: fetchVirtualMachines,
  },
];
