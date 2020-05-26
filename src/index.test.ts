/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { createMockExecutionContext } from "@jupiterone/integration-sdk/testing";

import {
  AD_ACCOUNT,
  AD_GROUP_MEMBERS,
  AD_GROUPS,
  AD_USERS,
  invocationConfig,
  RM_COMPUTE_NETWORK_RELATIONSHIPS,
  RM_COMPUTE_VIRTUAL_MACHINE_DISKS,
  RM_COMPUTE_VIRTUAL_MACHINE_IMAGES,
  RM_COMPUTE_VIRTUAL_MACHINES,
  RM_KEYVAULT_VAULTS,
  RM_NETWORK_INTERFACES,
  RM_NETWORK_LOAD_BALANCERS,
  RM_NETWORK_PUBLIC_IP_ADDRESSES,
  RM_NETWORK_SECURITY_GROUPS,
  RM_NETWORK_VIRTUAL_NETWORKS,
} from "./index";
import { IntegrationConfig } from "./types";

describe("getStepStartStates", () => {
  test("empty config", () => {
    const context = createMockExecutionContext<IntegrationConfig>();
    const states = invocationConfig.getStepStartStates!(context);
    expect(states).toEqual({
      [AD_ACCOUNT]: { disabled: false },
      [AD_GROUPS]: { disabled: true },
      [AD_GROUP_MEMBERS]: { disabled: true },
      [AD_USERS]: { disabled: true },
      [RM_KEYVAULT_VAULTS]: { disabled: true },
      [RM_NETWORK_VIRTUAL_NETWORKS]: { disabled: true },
      [RM_NETWORK_SECURITY_GROUPS]: { disabled: true },
      [RM_NETWORK_INTERFACES]: { disabled: true },
      [RM_NETWORK_LOAD_BALANCERS]: { disabled: true },
      [RM_NETWORK_PUBLIC_IP_ADDRESSES]: { disabled: true },
      [RM_COMPUTE_VIRTUAL_MACHINE_IMAGES]: { disabled: true },
      [RM_COMPUTE_VIRTUAL_MACHINE_DISKS]: { disabled: true },
      [RM_COMPUTE_VIRTUAL_MACHINES]: { disabled: true },
      [RM_COMPUTE_NETWORK_RELATIONSHIPS]: { disabled: true },
    });

    // Verify all but account steps (the rest are AD or RM steps) have disable
    // state, to catch failure to add new steps that should be accounted for in
    // determining disablement based on integration config.
    const stepIds = invocationConfig.integrationSteps
      .map((s) => s.id)
      .filter((e) => !/(account)/.test(e));
    expect(Object.keys(states)).toEqual(expect.arrayContaining(stepIds));
  });

  test("ingestActiveDirectory: true", () => {
    const context = createMockExecutionContext<IntegrationConfig>({
      instanceConfig: { ingestActiveDirectory: true } as IntegrationConfig,
    });
    const states = invocationConfig.getStepStartStates!(context);
    expect(states).toEqual({
      [RM_KEYVAULT_VAULTS]: { disabled: true },
      [RM_NETWORK_VIRTUAL_NETWORKS]: { disabled: true },
      [RM_NETWORK_SECURITY_GROUPS]: { disabled: true },
      [RM_NETWORK_INTERFACES]: { disabled: true },
      [RM_NETWORK_LOAD_BALANCERS]: { disabled: true },
      [RM_NETWORK_PUBLIC_IP_ADDRESSES]: { disabled: true },
      [RM_COMPUTE_VIRTUAL_MACHINE_IMAGES]: { disabled: true },
      [RM_COMPUTE_VIRTUAL_MACHINE_DISKS]: { disabled: true },
      [RM_COMPUTE_VIRTUAL_MACHINES]: { disabled: true },
      [RM_COMPUTE_NETWORK_RELATIONSHIPS]: { disabled: true },
    });
  });

  test("subscriptionId: 'value'", () => {
    const context = createMockExecutionContext({
      instanceConfig: { subscriptionId: "1234" } as IntegrationConfig,
    });
    const states = invocationConfig.getStepStartStates!(context);
    expect(states).toEqual({
      [AD_GROUPS]: { disabled: true },
      [AD_GROUP_MEMBERS]: { disabled: true },
      [AD_USERS]: { disabled: true },
    });
  });
});
