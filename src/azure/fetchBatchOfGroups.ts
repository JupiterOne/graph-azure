import {
  IntegrationStepExecutionResult,
  IntegrationStepIterationState,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { AzureExecutionContext } from "../types";
import fetchBatchOfResources from "./fetchBatchOfResources";

export default async function fetchBatchOfGroups(
  executionContext: AzureExecutionContext,
  iterationState: IntegrationStepIterationState,
): Promise<IntegrationStepExecutionResult> {
  return fetchBatchOfResources(
    executionContext,
    iterationState,
    "groups",
    (azure, options) => azure.fetchGroups(options),
  );
}
