import {
  EntityFromIntegration,
  IntegrationExecutionResult,
  IntegrationInstanceAuthorizationError,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { createGraphClient } from "../azure/graph/client";
import {
  createAccountEntity,
  createAccountEntityWithOrganization,
} from "../converters";
import { ACCOUNT_ENTITY_TYPE } from "../jupiterone";
import { AzureExecutionContext } from "../types";

export default async function synchronizeAccount(
  executionContext: AzureExecutionContext,
): Promise<IntegrationExecutionResult> {
  const {
    logger,
    instance,
    graph,
    persister,
    instance: { config },
  } = executionContext;

  const graphClient = createGraphClient(logger, config);

  let newAccount: EntityFromIntegration;
  let fetchOrganizationError;
  try {
    const organization = await graphClient.fetchOrganization();
    newAccount = createAccountEntityWithOrganization(instance, organization);
  } catch (err) {
    fetchOrganizationError = err;
    newAccount = createAccountEntity(instance);
  }

  const cache = executionContext.clients.getCache();
  await cache.putEntry({ key: "account", data: newAccount });

  const oldAccounts = await graph.findEntitiesByType(ACCOUNT_ENTITY_TYPE);

  const operationResults = await persister.publishEntityOperations(
    persister.processEntities(oldAccounts, [newAccount]),
  );

  if (fetchOrganizationError) {
    throw new IntegrationInstanceAuthorizationError(
      fetchOrganizationError,
      "Organization",
    );
  }

  return {
    operations: operationResults,
  };
}
