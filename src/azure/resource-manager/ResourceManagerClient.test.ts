import { VirtualMachine } from "@azure/arm-compute/esm/models";
import {
  NetworkInterface,
  PublicIPAddress,
} from "@azure/arm-network/esm/models";
import { Polly } from "@pollyjs/core";

import polly from "../../../test/helpers/polly";
import config from "../../../test/integrationInstanceConfig";
import { ResourceManagerClient } from "./";

let p: Polly;

afterEach(async () => {
  await p.stop();
});

test("client accessToken fetched once and used across resources", async () => {
  let requests = 0;

  p = polly(__dirname, "accessTokenCaching");
  p.server.any().on("request", req => requests++);

  const client = new ResourceManagerClient(config);

  await expect(
    client.iterateNetworkInterfaces(e => undefined),
  ).resolves.toBeUndefined();
  expect(requests).toEqual(3);

  await expect(
    client.iterateNetworkInterfaces(e => undefined),
  ).resolves.toBeUndefined();
  expect(requests).toEqual(4);

  await expect(
    client.iterateVirtualMachines(e => undefined),
  ).resolves.toBeUndefined();
  expect(requests).toEqual(5);
});

describe("iterateNetworkInterfaces", () => {
  test("all", async () => {
    p = polly(__dirname, "iterateNetworkInterfaces");

    const client = new ResourceManagerClient(config);

    const vms: NetworkInterface[] = [];
    await client.iterateNetworkInterfaces(e => {
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

describe("iteratePublicIPAddresses", () => {
  test("all", async () => {
    p = polly(__dirname, "iteratePublicIPAddresses");

    const client = new ResourceManagerClient(config);

    const addresses: PublicIPAddress[] = [];
    await client.iteratePublicIPAddresses(e => {
      addresses.push(e);
    });

    expect(addresses).toEqual([
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

describe("iterateVirtualMachines", () => {
  test("all", async () => {
    p = polly(__dirname, "iterateVirtualMachines");

    const client = new ResourceManagerClient(config);

    const vms: VirtualMachine[] = [];
    await client.iterateVirtualMachines(e => {
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
