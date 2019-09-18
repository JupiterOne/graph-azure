import { IntegrationExecutionResult } from "@jupiterone/jupiter-managed-integration-sdk";

import createGraphClient from "../azure/graph/createGraphClient";
import fetchOrganization from "../azure/graph/fetchOrganization";
import { createAccountEntity } from "../converters";
import { ACCOUNT_ENTITY_TYPE } from "../jupiterone";
import { AzureExecutionContext } from "../types";

export default async function synchronizeAccount(
  executionContext: AzureExecutionContext,
): Promise<IntegrationExecutionResult> {
  const {
    instance,
    graph,
    persister,
    instance: { config },
  } = executionContext;

  const graphClient = await createGraphClient(config);
  const organization = await fetchOrganization(graphClient);
  const newAccount = createAccountEntity(instance, organization);

  const cache = executionContext.clients.getCache();
  await cache.putEntry({ key: "account", data: newAccount });

  const oldAccounts = await graph.findEntitiesByType(ACCOUNT_ENTITY_TYPE);

  const operationResults = await persister.publishEntityOperations(
    persister.processEntities(oldAccounts, [newAccount]),
  );

  return {
    operations: operationResults,
  };
}
