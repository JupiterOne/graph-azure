import {
  EntityFromIntegration,
  EntityOperation,
  PersisterClient,
  RelationshipOperation,
} from "@jupiterone/jupiter-managed-integration-sdk";

import * as EntityConverters from "../converters/entities";
import * as RelationshipConverters from "../converters/relationships";
import * as Relationships from "../jupiterone/relationships";

import { IntegrationInstance } from "@jupiterone/jupiter-managed-integration-sdk";
import {
  JupiterOneDataModel,
  JupiterOneEntitiesData,
  JupiterOneRelationshipsData,
} from "../jupiterone";

import { AzureDataModel } from "../azure/types";

type EntitiesKeys = keyof JupiterOneEntitiesData;
type RelationshipsKeys = keyof JupiterOneRelationshipsData;

export default async function publishChanges(
  persister: PersisterClient,
  oldData: JupiterOneDataModel,
  azureData: AzureDataModel,
  instance: IntegrationInstance,
) {
  const newData = convert(azureData, instance);

  const entities = createEntitiesOperations(
    oldData.entities,
    newData.entities,
    persister,
  );
  const relationships = createRelationshipsOperations(
    oldData.relationships,
    newData.relationships,
    persister,
  );

  return await persister.publishPersisterOperations([entities, relationships]);
}

function createEntitiesOperations(
  oldData: JupiterOneEntitiesData,
  newData: JupiterOneEntitiesData,
  persister: PersisterClient,
): EntityOperation[] {
  const defatultOperations: EntityOperation[] = [];
  const entities: EntitiesKeys[] = Object.keys(oldData) as EntitiesKeys[];

  return entities.reduce((operations, entityName) => {
    const oldEntities = oldData[entityName];
    const newEntities = newData[entityName];

    if (!oldEntities || !newEntities) {
      return operations;
    }

    return [
      ...operations,
      ...persister.processEntities<EntityFromIntegration>(
        oldEntities,
        newEntities,
      ),
    ];
  }, defatultOperations);
}

function createRelationshipsOperations(
  oldData: JupiterOneRelationshipsData,
  newData: JupiterOneRelationshipsData,
  persister: PersisterClient,
): RelationshipOperation[] {
  const defatultOperations: RelationshipOperation[] = [];
  const relationships: RelationshipsKeys[] = Object.keys(
    oldData,
  ) as RelationshipsKeys[];

  return relationships.reduce((operations, relationshipName) => {
    const oldRelationhips = oldData[relationshipName];
    const newRelationhips = newData[relationshipName];

    if (!oldRelationhips || !newRelationhips) {
      return operations;
    }

    return [
      ...operations,
      ...persister.processRelationships(oldRelationhips, newRelationhips),
    ];
  }, defatultOperations);
}

export function convert(
  azureDataModel: AzureDataModel,
  instance: IntegrationInstance,
): JupiterOneDataModel {
  const entities = convertEntities(azureDataModel, instance);
  const relationships = convertRelationships(azureDataModel, entities);

  return {
    entities,
    relationships,
  };
}

export function convertEntities(
  azureDataModel: AzureDataModel,
  instance: IntegrationInstance,
): JupiterOneEntitiesData {
  return {
    accounts: [EntityConverters.createAccountEntity(instance)],
    groups:
      azureDataModel.groups &&
      EntityConverters.createGroupEntities(azureDataModel.groups),
    users:
      azureDataModel.users &&
      EntityConverters.createUserEntities(azureDataModel.users),
  };
}

export function convertRelationships(
  azureDataModel: AzureDataModel,
  entities: JupiterOneEntitiesData,
): JupiterOneRelationshipsData {
  const account = entities.accounts[0];

  let memberRelationships;
  let groupUserRelationships;
  let groupGroupRelationships;

  if (azureDataModel.groupsMembers) {
    memberRelationships = RelationshipConverters.createGroupMemberRelationships(
      azureDataModel.groupsMembers,
    );

    groupUserRelationships = memberRelationships.filter(
      r => r._type === Relationships.GROUP_USER_RELATIONSHIP_TYPE,
    );

    groupGroupRelationships = memberRelationships.filter(
      r => r._type === Relationships.GROUP_GROUP_RELATIONSHIP_TYPE,
    );
  }

  return {
    accountUserRelationships:
      azureDataModel.users &&
      RelationshipConverters.createAccountUserRelationships(
        azureDataModel.users,
        account,
      ),
    accountGroupRelationships:
      azureDataModel.groups &&
      RelationshipConverters.createAccountGroupRelationships(
        azureDataModel.groups,
        account,
      ),

    userGroupRelationships:
      azureDataModel.groupsMembers &&
      RelationshipConverters.createUserGroupRelationships(
        azureDataModel.groupsMembers,
      ),
    groupUserRelationships,
    groupGroupRelationships,
  };
}
