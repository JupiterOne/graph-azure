import nock from "nock";

import { createTestLogger } from "@jupiterone/jupiter-managed-integration-sdk";

import AzureClient from "./AzureClient";

const CLIENT_ID = process.env.AZURE_CLOUD_LOCAL_EXECUTION_CLIENT_ID || "token";
const CLIENT_SECRET =
  process.env.AZURE_CLOUD_LOCAL_EXECUTION_CLIENT_SECRET || "secret";
const DIRECTORY_ID =
  process.env.AZURE_CLOUD_LOCAL_EXECUTION_DIRECTORY_ID || "directory";

const logger = createTestLogger();

function createAzureClient() {
  return new AzureClient(CLIENT_ID, CLIENT_SECRET, DIRECTORY_ID, logger);
}

function createClientWithAuth() {
  nock("https://login.microsoftonline.com")
    .post(`/${DIRECTORY_ID}/oauth2/v2.0/token`)
    .reply(
      200,
      '{"token_type": "Bearer","expires_in": 3600,"ext_expires_in": 3600,"access_token": "token"}',
    );

  return createAzureClient();
}

afterAll(() => {
  nock.restore();
});

beforeAll(() => {
  nock.back.fixtures = `${__dirname}/../../test/fixtures/`;
  process.env.CI ? nock.back.setMode("lockdown") : nock.back.setMode("record");
});

describe("authentication", () => {
  test("occurs when request is made and not already authenticated", async () => {
    const client = createAzureClient();

    const loginScope = nock("https://login.microsoftonline.com")
      .post(`/${DIRECTORY_ID}/oauth2/v2.0/token`)
      .reply(
        200,
        '{"token_type": "Bearer","expires_in": 3600,"ext_expires_in": 3600,"access_token": "token"}',
      );

    const graphScope = nock("https://graph.microsoft.com")
      .get(`/v1.0/users`)
      .reply(404);

    const response = await client.fetchUsers();
    loginScope.done();
    graphScope.done();

    expect(response).toEqual({
      resources: [],
    });
  });
});

describe("fetchUsers", () => {
  test("default options", async () => {
    const { nockDone } = await nock.back("users-ok.json");
    const client = createClientWithAuth();
    const response = await client.fetchUsers();
    expect(response).toEqual({
      nextLink: undefined,
      resources: expect.any(Array),
    });
    nockDone();
  });

  test("pagination", async () => {
    const { nockDone } = await nock.back("users-paginate-ok.json");
    const client = createClientWithAuth();
    const response = await client.fetchUsers({ limit: 1 });
    expect(response).toEqual({
      nextLink: expect.any(String),
      resources: expect.any(Array),
    });

    const pageOptions = {
      nextLink: response && response.nextLink,
    };
    const response2 = await client.fetchUsers(pageOptions);
    expect(response2).toMatchObject({
      resources: expect.any(Array),
    });

    nockDone();
  });

  test("404 answers empty collection", async () => {
    const client = createClientWithAuth();

    const scope = nock("https://graph.microsoft.com")
      .get(`/v1.0/users`)
      .reply(404);

    const response = await client.fetchUsers();
    scope.done();

    expect(response).toEqual({
      resources: [],
    });
  });

  test("unexpected error answers undefined, logs warning", async () => {
    const client = createClientWithAuth();

    nock("https://graph.microsoft.com")
      .get(`/v1.0/users`)
      .reply(500);

    const warn = jest.spyOn(logger, "warn");

    const response = await client.fetchUsers();
    expect(response).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]).toEqual([
      {
        err: expect.any(Error),
        method: "get",
        url: "https://graph.microsoft.com/v1.0/users",
      },
      "Azure resource request failed",
    ]);
  });
});

