import { Polly } from "@pollyjs/core";
import polly from "../../../test/helpers/polly";
import config from "../../../test/integrationInstanceConfig";

import { CosmosDBClient } from "./client";
import { createTestLogger } from "@jupiterone/jupiter-managed-integration-sdk";
import { DatabaseAccountGetResults } from "@azure/arm-cosmosdb/esm/models";

let p: Polly;

afterEach(async () => {
  await p.stop();
});

describe("iterateAccounts", () => {
  test("all", async () => {
    p = polly(__dirname, "iterateAccounts");

    const client = new CosmosDBClient(config, createTestLogger(), true);

    const resources: DatabaseAccountGetResults[] = [];
    await client.iterateAccounts((e) => {
      resources.push(e);
    });

    expect(resources).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: "j1dev",
        tags: expect.objectContaining({
          environment: "j1dev",
        }),
      }),
    ]);
  });
});
