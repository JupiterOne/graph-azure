import { createTestLogger } from "@jupiterone/jupiter-managed-integration-sdk";

import { VirtualMachine } from "@azure/arm-compute/esm/models";
import {
  NetworkInterface,
  NetworkSecurityGroup,
  PublicIPAddress,
  VirtualNetwork,
} from "@azure/arm-network/esm/models";
import { BlobContainer, StorageAccount } from "@azure/arm-storage/esm/models";
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
  p.server.any().on("request", _req => {
    requests++;
  });

  const client = new ResourceManagerClient(config, createTestLogger());

  await expect(
    client.iterateNetworkInterfaces(() => undefined),
  ).resolves.toBeUndefined();
  expect(requests).toEqual(3);

  await expect(
    client.iterateNetworkInterfaces(() => undefined),
  ).resolves.toBeUndefined();
  expect(requests).toEqual(4);

  await expect(
    client.iterateVirtualMachines(() => undefined),
  ).resolves.toBeUndefined();
  expect(requests).toEqual(5);
});

describe("iterateNetworkInterfaces", () => {
  test("all", async () => {
    p = polly(__dirname, "iterateNetworkInterfaces");

    const client = new ResourceManagerClient(config, createTestLogger());

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

describe("iterateNetworkSecurityGroups", () => {
  test("all", async () => {
    p = polly(__dirname, "iterateNetworkSecurityGroups");

    const client = new ResourceManagerClient(config, createTestLogger());

    const securityGroups: NetworkSecurityGroup[] = [];
    await client.iterateNetworkSecurityGroups(e => {
      securityGroups.push(e);
    });

    expect(securityGroups).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: "j1dev",
        tags: expect.objectContaining({
          environment: "j1dev",
        }),
        // ensure subnet references come back
        subnets: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
          }),
        ]),
      }),
    ]);
  });
});

describe("iteratePublicIPAddresses", () => {
  test("all", async () => {
    p = polly(__dirname, "iteratePublicIPAddresses");

    const client = new ResourceManagerClient(config, createTestLogger());

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

    const client = new ResourceManagerClient(config, createTestLogger());

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

describe("iterateVirtualNetworks", () => {
  test("all", async () => {
    p = polly(__dirname, "iterateVirtualNetworks");

    const client = new ResourceManagerClient(config, createTestLogger());

    const vms: VirtualNetwork[] = [];
    await client.iterateVirtualNetworks(e => {
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

describe("iterateStorageAccounts", () => {
  test("all", async () => {
    p = polly(__dirname, "iterateStorageAccounts");

    const client = new ResourceManagerClient(config, createTestLogger());

    const sa: StorageAccount[] = [];
    await client.iterateStorageAccounts(e => {
      sa.push(e);
    });

    expect(sa).toEqual([
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

describe("iterateStorageBlobContainers", () => {
  test("all", async () => {
    p = polly(__dirname, "iterateStorageBlobContainers");

    const client = new ResourceManagerClient(config, createTestLogger());

    const containers: BlobContainer[] = [];
    await client.iterateStorageBlobContainers(
      {
        id:
          "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev",
        name: "j1dev",
      } as StorageAccount,
      e => {
        containers.push(e);
      },
    );

    expect(containers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.stringMatching(
            /Microsoft\.Storage\/storageAccounts\/j1dev\/blobServices\/default\/containers\/bootdiagnostics-j1dev-/,
          ),
          name: expect.stringMatching(/bootdiagnostics-j1dev-/),
        }),
        expect.objectContaining({
          id:
            "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev/blobServices/default/containers/j1dev",
          name: "j1dev",
        }),
      ]),
    );
  });
});
