import {
  createTestIntegrationExecutionContext,
  generateRelationshipType,
  GraphClient,
} from "@jupiterone/jupiter-managed-integration-sdk";

import {
  STORAGE_BLOB_SERVICE_ENTITY_TYPE,
  STORAGE_CONTAINER_ENTITY_TYPE,
  ACCOUNT_ENTITY_TYPE,
} from "../../jupiterone";
import {
  fetchOldData,
  popOldContainerEntity,
  popOldStorageServiceEntity,
  popOldAccountServiceRelationship,
  popOldServiceContainerRelationship,
} from "./oldData";

test("oldData can be created and have its entities popped", async () => {
  const context = createTestIntegrationExecutionContext();
  spyOnFindByType(context.clients.getClients().graph, "findEntitiesByType", {
    [STORAGE_BLOB_SERVICE_ENTITY_TYPE]: serviceEntities,
    [STORAGE_CONTAINER_ENTITY_TYPE]: containerEntities,
  });
  spyOnFindByType(
    context.clients.getClients().graph,
    "findRelationshipsByType",
    {
      [accountServiceRelationshipType]: accountServiceRelationships,
      [serviceContainerRelationshipType]: serviceContainerRelationships,
    },
  );

  const oldData = await fetchOldData(context.clients.getClients().graph, {
    _type: ACCOUNT_ENTITY_TYPE,
  } as any);

  expect(oldData).toEqual({
    metadata: {
      lengths: {
        serviceEntityMap: 2,
        accountServiceRelationshipMap: 2,
        containerEntityMap: 2,
        serviceContainerRelationshipMap: 2,
      },
    },
    serviceEntityMap: {
      dreams_in_boxes: { _key: "dreams_in_boxes" },
      rear_view_window_friends: { _key: "rear_view_window_friends" },
    },
    accountServiceRelationshipMap: {
      duct_tape_heart: { _key: "duct_tape_heart" },
      red_line_sky: { _key: "red_line_sky" },
    },
    containerEntityMap: {
      tire_smoke_nicotine: { _key: "tire_smoke_nicotine" },
      black_teeth_history: { _key: "black_teeth_history" },
    },
    serviceContainerRelationshipMap: {
      scattered_cockroach_memories: { _key: "scattered_cockroach_memories" },
      one_sofa_living_room: { _key: "one_sofa_living_room" },
    },
  });

  popOldStorageServiceEntity(oldData, { _key: "dreams_in_boxes" } as any);
  popOldAccountServiceRelationship(oldData, { _key: "duct_tape_heart" } as any);
  popOldContainerEntity(oldData, { _key: "tire_smoke_nicotine" } as any);
  popOldServiceContainerRelationship(oldData, {
    _key: "scattered_cockroach_memories",
  } as any);

  expect(oldData).toEqual({
    metadata: {
      lengths: {
        serviceEntityMap: 1,
        accountServiceRelationshipMap: 1,
        containerEntityMap: 1,
        serviceContainerRelationshipMap: 1,
      },
    },
    serviceEntityMap: {
      rear_view_window_friends: { _key: "rear_view_window_friends" },
    },
    accountServiceRelationshipMap: {
      red_line_sky: { _key: "red_line_sky" },
    },
    containerEntityMap: {
      black_teeth_history: { _key: "black_teeth_history" },
    },
    serviceContainerRelationshipMap: {
      one_sofa_living_room: { _key: "one_sofa_living_room" },
    },
  });
});

function spyOnFindByType(
  graph: GraphClient,
  funcToSpy: "findEntitiesByType" | "findRelationshipsByType",
  objectsByType: { [type: string]: any[] },
) {
  // eslint-disable-next-line @typescript-eslint/require-await
  jest.spyOn(graph, funcToSpy).mockImplementation(async t => {
    const typeString = t as string;
    if (objectsByType[typeString]) {
      return objectsByType[typeString];
    }

    throw new Error("Received unexpected type");
  });
}

const serviceEntities: any[] = [
  { _key: "dreams_in_boxes" },
  { _key: "rear_view_window_friends" },
];

const containerEntities: any[] = [
  { _key: "tire_smoke_nicotine" },
  { _key: "black_teeth_history" },
];

const accountServiceRelationshipType = generateRelationshipType(
  "HAS",
  { _type: ACCOUNT_ENTITY_TYPE },
  STORAGE_BLOB_SERVICE_ENTITY_TYPE,
);

const accountServiceRelationships: any[] = [
  { _key: "duct_tape_heart" },
  { _key: "red_line_sky" },
];

const serviceContainerRelationshipType = generateRelationshipType(
  "HAS",
  STORAGE_BLOB_SERVICE_ENTITY_TYPE,
  STORAGE_CONTAINER_ENTITY_TYPE,
);

const serviceContainerRelationships: any[] = [
  { _key: "scattered_cockroach_memories" },
  { _key: "one_sofa_living_room" },
];
