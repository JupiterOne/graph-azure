import { PersistedObjectAssignable } from "@jupiterone/jupiter-managed-integration-sdk/jupiter-types";
import {
  EntityFromIntegration,
  generateRelationshipType,
  IntegrationRelationship,
  GraphClient,
} from "@jupiterone/jupiter-managed-integration-sdk";

import {
  AccountEntity,
  STORAGE_BLOB_SERVICE_ENTITY_TYPE,
  STORAGE_CONTAINER_ENTITY_TYPE,
} from "../../jupiterone";

type EntityOrRelationship = EntityFromIntegration | IntegrationRelationship;

interface OldDataMeta {
  metadata: {
    lengths: Record<keyof OldDataMaps, number>;
  };
}

interface OldDataMaps {
  serviceEntityMap: Record<string, EntityFromIntegration>;
  accountServiceRelationshipMap: Record<string, IntegrationRelationship>;
  containerEntityMap: Record<string, EntityFromIntegration>;
  serviceContainerRelationshipMap: Record<string, IntegrationRelationship>;
}

export type OldData = OldDataMaps & OldDataMeta;

export async function fetchOldData(
  graph: GraphClient,
  account: AccountEntity,
): Promise<OldData> {
  const [
    storageServiceEntities,
    accountServiceRelationships,
    storageContainerEntities,
    serviceContainerRelationships,
  ] = await Promise.all([
    graph.findEntitiesByType(STORAGE_BLOB_SERVICE_ENTITY_TYPE),
    graph.findRelationshipsByType(
      generateRelationshipType(
        "HAS",
        account,
        STORAGE_BLOB_SERVICE_ENTITY_TYPE,
      ),
    ),
    graph.findEntitiesByType(STORAGE_CONTAINER_ENTITY_TYPE),
    graph.findRelationshipsByType(
      generateRelationshipType(
        "HAS",
        STORAGE_BLOB_SERVICE_ENTITY_TYPE,
        STORAGE_CONTAINER_ENTITY_TYPE,
      ),
    ),
  ]);

  return {
    metadata: {
      lengths: {
        serviceEntityMap: storageServiceEntities.length,
        accountServiceRelationshipMap: accountServiceRelationships.length,
        containerEntityMap: storageContainerEntities.length,
        serviceContainerRelationshipMap: serviceContainerRelationships.length,
      },
    },
    serviceEntityMap: createObjectByKeyMap(storageServiceEntities),
    accountServiceRelationshipMap: createObjectByKeyMap(
      accountServiceRelationships,
    ),
    containerEntityMap: createObjectByKeyMap(storageContainerEntities),
    serviceContainerRelationshipMap: createObjectByKeyMap(
      serviceContainerRelationships,
    ),
  };
}

export const popOldStorageServiceEntity = popOldData<EntityFromIntegration>(
  "serviceEntityMap",
);
export const popOldAccountServiceRelationship = popOldData<
  IntegrationRelationship
>("accountServiceRelationshipMap");
export const popOldContainerEntity = popOldData<EntityFromIntegration>(
  "containerEntityMap",
);
export const popOldServiceContainerRelationship = popOldData<
  IntegrationRelationship
>("serviceContainerRelationshipMap");

export function cloneOldData({
  oldData,
  mapToUpdate,
  updatedMap,
}: {
  oldData: OldData;
  mapToUpdate?: keyof OldDataMaps;
  updatedMap?: Record<string, EntityOrRelationship>;
}): OldData {
  const oldDataClone = {
    ...oldData,
    metadata: {
      ...oldData.metadata,
      lengths: {
        ...oldData.metadata.lengths,
      },
    },
  };

  if (mapToUpdate && updatedMap) {
    oldDataClone[mapToUpdate] = updatedMap;
    oldDataClone.metadata.lengths[mapToUpdate] =
      oldData.metadata.lengths[mapToUpdate] - 1;
  }

  return oldDataClone;
}

function createObjectByKeyMap<T extends PersistedObjectAssignable>(
  objects: T[],
): Record<string, T> {
  const map: Record<string, T> = {};
  objects.forEach(obj => {
    map[obj._key] = obj;
  });
  return map;
}

function popOldData<T extends EntityOrRelationship>(
  mapKey: keyof OldDataMaps,
): {
  (oldData: OldData, newData: PersistedObjectAssignable): [
    OldData,
    T | undefined
  ];
} {
  return (oldData, newData): [OldData, T] => {
    const map = oldData[mapKey];
    const obj = map[newData._key];

    const { [newData._key]: _, ...updatedMap } = map;
    const updatedOldData = cloneOldData({
      oldData,
      mapToUpdate: mapKey,
      updatedMap,
    });

    return [updatedOldData, obj as T];
  };
}
