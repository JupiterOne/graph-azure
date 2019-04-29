import AzureClient from "./AzureClient";
import { AzureDataModel, Group, GroupMembers } from "./types";

export default async function fetchAzureData(
  client: AzureClient,
): Promise<AzureDataModel> {
  const [groups, users] = await Promise.all([
    client.fetchGroups(),
    client.fetchUsers(),
  ]);

  const groupsMembers = await Promise.all(
    groups.map((group: Group) => fetchGroupMembers(group, client)),
  );

  return { groups, groupsMembers, users };
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