describe("fetchGroups", () => {
  test("default options", async () => {
    const { nockDone } = await nock.back("groups-ok.json");
    const client = createClientWithAuth();
    const response = await client.fetchGroups();
    expect(response).toEqual({
      nextLink: undefined,
      resources: expect.any(Array),
    });
    nockDone();
  });

  test("pagination", async () => {
    const { nockDone } = await nock.back("groups-paginate-ok.json");
    const client = createClientWithAuth();
    const response = await client.fetchGroups({ limit: 1 });
    expect(response).toEqual({
      nextLink: expect.any(String),
      resources: expect.any(Array),
    });

    const pageOptions = {
      nextLink: response && response.nextLink,
    };
    const response2 = await client.fetchGroups(pageOptions);
    expect(response2).toMatchObject({
      resources: expect.any(Array),
    });
    nockDone();
  });

  test("404 answers empty collection", async () => {
    const client = createClientWithAuth();
    const scope = nock("https://graph.microsoft.com")
      .get(`/v1.0/groups`)
      .reply(404);

    const response = await client.fetchGroups();
    scope.done();

    expect(response).toEqual({
      resources: [],
    });
  });

  test("unexpected error answers undefined, logs warning", async () => {
    const client = createClientWithAuth();

    nock("https://graph.microsoft.com")
      .get(`/v1.0/groups`)
      .reply(500);

    const warn = jest.spyOn(logger, "warn");

    const response = await client.fetchGroups();
    expect(response).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]).toEqual([
      {
        err: expect.any(Error),
        method: "get",
        url: "https://graph.microsoft.com/v1.0/groups",
      },
      "Azure resource request failed",
    ]);
  });
});

describe("fetchGroupMembers", () => {
  test("default options", async () => {
    const { nockDone } = await nock.back("members-ok.json");
    const client = createClientWithAuth();
    const response = await client.fetchGroupMembers(
      "58e48aba-cd45-440f-a851-2bf9715fadc1",
    );
    expect(response).toEqual({
      nextLink: undefined,
      resources: expect.any(Array),
    });
    nockDone();
  });

  test("pagination", async () => {
    const { nockDone } = await nock.back("members-paginate-ok.json");
    const client = createClientWithAuth();
    const response = await client.fetchGroupMembers(
      "1c417feb-b04f-46c9-a747-614d6d03f348",
      { limit: 1 },
    );
    expect(response).toEqual({
      nextLink: expect.any(String),
      resources: expect.any(Array),
    });

    const pageOptions = {
      nextLink: response && response.nextLink,
    };
    const response2 = await client.fetchGroupMembers(
      "58e48aba-cd45-440f-a851-2bf9715fadc1",
      pageOptions,
    );
    expect(response2).toMatchObject({
      resources: expect.any(Array),
    });
    nockDone();
  });

  test("single selected property", async () => {
    const { nockDone } = await nock.back("members-select-one-ok.json");
    const client = createClientWithAuth();
    const response = await client.fetchGroupMembers(
      "1c417feb-b04f-46c9-a747-614d6d03f348",
      { select: "id" },
    );
    expect(response).toEqual({
      nextLink: undefined,
      resources: expect.any(Array),
    });
    const resource = response!.resources[0];
    expect(resource).toMatchObject({
      id: expect.any(String),
    });
    expect(resource.displayName).toBeUndefined();
    nockDone();
  });

  test("multiple selected properties", async () => {
    const { nockDone } = await nock.back("members-select-multiple-ok.json");
    const client = createClientWithAuth();
    const response = await client.fetchGroupMembers(
      "1c417feb-b04f-46c9-a747-614d6d03f348",
      { select: ["id", "displayName"] },
    );
    expect(response).toEqual({
      nextLink: undefined,
      resources: expect.any(Array),
    });
    expect(response!.resources[0]).toMatchObject({
      id: expect.any(String),
      displayName: expect.any(String),
    });
    nockDone();
  });

  test("404 answers empty collection", async () => {
    const client = createClientWithAuth();
    const scope = nock("https://graph.microsoft.com")
      .get(`/v1.0/groups/58e48aba-cd45-440f-a851-2bf9715fadc1/members`)
      .reply(404);

    const response = await client.fetchGroupMembers(
      "58e48aba-cd45-440f-a851-2bf9715fadc1",
    );
    scope.done();

    expect(response).toEqual({
      resources: [],
    });
  });

  test("unexpected error answers undefined, logs warning", async () => {
    const client = createClientWithAuth();

    nock("https://graph.microsoft.com")
      .get(`/v1.0/groups/58e48aba-cd45-440f-a851-2bf9715fadc1/members`)
      .reply(500);

    const warn = jest.spyOn(logger, "warn");

    const response = await client.fetchGroupMembers(
      "58e48aba-cd45-440f-a851-2bf9715fadc1",
    );
    expect(response).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]).toEqual([
      {
        err: expect.any(Error),
        method: "get",
        url:
          "https://graph.microsoft.com/v1.0/groups/58e48aba-cd45-440f-a851-2bf9715fadc1/members",
      },
      "Azure resource request failed",
    ]);
  });
});
