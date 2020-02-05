import { createTestIntegrationExecutionContext } from "@jupiterone/jupiter-managed-integration-sdk";

import {
  AD_FETCH_GROUP_MEMBERS,
  AD_FETCH_GROUPS,
  AD_FETCH_USERS,
  AD_SYNC_GROUP_MEMBERS,
  AD_SYNC_GROUPS,
  AD_SYNC_USERS,
  RM_SYNC_COMPUTE,
  RM_SYNC_STORAGE,
  RM_SYNC_DATABASES,
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
      [RM_SYNC_COMPUTE]: { disabled: true },
      [RM_SYNC_STORAGE]: { disabled: true },
      [RM_SYNC_DATABASES]: { disabled: true },
    });

    // Verify all but account and cleanup steps (the rest are AD or RM steps)
    // have disable state, to catch failure to add new steps that should be
    // accounted for in determining disablement based on integration config.
    const stepIds = stepFunctionsInvocationConfig
      .integrationStepPhases!.map(phase => phase.steps.map(s => s.id))
      .reduce((a, phaseStepIds) => {
        // replace with flatMap() when available
        a.push(...phaseStepIds);
        return a;
      }, [])
      .filter(e => !/(account|cleanup)/.exec(e));
    expect(Object.keys(states)).toEqual(expect.arrayContaining(stepIds));
  });

  test("ingestActiveDirectory: true", () => {
    const context = createTestIntegrationExecutionContext({
      instance: { config: { ingestActiveDirectory: true } },
    });
    const states = stepFunctionsInvocationConfig.getStepStartStates!(context);
    expect(states).toEqual({
      [RM_SYNC_COMPUTE]: { disabled: true },
      [RM_SYNC_STORAGE]: { disabled: true },
      [RM_SYNC_DATABASES]: { disabled: true },
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
