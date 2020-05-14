import { IntegrationValidationError } from "@jupiterone/integration-sdk";
import { createMockExecutionContext } from "@jupiterone/integration-sdk/testing";

import validateInvocation from "./validateInvocation";

it("should reject", async () => {
  const executionContext = createMockExecutionContext({
    instanceConfig: {},
  });

  try {
    await validateInvocation(executionContext);
  } catch (e) {
    expect(e instanceof IntegrationValidationError).toBe(true);
  }
});

it("auth error", async () => {
  const executionContext = createMockExecutionContext({
    instanceConfig: {
      clientId: "INVALID",
      clientSecret: "INVALID",
      directoryId: "INVALID",
    },
  });

  try {
    await validateInvocation(executionContext);
  } catch (e) {
    expect(e instanceof IntegrationValidationError).toBe(true);
  }
});
