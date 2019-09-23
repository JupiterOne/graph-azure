import { VirtualMachine } from "@azure/arm-compute/esm/models";
import { Polly } from "@pollyjs/core";

import polly from "../../../test/helpers/polly";
import config from "../../../test/integrationInstanceConfig";
import createComputeClient from "./createComputeClient";
import iterateVirtualMachines from "./iterateVirtualMachines";

let p: Polly;

afterEach(async () => {
  await p.stop();
});

describe("iterateVirtualMachines", () => {
  test("all", async () => {
    p = polly(__dirname, "iterateVirtualMachines");

    const client = await createComputeClient(config);

    const vms: VirtualMachine[] = [];
    await iterateVirtualMachines(client, e => {
      vms.push(e);
    });

    expect(vms).toEqual([
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
