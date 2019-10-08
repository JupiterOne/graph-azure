import { createTestIntegrationExecutionContext } from "@jupiterone/jupiter-managed-integration-sdk";

import {
  AD_FETCH_GROUP_MEMBERS,
  AD_FETCH_GROUPS,
  AD_FETCH_USERS,
  AD_SYNC_GROUP_MEMBERS,
  AD_SYNC_GROUPS,
  AD_SYNC_USERS,
  RM_SYNC_RESOURCES,
  stepFunctionsInvocationConfig,
} from "./index";

describe("getStepStartStates", () => {
  test("empty config", () => {
    const context = createTestIntegrationExecutionContext();
    const states = stepFunctionsInvocationConfig.getStepStartStates!(context);
    expect(states).toEqual({
      [AD_FETCH_GROUPS]: { disabled: true },
      [AD_FETCH_GROUP_MEMBERS]: { disabled: true },
      [AD_FETCH_USERS]: { disabled: true },
      [AD_SYNC_GROUPS]: { disabled: true },
      [AD_SYNC_GROUP_MEMBERS]: { disabled: true },
      [AD_SYNC_USERS]: { disabled: true },
      [RM_SYNC_RESOURCES]: { disabled: true },
    });
  });

  test("ingestActiveDirectory: true", () => {
    const context = createTestIntegrationExecutionContext({
      instance: { config: { ingestActiveDirectory: true } },
    });
    const states = stepFunctionsInvocationConfig.getStepStartStates!(context);
    expect(states).toEqual({
      [RM_SYNC_RESOURCES]: { disabled: true },
    });
  });

  test("subscriptionId: 'value'", () => {
    const context = createTestIntegrationExecutionContext({
      instance: { config: { subscriptionId: "1234" } },
    });
    const states = stepFunctionsInvocationConfig.getStepStartStates!(context);
    expect(states).toEqual({
      [AD_FETCH_GROUPS]: { disabled: true },
      [AD_FETCH_GROUP_MEMBERS]: { disabled: true },
      [AD_FETCH_USERS]: { disabled: true },
      [AD_SYNC_GROUPS]: { disabled: true },
      [AD_SYNC_GROUP_MEMBERS]: { disabled: true },
      [AD_SYNC_USERS]: { disabled: true },
    });
  });
});
