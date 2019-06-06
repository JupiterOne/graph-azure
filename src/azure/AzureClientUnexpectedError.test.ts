import { createTestLogger } from "@jupiterone/jupiter-managed-integration-sdk";
import nock from "nock";
import AzureClient from "./AzureClient";

const CLIENT_ID =
  process.env.AZURE_CLOUD_LOCAL_EXECUTION_CLIENT_ID || "example_token";
const CLIENT_SECRET =
  process.env.AZURE_CLOUD_LOCAL_EXECUTION_CLIENT_SECRET || "example_secret";
const DIRRECTORY_ID =
  process.env.AZURE_CLOUD_LOCAL_EXECUTION_DIRRECTORY_ID || "example_dirrectory";

const logger = createTestLogger();

jest.mock("node-fetch", () => {
  return jest.fn().mockImplementation((url: string) => {
    throw new Error();
  });
});

describe("AzureClient fetch data with unknown error", () => {
  beforeAll(() => {
    nock.back.fixtures = `${__dirname}/../../test/fixtures/`;
    process.env.CI
      ? nock.back.setMode("lockdown")
      : nock.back.setMode("record");
  });

  async function getClient() {
    const azure = new AzureClient(
      CLIENT_ID,
      CLIENT_SECRET,
      DIRRECTORY_ID,
      logger,
    );

    return azure;
  }

  test("fetchUsers with a error", async () => {
    const client = await getClient();
    const response = await client.fetchUsers();
    expect(response).toEqual(undefined);
  });

  test("fetchGroups with a error", async () => {
    const client = await getClient();

    const response = await client.fetchGroups();

    expect(response).toEqual(undefined);
  });

  test("fetchMembers with a error", async () => {
    const client = await getClient();

    const response = await client.fetchMembers(
      "89fac263-2430-48fd-9278-dacfdfc89792",
    );

    expect(response).toEqual(undefined);
  });

  afterAll(() => {
    nock.restore();
  });
});
