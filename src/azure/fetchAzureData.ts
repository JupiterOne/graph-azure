import AzureClient from "./AzureClient";
import {
  AzureDataModel,
  Group,
  GroupMembers,
  User,
  UserManager,
} from "./types";

export default async function fetchAzureData(
  client: AzureClient,
): Promise<AzureDataModel> {
  const [groups, users] = await Promise.all([
    client.fetchGroups(),
    client.fetchUsers(),
  ]);

  let groupsMembers;
  if (groups) {
    groupsMembers = await Promise.all(
      groups.map((group: Group) => fetchGroupMembers(group, client)),
    );
  }

  let usersManagers;
  if (users) {
    usersManagers = await Promise.all(
      users.map((user: User) => fetchUserManager(user, client)),
    );
  }

  return { groups, groupsMembers, users, usersManagers };
}

async function fetchGroupMembers(
  group: Group,
  client: AzureClient,
): Promise<GroupMembers> {
  const members = await client.fetchMembers(group.id);

  return {
    group,
    members,
  };
}

async function fetchUserManager(
  user: User,
  client: AzureClient,
): Promise<UserManager> {
  const manager = await client.fetchUserManager(user);

  return {
    user,
    manager,
  };
}
