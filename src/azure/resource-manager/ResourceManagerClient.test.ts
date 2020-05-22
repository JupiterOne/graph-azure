import { MySQLManagementModels } from "@azure/arm-mysql";
import {
  Database as SQLDatabase,
  Server as SQLServer,
} from "@azure/arm-sql/esm/models";
import { createTestLogger } from "@jupiterone/jupiter-managed-integration-sdk";
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
  p.server.any().on("request", (_req) => {
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

describe("iterateMySqlServers", () => {
  test("all", async () => {
    p = polly(__dirname, "iterateMySqlServers");

    const client = new ResourceManagerClient(config, createTestLogger());

    const resources: MySQLManagementModels.Server[] = [];
    await client.iterateMySqlServers((e) => {
      resources.push(e);
    });

    expect(resources).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: "j1dev-mysqlserver",
        tags: expect.objectContaining({
          environment: "j1dev",
        }),
      }),
    ]);
  }, 10000);
});

describe("iterateMySqlDatabases", () => {
  const server: MySQLManagementModels.Server = {
    sku: {
      name: "B_Gen5_2",
      tier: "Basic",
      family: "Gen5",
      capacity: 2,
    },
    location: "eastus",
    tags: {
      environment: "j1dev",
    },
    id:
      "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver",
    name: "j1dev-mysqlserver",
    type: "Microsoft.DBforMySQL/servers",
    administratorLogin: "WbybVQKHZg59K",
    storageProfile: {
      storageMB: 5120,
      backupRetentionDays: 7,
      geoRedundantBackup: "Disabled",
      storageAutogrow: "Enabled",
    },
    version: "5.7",
    sslEnforcement: "Enabled",
    userVisibleState: "Ready",
    fullyQualifiedDomainName: "j1dev-mysqlserver.mysql.database.azure.com",
    earliestRestoreDate: new Date("2020-04-10T17:51:42.207+00:00"),
    replicationRole: "",
    masterServerId: "",
  };

  test("all", async () => {
    p = polly(__dirname, "iterateMySqlDatabases");

    const client = new ResourceManagerClient(config, createTestLogger());

    const resources: MySQLManagementModels.Database[] = [];
    await client.iterateMySqlDatabases(server, (e) => {
      resources.push(e);
    });

    expect(resources).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: "information_schema",
      }),

      expect.objectContaining({
        id: expect.any(String),
        name: "j1dev-mysqldb",
      }),

      expect.objectContaining({
        id: expect.any(String),
        name: "mysql",
      }),

      expect.objectContaining({
        id: expect.any(String),
        name: "performance_schema",
      }),

      expect.objectContaining({
        id: expect.any(String),
        name: "sys",
      }),
    ]);
  });

  test("502 The issue encountered for 'Microsoft.DBforMySQL'; cannot fulfill the request", async () => {
    p = polly(__dirname, "iterateMySqlDatabasesCannotFulfillRequest");
    p.server
      .get(
        "https://management.azure.com/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver/databases?api-version=2017-12-01",
      )
      .intercept((req, res) => {
        res.status(502).json({
          error: {
            code: "BadGateway",
            message:
              "The issue encountered for 'Microsoft.DBforMySQL'; cannot fulfill the request.",
          },
        });
      });

    const client = new ResourceManagerClient(config, createTestLogger(), true);

    const iteratee = jest.fn();
    await expect(
      client.iterateMySqlDatabases(server, iteratee),
    ).rejects.toThrow();
  });
});

describe("iterateSqlServers", () => {
  test("all", async () => {
    p = polly(__dirname, "iterateSqlServers");

    const client = new ResourceManagerClient(config, createTestLogger());

    const resources: SQLServer[] = [];
    await client.iterateSqlServers((e) => {
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
  const server: SQLServer = {
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

    const resources: SQLDatabase[] = [];
    await client.iterateSqlDatabases(server, (e) => {
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
