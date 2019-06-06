import { GraphClient } from "@jupiterone/jupiter-managed-integration-sdk";
import * as Entities from "./entities";
import * as Relationships from "./relationships";

export interface JupiterOneEntitiesData {
  accounts: Entities.AccountEntity[];
  groups: Entities.GroupEntity[] | undefined;
  users: Entities.UserEntity[] | undefined;
}

export interface JupiterOneRelationshipsData {
  accountGroupRelationships:
    | Relationships.AccountGroupRelationship[]
    | undefined;
  accountUserRelationships: Relationships.AccountUserRelationship[] | undefined;
  userGroupRelationships: Relationships.UserGroupRelationship[] | undefined;
  groupUserRelationships: Relationships.GroupUserRelationship[] | undefined;
  groupGroupRelationships: Relationships.GroupGroupRelationship[] | undefined;
}

export interface JupiterOneDataModel {
  entities: JupiterOneEntitiesData;
  relationships: JupiterOneRelationshipsData;
}

export default async function fetchEntitiesAndRelationships(
  graph: GraphClient,
): Promise<JupiterOneDataModel> {
  const data: JupiterOneDataModel = {
    entities: await fetchEntities(graph),
    relationships: await fetchRelationships(graph),
  };

  return data;
}

async function fetchEntities(
  graph: GraphClient,
): Promise<JupiterOneEntitiesData> {
  const [accounts, groups, users] = await Promise.all([
    graph.findEntitiesByType<Entities.AccountEntity>(
      Entities.ACCOUNT_ENTITY_TYPE,
    ),
    graph.findEntitiesByType<Entities.GroupEntity>(Entities.GROUP_ENTITY_TYPE),
    graph.findEntitiesByType<Entities.UserEntity>(Entities.USER_ENTITY_TYPE),
  ]);

  return {
    accounts,
    groups,
    users,
  };
}

export async function fetchRelationships(
  graph: GraphClient,
): Promise<JupiterOneRelationshipsData> {
  const [
    accountGroupRelationships,
    accountUserRelationships,
  ] = await Promise.all([
    graph.findRelationshipsByType<Relationships.AccountGroupRelationship>(
      Relationships.ACCOUNT_GROUP_RELATIONSHIP_TYPE,
    ),
    graph.findRelationshipsByType<Relationships.AccountUserRelationship>(
      Relationships.ACCOUNT_USER_RELATIONSHIP_TYPE,
    ),
  ]);

  const [
    userGroupRelationships,
    groupUserRelationships,
    groupGroupRelationships,
  ] = await Promise.all([
    graph.findRelationshipsByType<Relationships.UserGroupRelationship>(
      Relationships.USER_GROUP_RELATIONSHIP_TYPE,
    ),
    graph.findRelationshipsByType<Relationships.GroupUserRelationship>(
      Relationships.GROUP_USER_RELATIONSHIP_TYPE,
    ),
    graph.findRelationshipsByType<Relationships.GroupGroupRelationship>(
      Relationships.GROUP_GROUP_RELATIONSHIP_TYPE,
    ),
  ]);

  return {
    accountGroupRelationships,
    accountUserRelationships,
    userGroupRelationships,
    groupUserRelationships,
    groupGroupRelationships,
  };
}
