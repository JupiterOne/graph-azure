import { createGraphClient } from "../azure/graph/client";
import {
  createAccountEntity,
  createAccountEntityWithOrganization,
} from "../converters";
import { IntegrationStepExecutionContext } from "@jupiterone/integration-sdk";

export default async function fetchAccount(
  executionContext: IntegrationStepExecutionContext,
): Promise<void> {
  const {
    logger,
    instance,
    instance: { config },
    jobState,
  } = executionContext;

  const graphClient = createGraphClient(logger, config);

  try {
    const organization = await graphClient.fetchOrganization();
    await jobState.addEntities([
      createAccountEntityWithOrganization(instance, organization),
    ]);
  } catch (err) {
    // TODO logger.authError()
    await jobState.addEntities([createAccountEntity(instance)]);
  }
}
