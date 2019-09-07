import {
  IntegrationStepExecutionResult,
  IntegrationStepIterationState,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { AzureExecutionContext } from "../types";
import fetchBatchOfResources from "./fetchBatchOfResources";

export default async function fetchBatchOfUsers(
  executionContext: AzureExecutionContext,
  iterationState: IntegrationStepIterationState,
): Promise<IntegrationStepExecutionResult> {
  return fetchBatchOfResources(
    executionContext,
    iterationState,
    "users",
    (azure, options) => azure.fetchUsers(options),
  );
}
