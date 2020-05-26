import {
  IntegrationExecutionContext,
  StepStartStates,
} from "@jupiterone/integration-sdk";

import {
  AD_ACCOUNT,
  AD_GROUP_MEMBERS,
  AD_GROUPS,
  AD_USERS,
} from "./steps/active-directory";
import {
  RM_COMPUTE_VIRTUAL_MACHINE_DISKS,
  RM_COMPUTE_VIRTUAL_MACHINE_IMAGES,
  RM_COMPUTE_VIRTUAL_MACHINES,
} from "./steps/resource-manager/compute";
import { RM_COMPUTE_NETWORK_RELATIONSHIPS } from "./steps/resource-manager/interservice/constants";
import { RM_KEYVAULT_VAULTS } from "./steps/resource-manager/key-vault";
import {
  RM_NETWORK_INTERFACES,
  RM_NETWORK_LOAD_BALANCERS,
  RM_NETWORK_PUBLIC_IP_ADDRESSES,
  RM_NETWORK_SECURITY_GROUPS,
  RM_NETWORK_VIRTUAL_NETWORKS,
} from "./steps/resource-manager/network";
import { IntegrationConfig } from "./types";

export default function getStepStartStates(
  executionContext: IntegrationExecutionContext<IntegrationConfig>,
): StepStartStates {
  const config = executionContext.instance.config || {};

  const activeDirectory = { disabled: !config.ingestActiveDirectory };
  const resourceManager = {
    disabled: typeof config.subscriptionId !== "string",
  };

  return {
    [AD_ACCOUNT]: { disabled: false },
    [AD_GROUPS]: activeDirectory,
    [AD_GROUP_MEMBERS]: activeDirectory,
    [AD_USERS]: activeDirectory,
    [RM_KEYVAULT_VAULTS]: resourceManager,
    [RM_NETWORK_VIRTUAL_NETWORKS]: resourceManager,
    [RM_NETWORK_SECURITY_GROUPS]: resourceManager,
    [RM_NETWORK_INTERFACES]: resourceManager,
    [RM_NETWORK_PUBLIC_IP_ADDRESSES]: resourceManager,
    [RM_NETWORK_LOAD_BALANCERS]: resourceManager,
    [RM_COMPUTE_VIRTUAL_MACHINE_IMAGES]: resourceManager,
    [RM_COMPUTE_VIRTUAL_MACHINE_DISKS]: resourceManager,
    [RM_COMPUTE_VIRTUAL_MACHINES]: resourceManager,
    [RM_COMPUTE_NETWORK_RELATIONSHIPS]: resourceManager,
  };
}
