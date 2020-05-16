import {
  createAccountEntity,
  createAccountEntityWithOrganization,
  createGroupEntity,
  createGroupMemberRelationship,
  createUserEntity,
  createAccountUserRelationship,
} from "../converters";
import { GROUP_ENTITY_TYPE, ACCOUNT_ENTITY_TYPE } from "../jupiterone";
import { IntegrationStepContext } from "../types";

export async function fetchAccount(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, graphClient, jobState } = executionContext;

  try {
    const organization = await graphClient.fetchOrganization();
    await jobState.addEntity(
      createAccountEntityWithOrganization(instance, organization),
    );
  } catch (err) {
    // TODO logger.authError()
    await jobState.addEntity(createAccountEntity(instance));
  }
}

export async function fetchUsers(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { graphClient, jobState } = executionContext;
  const accountEntity = await jobState.findEntity({ _type: ACCOUNT_ENTITY_TYPE })
  await graphClient.iterateUsers(async (user) => {
    await jobState.addEntity(createUserEntity(user));
    await jobState.addRelationship(createAccountUserRelationship());
  });
}

export async function fetchGroups(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { graphClient, jobState } = executionContext;
  await graphClient.iterateGroups(async (group) => {
    await jobState.addEntity(createGroupEntity(group));
  });
}

export async function fetchGroupMembers(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { graphClient, jobState } = executionContext;
  await jobState.iterateEntities(
    { _type: GROUP_ENTITY_TYPE },
    async (groupEntity) => {
      await graphClient.iterateGroupMembers(
        { groupId: groupEntity.id as string },
        async (groupMember) => {
          await jobState.addRelationship(
            createGroupMemberRelationship(groupEntity, groupMember),
          );
        },
      );
    },
  );
}
