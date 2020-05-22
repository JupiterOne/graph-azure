import { NetworkInterface } from "@azure/arm-network/esm/models";
import { createMockIntegrationLogger } from "@jupiterone/integration-sdk/testing";

import {
  Recording,
  setupAzureRecording,
} from "../../../../test/helpers/recording";
import config from "../../../../test/integrationInstanceConfig";
import { NetworkClient } from "./client";

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

describe("iterateNetworkInterfaces", () => {
  test("all", async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: "iterateNetworkInterfaces",
    });

    const client = new NetworkClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const resources: NetworkInterface[] = [];
    await client.iterateNetworkInterfaces((e) => {
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
