import { Entity } from "@jupiterone/integration-sdk";

import { IntegrationStepContext } from "../../types";
import { DirectoryGraphClient } from "./client";
import {
  ACCOUNT_ENTITY_TYPE,
  ACCOUNT_GROUP_RELATIONSHIP_TYPE,
  ACCOUNT_USER_RELATIONSHIP_TYPE,
  AD_ACCOUNT,
  AD_GROUP_MEMBERS,
  AD_GROUPS,
  AD_USERS,
  GROUP_ENTITY_TYPE,
  GROUP_MEMBER_ENTITY_TYPE,
  GROUP_MEMBER_RELATIONSHIP_TYPE,
  USER_ENTITY_TYPE,
} from "./constants";
import {
  createAccountEntity,
  createAccountEntityWithOrganization,
  createAccountGroupRelationship,
  createAccountUserRelationship,
  createGroupEntity,
  createGroupMemberRelationship,
  createUserEntity,
} from "./converters";

export * from "./constants";

export async function fetchAccount(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, instance, jobState } = executionContext;
  const graphClient = new DirectoryGraphClient(logger, instance.config);

  let accountEntity: Entity;
  try {
    const organization = await graphClient.fetchOrganization();
    accountEntity = createAccountEntityWithOrganization(instance, organization);
  } catch (err) {
    // TODO logger.authError()
    accountEntity = createAccountEntity(instance);
  }

  await jobState.addEntity(accountEntity);
  await jobState.setData(ACCOUNT_ENTITY_TYPE, accountEntity);
}

export async function fetchUsers(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, instance, jobState } = executionContext;
  const graphClient = new DirectoryGraphClient(logger, instance.config);

  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);
  await graphClient.iterateUsers(async (user) => {
    const userEntity = createUserEntity(user);
    await jobState.addEntity(userEntity);
    await jobState.addRelationship(
      createAccountUserRelationship(accountEntity, userEntity),
    );
  });
}

export async function fetchGroups(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, instance, jobState } = executionContext;
  const graphClient = new DirectoryGraphClient(logger, instance.config);

  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);
  await graphClient.iterateGroups(async (group) => {
    const groupEntity = createGroupEntity(group);
    await jobState.addEntity(groupEntity);
    await jobState.addRelationship(
      createAccountGroupRelationship(accountEntity, groupEntity),
    );
  });
}

export async function fetchGroupMembers(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, instance, jobState } = executionContext;
  const graphClient = new DirectoryGraphClient(logger, instance.config);

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

export const activeDirectorySteps = [
  {
    id: AD_ACCOUNT,
    name: "Active Directory Info",
    types: [ACCOUNT_ENTITY_TYPE],
    executionHandler: fetchAccount,
  },
  {
    id: AD_USERS,
    name: "Active Directory Users",
    types: [USER_ENTITY_TYPE, ACCOUNT_USER_RELATIONSHIP_TYPE],
    dependsOn: [AD_ACCOUNT],
    executionHandler: fetchUsers,
  },
  {
    id: AD_GROUPS,
    name: "Active Directory Groups",
    types: [GROUP_ENTITY_TYPE, ACCOUNT_GROUP_RELATIONSHIP_TYPE],
    dependsOn: [AD_ACCOUNT],
    executionHandler: fetchGroups,
  },
  {
    id: AD_GROUP_MEMBERS,
    name: "Active Directory Group Members",
    types: [GROUP_MEMBER_ENTITY_TYPE, GROUP_MEMBER_RELATIONSHIP_TYPE],
    dependsOn: [AD_GROUPS],
    executionHandler: fetchGroupMembers,
  },
];
