import { IntegrationExecutionResult } from "@jupiterone/jupiter-managed-integration-sdk";

import { createAccountEntity } from "../converters";
import { ACCOUNT_ENTITY_TYPE } from "../jupiterone";
import { AzureExecutionContext } from "../types";

export default async function synchronizeAccount(
  executionContext: AzureExecutionContext,
): Promise<IntegrationExecutionResult> {
  const { instance, graph, persister } = executionContext;

  const oldAccounts = await graph.findEntitiesByType(ACCOUNT_ENTITY_TYPE);

  const operationResults = await persister.publishEntityOperations(
    persister.processEntities(oldAccounts, [createAccountEntity(instance)]),
  );

  return {
    operations: operationResults,
  };
}
