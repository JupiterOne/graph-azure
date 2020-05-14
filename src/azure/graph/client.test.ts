import { createTestLogger } from "@jupiterone/jupiter-managed-integration-sdk";
import {
  DirectoryObject,
  DirectoryRole,
  User,
  Group,
} from "@microsoft/microsoft-graph-types";
import { Polly } from "@pollyjs/core";

import polly from "../../../test/helpers/polly";
import config from "../../../test/integrationInstanceConfig";
import { createGraphClient } from "./client";

const logger = createTestLogger();

let p: Polly;

afterEach(async () => {
  await p.stop();
});

test("accessToken fetched and cached", async () => {
  let requests = 0;

  p = polly(__dirname, "createGraphClient");
  p.server.any().on("request", (_req) => {
    requests++;
  });

  const client = createGraphClient(logger, config);
  await expect(client.fetchMetadata()).resolves.toMatchObject({
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata",
  });
  expect(requests).toEqual(2);

  await expect(client.fetchMetadata()).resolves.toMatchObject({
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata",
  });
  expect(requests).toEqual(3);
});

test("fetchOrganization", async () => {
  p = polly(__dirname, "fetchOrganization");

  const client = createGraphClient(logger, config);
  await expect(client.fetchOrganization()).resolves.toMatchObject({
    verifiedDomains: [
      expect.objectContaining({
        name: expect.any(String),
      }),
    ],
  });
});

test("iterateGroups", async () => {
  p = polly(__dirname, "iterateGroups");

  const client = createGraphClient(logger, config);

  const resources: Group[] = [];
  await client.iterateGroups((e) => {
    resources.push(e);
  });

  expect(resources.length).toBeGreaterThan(0);
  resources.forEach((r) => {
    expect(r).toMatchObject({
      displayName: expect.any(String),
    });
  });
});

test("iterateUsers", async () => {
  p = polly(__dirname, "iterateUsers");

  const client = createGraphClient(logger, config);

  const resources: User[] = [];
  await client.iterateUsers((e) => {
    resources.push(e);
  });

  expect(resources.length).toBeGreaterThan(0);
  resources.forEach((r) => {
    expect(r).toMatchObject({
      id: expect.any(String),
    });
  });
});

test("iterateDirectoryRoles", async () => {
  p = polly(__dirname, "iterateDirectoryRoles");

  const client = createGraphClient(logger, config);

  const resources: DirectoryRole[] = [];
  await client.iterateDirectoryRoles((e) => {
    resources.push(e);
  });

  expect(resources.length).toBeGreaterThan(0);
  resources.forEach((r) => {
    expect(r).toMatchObject({
      roleTemplateId: expect.any(String),
    });
  });
});

test("iterateDirectoryRoleMembers", async () => {
  p = polly(__dirname, "iterateDirectoryRoleMembers");

  const client = createGraphClient(logger, config);

  const resources: DirectoryObject[] = [];
  await client.iterateDirectoryRoleMembers(
    "9a4ba32c-28dd-4c30-bc99-f8137845d6bf",
    (e) => {
      resources.push(e);
    },
  );

  expect(resources.length).toBeGreaterThan(0);
  resources.forEach((r) => {
    expect(r).toMatchObject({
      "@odata.type": "#microsoft.graph.user",
    });
  });
});
