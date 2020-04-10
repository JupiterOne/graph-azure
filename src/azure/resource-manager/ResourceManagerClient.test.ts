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
import { Server, Database } from "@azure/arm-sql/esm/models";

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

describe("iterateSqlServers", () => {
  test("all", async () => {
    p = polly(__dirname, "iterateSqlServers");

    const client = new ResourceManagerClient(config, createTestLogger());

    const resources: Server[] = [];
    await client.iterateSqlServers(e => {
      resources.push(e);
    });

    expect(resources).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: "j1dev-sqlserver",
        tags: expect.objectContaining({
          environment: "j1dev",
        }),
      }),
    ]);
  }, 10000);
});

describe("iterateSqlDatabases", () => {
  const server: Server = {
    kind: "v12.0",
    administratorLogin: "?wJ@=_6Yxt#&Y",
    version: "12.0",
    state: "Ready",
    fullyQualifiedDomainName: "j1dev-sqlserver.database.windows.net",
    location: "eastus",
    tags: { environment: "j1dev" },
    id:
      "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Sql/servers/j1dev-sqlserver",
    name: "j1dev-sqlserver",
    type: "Microsoft.Sql/servers",
  };

  test("all", async () => {
    p = polly(__dirname, "iterateSqlDatabases");

    const client = new ResourceManagerClient(config, createTestLogger());

    const resources: Database[] = [];
    await client.iterateSqlDatabases(server, e => {
      resources.push(e);
    });

    expect(resources).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: "j1dev-sqldatabase",
        tags: expect.objectContaining({
          environment: "j1dev",
        }),
      }),
      expect.objectContaining({
        id: expect.any(String),
        name: "master",
      }),
    ]);
  });

  test("server not found", async () => {
    p = polly(__dirname, "iterateSqlDatabasesServerNotFound", {
      recordFailedRequests: true,
    });

    const client = new ResourceManagerClient(config, createTestLogger());

    const iteratee = jest.fn();
    await client.iterateSqlDatabases(
      {
        ...server,
        id:
          "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Sql/servers/j1dev-sqlserver-notfound",
        name: "j1dev-sqlserver-notfound",
      },
      iteratee,
    );

    expect(iteratee).not.toHaveBeenCalled();
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

  // skipped because jest.useFakeTimers() wouldn't work
  test.skip(
    "retry",
    async () => {
      // jest.useFakeTimers();

      p = polly(__dirname, "iterateStorageBlobContainersRetry", {
        recordFailedRequests: true,
      });

      const client = new ResourceManagerClient(config, createTestLogger());

      let containers: BlobContainer[] = [];

      // Get past the 100/5 min limit, be sure we get more than 100 just over 5 minutes
      for (let index = 0; index < 103; index++) {
        containers = [];
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
      }

      expect(containers).toEqual([
        expect.objectContaining({
          type: "Microsoft.Storage/storageAccounts/blobServices/containers",
        }),
        expect.objectContaining({
          type: "Microsoft.Storage/storageAccounts/blobServices/containers",
        }),
      ]);
    },
    1000 * 1000, // allow this test to run long enough to hit the limit
  );
});
