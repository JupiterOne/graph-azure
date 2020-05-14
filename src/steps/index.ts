import { createGroupEntity, createUserEntity } from "../converters";
import { IntegrationStepContext } from "../types";

export * from "./fetchAccount";
export * from "./fetchUsers";

export async function fetchAccount(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { graphClient, jobState } = executionContext;

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

export async function fetchUsers(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { graphClient, jobState } = executionContext;

  let nextLink;
  do {
    // TS bug: https://github.com/microsoft/TypeScript/issues/35546
    const promise = graphClient.fetchUsers({
      nextLink,
    });
    const response = await promise;

    if (response) {
      response.resources.forEach((resource) => {
        jobState.addEntity(createUserEntity(resource));
      });
      nextLink = response.nextLink;
    }
  } while (nextLink);
}

export async function fetchGroups(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { graphClient, jobState } = executionContext;

  let nextLink;
  do {
    // TS bug: https://github.com/microsoft/TypeScript/issues/35546
    const promise = graphClient.fetchGroups({
      nextLink,
    });
    const response = await promise;

    if (response) {
      response.resources.forEach((resource) => {
        jobState.addEntity(createGroupEntity(resource));
      });
      nextLink = response.nextLink;
    }
  } while (nextLink);
}
