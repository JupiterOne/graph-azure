import { IntegrationStepExecutionContext } from "@jupiterone/integration-sdk";

import { AzureClient } from "../azure";
import { createUserEntity } from "../converters";

export default async function fetchUsers(
  executionContext: IntegrationStepExecutionContext,
): Promise<void> {
  const {
    logger,
    instance: { config },
    jobState,
  } = executionContext;

  const azure = new AzureClient(
    config.clientId,
    config.clientSecret,
    config.directoryId,
    logger,
  );

  let nextLink;

  do {
    // TS bug: https://github.com/microsoft/TypeScript/issues/35546
    const promise = azure.fetchUsers({
      nextLink,
    });
    const response = await promise;

    if (response) {
      response.resources.forEach((user) => {
        jobState.addEntities([createUserEntity(user)]);
      });
      nextLink = response.nextLink;
    }
  } while (nextLink);
}
