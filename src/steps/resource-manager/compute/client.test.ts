import { createMockIntegrationLogger } from "@jupiterone/integration-sdk/testing";

import {
  Recording,
  setupAzureRecording,
} from "../../../../test/helpers/recording";
import config from "../../../../test/integrationInstanceConfig";
import { ComputeClient } from "./client";
import { VirtualMachine, Disk } from "@azure/arm-compute/esm/models";

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

describe("iterateVirtualMachines", () => {
  test("all", async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: "iterateVirtualMachines",
    });

    const client = new ComputeClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const resources: VirtualMachine[] = [];
    await client.iterateVirtualMachines((e) => {
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

describe("iterateVirtualMachineDisks", () => {
  test("all", async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: "iterateVirtualMachineDisks",
    });

    const client = new ComputeClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const resources: Disk[] = [];
    await client.iterateVirtualMachineDisks((e) => {
      resources.push(e);
    });

    expect(resources).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: "j1devOsDisk",
        tags: expect.objectContaining({
          environment: "j1dev",
        }),
      }),
    ]);
  });
});
